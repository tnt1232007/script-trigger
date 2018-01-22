import { environment } from '../../environments/environment';
import { Command } from '../_models/command';

export class CommandService {
  constructor() { }

  public loadCommands(): Command[] {
    return window.jsonwrapper.readFileSync(environment.dbPath);
  }

  public saveCommands(commands: Command[]): void {
    window.jsonwrapper.writeFileSync(environment.dbPath, commands);
  }

  public extractCommands(voice: string): Command[] {
    const allCommands = this.loadCommands();
    const commands: Command[] = [];
    for (const cmd of allCommands) {
      const reg = new RegExp(cmd.voice);
      const matches = reg.exec(voice);
      if (matches) {
        cmd.params = matches.slice(1);
        commands.push(cmd);
      }
    }
    return commands;
  }

  public runCommands(commands: Command[]): void {
    const consoles = [ console.log, console.warn ];
    console.log = function(){};
    console.warn = function(){};

    const ps = new window.powershell();
    for (const cmd of commands) {
      ps.addCommand(cmd.script.format(...cmd.params) + ';');
    }

    ps.invoke().then(o => {
      ps.dispose().then(m => {
        console.log = consoles[0];
        console.warn = consoles[1];
      });
    });
  }
}
