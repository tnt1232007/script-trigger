import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/finally';

import { environment } from '../../environments/environment';
import { StoreService } from './store.service';
import { Command } from '../_models/command';
import { Activity } from '../_models/activity';

@Injectable()
export class CommandService {
  public activities: Activity[] = [];

  constructor(private storeService: StoreService) {
    const path = this.getHistoryPath();
    if (!window.fs.existsSync(path))
      this.activities = [];
    window.jsonwrapper.readFile(path, (err, obj) => this.activities = obj);
  }

  public load(): Command[] {
    const path = this.getDatabasePath();
    if (!window.fs.existsSync(path))
      return [];
    const commands: Command[] = window.jsonwrapper.readFileSync(path);
    commands.forEach((command, index) => {
      command.id = index + 1;
    });
    return commands;
  }

  public save(commands: Command[]): void {
    window.jsonwrapper.writeFileSync(this.getDatabasePath(), commands, { spaces: 2 });
  }

  public extractAndRun(voice: string): Observable<any> {
    const allCommands = this.load();
    const commands: Command[] = [];
    for (const command of allCommands) {
      const reg = new RegExp(command.voice, 'i');
      const matches = reg.exec(voice);
      if (matches) {
        command.params = matches.slice(1).join(',');
        command.lastRunAt = new Date();
        command.runs = command.runs ? command.runs + 1 : 1;
        commands.push(command);
      }
    }
    const activity: Activity = {
      commands: commands,
      voice: voice,
      runAt: new Date()
    } as Activity;
    return this.internalRun(activity, ...commands)
      .finally(() => this.save(allCommands));
  }

  public run(...commands: Command[]): Observable<any> {
    const activity: Activity = {
      commands: commands,
      voice: '',
      runAt: new Date()
    } as Activity;
    return this.internalRun(activity, ...commands);
  }

  private internalRun(activity: Activity, ...commands: Command[]): Observable<any> {
    let obs: Observable<any>;
    const ps = new window.powershell({ debugMsg: false });

    if (!commands || commands.length === 0) {
      obs = Observable.empty();
      activity.isSuccess = false;
      activity.response = 'No commands';
    } else {
      for (const cmd of commands) {
        ps.addCommand(cmd.script.format(...cmd.params ? cmd.params.split(',') : []) + ';');
      }
      obs = Observable
        .fromPromise(ps.invoke())
        .do(res => {
          activity.isSuccess = true;
          activity.response = res;
        }, err => {
          activity.isSuccess = false;
          activity.response = err;
        });
    }
    return obs.finally(() => {
      this.activities = this.activities.concat(activity);
      const hour = this.storeService.configuration.clearActivityAfterHours;
      if (hour > 0) {
        const tmp = new Date();
        tmp.setTime(tmp.getTime() + (hour * 60 * 60 * 1000));
        this.activities = this.activities.filter(o => o.runAt < tmp);
      }
      window.jsonwrapper.writeFileSync(this.getHistoryPath(), this.activities, { spaces: 2 });
      ps.dispose();
    });
  }

  private getDatabasePath(): string {
    return window.path.join(this.storeService.getConfigLocation(), 'database.json');
  }

  private getHistoryPath(): string {
    return window.path.join(this.storeService.getConfigLocation(), 'history.json');
  }
}
