import { Component, OnInit, OnDestroy } from '@angular/core';
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
  private commands: Command[];
  private command: Command = {} as Command;

  constructor(public commandService: CommandService) { }

  public ngOnInit(): void {
    this.commands = this.commandService.loadCommands();

    this.watcher = window.fswrapper.watch(environment.watchPath, { awaitWriteFinish: true }).on('change', (path, stats) => {
      window.fs.readFile(path, 'utf8', (err_, data) => {
        if (err_)
          throw err_;
        if (data) {
          const lines = data.trim().split('\n');
          const lastLine = lines.slice(-1)[0];

          const commands = this.commandService.extractCommands(lastLine);
          this.commandService.runCommands(commands);
        }
      });
    });
  }

  public ngOnDestroy(): void {
    this.watcher.unwatch();
  }

  public edit(item: Command) {
    this.command = Object.assign({}, item);
  }

  public onSubmit() {

  }
}
