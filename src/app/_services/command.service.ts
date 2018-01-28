import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/do';

import { environment } from '../../environments/environment';
import { StoreService } from './store.service';
import { Command } from '../_models/command';

@Injectable()
export class CommandService {
  constructor(private storeService: StoreService) { }

  public loadCommands(): Command[] {
    const path = this.storeService.getDatabaseFilePath();
    if (!window.fs.existsSync(path))
      return [];
    const commands: Command[] = window.jsonwrapper.readFileSync(path);
    commands.forEach((command, index) => {
      command.id = index + 1;
    });
    return commands;
  }

  public saveCommands(commands: Command[]): void {
    window.jsonwrapper.writeFileSync(this.storeService.getDatabaseFilePath(), commands, { spaces: 2 });
  }

  public extractCommands(voice: string): Command[] {
    const allCommands = this.loadCommands();
    const commands: Command[] = [];
    for (const cmd of allCommands) {
      const reg = new RegExp(cmd.voice, 'i');
      const matches = reg.exec(voice);
      if (matches) {
        cmd.params = matches.slice(1).join(',');
        commands.push(cmd);
      }
    }
    return commands;
  }

  public runCommands(...commands: Command[]): Observable<any> {
    if (!commands || commands.length === 0)
      return;

    const consoles = [console.log, console.warn];
    console.log = function () { };
    console.warn = function () { };

    const ps = new window.powershell();
    for (const cmd of commands) {
      ps.addCommand(cmd.script.format(...cmd.params ? cmd.params.split(',') : []) + ';');
    }

    const obs = Observable
      .fromPromise(ps.invoke())
      .mergeMap(val => ps.dispose())
      .do(() => {
        console.log = consoles[0];
        console.warn = consoles[1];
      }, () => {
        console.log = consoles[0];
        console.warn = consoles[1];
      });
    return obs;
  }
}
