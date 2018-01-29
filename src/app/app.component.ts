import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { SortableComponent } from 'ngx-bootstrap/sortable';
import 'rxjs/add/operator/finally';

import { Configuration } from './_models/configuration';
import { Command } from './_models/command';
import { Activity } from './_models/activity';
import { StoreService } from './_services/store.service';
import { CommandService } from './_services/command.service';
import { IWatchService } from './_services/interface/watch.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('searchState', [
      state('show', style({
        transform: 'translateY(0)',
        opacity: 0.75
      })),
      state('hide', style({
        transform: 'translateY(-120%)'
      })),
      transition('hide => show', animate('.4s ease-in', style({ transform: 'translateY(0)' }))),
      transition('show => hide', animate('.4s 100ms ease-in', style({ transform: 'translateY(-120%)' })))
    ]),
    trigger('top', [
      state('true', style({
        transform: 'translateY(0)'
      })),
      state('false', style({
        transform: 'translateY(-100%)'
      })),
      transition('false => true', animate('.4s ease-in', style({ transform: 'translateY(0)' }))),
      transition('true => false', animate('.4s 100ms ease-in', style({ transform: 'translateY(-100%)' })))
    ]),
    trigger('commands', [
      state('true', style({
        transform: 'translateY(-100%)'
      })),
      state('false', style({
        transform: 'translateY(0)'
      })),
      transition('false => true', animate('.4s ease-in', style({ transform: 'translateY(-100%)' }))),
      transition('true => false', animate('.4s 100ms ease-in', style({ transform: 'translateY(0)' })))
    ]),
    trigger('listWithActivity', [
      state('true', style({
        width: '80vw'
      })),
      state('false', style({
        width: '100vw'
      })),
      transition('true => false', animate('.4s ease-in', style({ width: '100vw' }))),
      transition('false => true', animate('.4s ease-in', style({ width: '80vw' })))
    ]),
    trigger('activity', [
      state('true', style({
        width: '20vw'
      })),
      state('false', style({
        width: '0'
      })),
      transition('false => true', animate('.4s ease-in', style({ width: '20vw' }))),
      transition('true => false', animate('.4s ease-in', style({ width: '0' })))
    ])
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  public showTopPage = true;
  public showActivity = false;
  public showFilter: boolean;
  public keyword: string;
  public configuration: Configuration;
  public command: Command = {} as Command;
  public commands: Command[];
  public allCommands: Command[];
  public activities: Activity[];
  public jsonFilter: any = [
    { name: 'JSON', extensions: ['json'] },
    { name: 'All Files', extensions: ['*'] }
  ];
  @ViewChild(SortableComponent) sortableComponent: SortableComponent;

  constructor(
    public storeService: StoreService,
    public commandService: CommandService,
    public watchService: IWatchService) { }

  public ngOnInit(): void {
    this.showFilter = false;
    this.keyword = '';
    this.configuration = this.storeService.fetch();
    this.allCommands = this.commands = this.commandService.load();
    this.watchService.startWatching(message => {
      this.commandService.extractAndRun(message).subscribe();
    });
  }

  public ngOnDestroy(): void {
    this.watchService.stopWatching();
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

  public onView(command: Command): void {
    this.command = command;
    this.command.id = -1;
  }

  public onEdit(command: Command): void {
    this.command = { ...command };
  }

  public trigger(command: Command): void {
    command.lastRunAt = new Date();
    command.runs = command.runs ? command.runs + 1 : 1;
    this.commandService.run(command)
      .finally(() => this.commandService.save(this.commands))
      .subscribe();
  }

  public delete(command?: Command): void {
    const index: number = this.commands.findIndex(o => o.id === (command ? command.id : this.command.id));
    this.commands.splice(index, 1);
    this.commandService.save(this.commands);
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
    this.commandService.save(this.commands);
    this.sortableComponent.writeValue(this.commands);
  }

  public import(path: string): void {
    if (!path)
      return;
    const commands: Command[] = window.jsonwrapper.readFileSync(path);
    this.commands.push(...commands);
    this.commandService.save(this.commands);
    this.sortableComponent.writeValue(this.commands);
  }

  public afterSort(): void {
    this.commandService.save(this.commands);
  }

  public resetAll(): void {
    this.commands.forEach(command => {
      command.lastRunAt = null;
      command.runs = 0;
    });
    this.commandService.save(this.commands);
  }

  public deleteAll(): void {
    this.commands = [];
    this.commandService.save(this.commands);
  }

  public configFormSubmit(): void {
    this.storeService.push(this.configuration);
    this.watchService.stopWatching();
    this.ngOnInit();
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
