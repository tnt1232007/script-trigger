import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SortableComponent } from 'ngx-bootstrap/sortable';

import { environment } from '../environments/environment';
import { CommandService } from './_services/command.service';
import { Command } from './_models/command';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private watcher: any;
  public keyword = '';
  public command: Command = {} as Command;
  public commands: Command[];
  public allCommands: Command[];

  @ViewChild(SortableComponent) sortableComponent: SortableComponent;

  constructor(public commandService: CommandService) { }

  public ngOnInit(): void {
    this.allCommands = this.commands = this.commandService.loadCommands();

    this.watcher = window.fswrapper.watch(environment.watchPath, { awaitWriteFinish: true }).on('change', (path, stats) => {
      window.fs.readFile(path, 'utf8', (err_, data) => {
        if (err_)
          throw err_;
        if (data) {
          const lines = data.trim().split('\n');
          const lastLine = lines.slice(-1)[0];

          const commands = this.commandService.extractCommands(lastLine);
          this.commandService.runCommands(...commands);
        }
      });
    });
  }

  public ngOnDestroy(): void {
    this.watcher.unwatch();
  }

  public filter(): void {
    if (!this.keyword) {
      this.commands = this.allCommands;
    } else {
      const keyword = this.keyword.toLowerCase();
      this.commands = this.allCommands
        .filter(o => o.name.toLowerCase().indexOf(keyword) > -1 || o.script.toLowerCase().indexOf(keyword) > -1);
    }
  }

  public onNew(): void {
    this.command = {} as Command;
  }

  // public onDuplicate(command: Command): void {
  //   const name = command.name.replace(/[0-9]+$/g, '').trim();
  //   let index = 2;
  //   while (this.commands.some(o => o.name === `${name} ${index}`))
  //     index += 1;
  //   this.command = {
  //     name: `${name} ${index}`,
  //     script: command.script,
  //     voice: command.voice
  //   } as Command;
  // }

  public onEdit(command: Command): void {
    this.command = { ...command };
  }

  public trigger(command: Command): void {
    this.commandService.runCommands(command).subscribe(o => {
      command.lastRunAt = new Date();
      command.runs = command.runs ? command.runs + 1 : 1;
      this.commandService.saveCommands(this.commands);
    }, err => {
      console.error(err);
    });
  }

  public delete(command?: Command): void {
    const index: number = this.commands.findIndex(o => o.id === (command ? command.id : this.command.id));
    this.commands.splice(index, 1);
    this.commandService.saveCommands(this.commands);
    this.sortableComponent.writeValue(this.commands);
  }

  public submit(): void {
    const command: Command = this.commands.find(o => o.id === this.command.id);
    if (!command) {
      this.command.id = this.commands.length + 1;
      this.command.createdAt = new Date();
      this.command.updatedAt = new Date();
      this.command.runs = 0;
      this.commands.push(this.command);
    } else {
      command.name = this.command.name;
      command.script = this.command.script;
      command.voice = this.command.voice;
      command.updatedAt = new Date();
    }
    this.commandService.saveCommands(this.commands);
    this.sortableComponent.writeValue(this.commands);
  }

  public afterSort(): void {
    this.commandService.saveCommands(this.commands);
  }

  public resetAllStats(): void {
    this.commands.forEach(command => {
      command.lastRunAt = null;
      command.runs = 0;
    });
    this.commandService.saveCommands(this.commands);
  }
}
