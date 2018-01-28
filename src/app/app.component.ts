import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { SortableComponent } from 'ngx-bootstrap/sortable';

import { Configuration } from './_models/configuration';
import { Command } from './_models/command';
import { StoreService } from './_services/store.service';
import { CommandService } from './_services/command.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private watcher: any;
  public showFilter = false;
  public keyword = '';
  public configuration: Configuration;
  public command: Command = {} as Command;
  public commands: Command[];
  public allCommands: Command[];
  public easeInOutExpoEasing: any = {
    ease: (t: number, b: number, c: number, d: number): number => {
      if (t === 0) return b;
      if (t === d) return b + c;
      if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
      return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
    }
  };
  public jsonFilter: any = [
    {name: 'JSON', extensions: ['json']},
    {name: 'All Files', extensions: ['*']}
  ];
  @ViewChild(SortableComponent) sortableComponent: SortableComponent;

  constructor(
    public storeService: StoreService,
    public commandService: CommandService) { }

  public ngOnInit(): void {
    this.configuration = this.storeService.get();
    this.allCommands = this.commands = this.commandService.loadCommands();
    this.startWatching();
  }

  private startWatching() {
    this.watcher = window.fswrapper.watch(this.storeService.getWatchFilePath(), { awaitWriteFinish: true }).on('change', (path, stats) => {
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

  public getAppVersion() {
    return window.app.getVersion();
  }

  public isContainParams(voice: string) {
    return voice.match(/\(\.\*\)/);
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
  //     voice: command.voice,
  //     params: command.params
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
      command.params = this.command.params;
      command.updatedAt = new Date();
    }
    this.commandService.saveCommands(this.commands);
    this.sortableComponent.writeValue(this.commands);
  }

  public import(path: string): void {
    if (!path)
      return;
    const commands: Command[] = window.jsonwrapper.readFileSync(path);
    this.commands.push(...commands);
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

  public configFormSubmit(): void {
    this.storeService.set(this.configuration);
    this.watcher.unwatch();

    this.keyword = '';
    this.configuration = this.storeService.get();
    this.allCommands = this.commands = this.commandService.loadCommands();
    this.startWatching();
  }

  public selectItem(property: string, filters?: any[]): string {
    const selectedItems = window.dialog.showOpenDialog({ properties: [property], filters: filters });
    return selectedItems ? selectedItems[0] : '';
  }

  public openItem(path: string): void {
    if (!window.fs.existsSync(path))
      window.fs.writeFile(path, '');
    window.shell.openItem(path);
  }
}
