import { Injectable } from '@angular/core';
import { IWatchService } from './interface/watch.service';
import { StoreService } from './store.service';

@Injectable()
export class FileWatchService extends IWatchService {
  private watcher: any;

  constructor(private storeService: StoreService) {
    super();
  }

  public startWatching(fn: (message) => void) {
    this.watcher = window.fswrapper.watch(this.storeService.getWatchFilePath(), { awaitWriteFinish: true }).on('change', (path, stats) => {
      window.fs.readFile(path, 'utf8', (err_, data) => {
        if (err_)
          throw err_;
        if (data) {
          const lines = data.trim().split('\n');
          const lastLine = lines.slice(-1)[0];
          fn(lastLine);
        }
      });
    });
  }

  public stopWatching() {
    if (!this.watcher)
      return;

    this.watcher.unwatch();
    this.watcher = null;
  }
}
