import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/do';

import { environment } from '../../environments/environment';
import { Command } from '../_models/command';

export class CommandService {
  constructor() { }

  public loadCommands(): Command[] {
    const commands: Command[] = window.jsonwrapper.readFileSync(environment.dbPath);
    commands.forEach((command, index) => {
      command.id = index + 1;
    });
    return commands;
  }

  public saveCommands(commands: Command[]): void {
    window.jsonwrapper.writeFileSync(environment.dbPath, commands, { spaces: 2 });
  }

  public extractCommands(voice: string): Command[] {
    const allCommands = this.loadCommands();
    const commands: Command[] = [];
    for (const cmd of allCommands) {
      const reg = new RegExp(cmd.voice);
      const matches = reg.exec(voice);
      if (matches) {
        cmd.params = matches.slice(1).join(',');
        commands.push(cmd);
      }
    }
    return commands;
  }

  public runCommands(...commands: Command[]): Observable<any> {
    const consoles = [console.log, console.warn];
    console.log = function () { };
    console.warn = function () { };

    const ps = new window.powershell();
    for (const cmd of commands) {
      ps.addCommand(cmd.script.format(...cmd.params.split(',')) + ';');
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
