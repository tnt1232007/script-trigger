import { Injectable } from '@angular/core';
import { Configuration } from '../_models/configuration';
import { IWatchService } from './interface/watch.service';
import { StoreService } from './store.service';

@Injectable()
export class PushBulletWatchService extends IWatchService {
  private pushbullet: any;
  private stream: any;

  constructor(private storeService: StoreService) {
    super();
  }

  public startWatching(fn: (message) => void) {
    this.pushbullet = new window.pushbullet(this.storeService.configuration.pushbulletApiKey);
    this.stream = this.pushbullet.stream();
    this.stream.connect();
    this.stream.on('tickle', message => {
      if (message !== 'push')
        return;
      this.pushbullet.history({ limit: 1 }, (err, res) => {
        if (err)
          return;
        const push = res.pushes[0];
        if (push && push.title === 'Script Trigger') {
          fn(push.body);
          this.pushbullet.deletePush(push.iden);
        }
      });
    });
    this.stream.on('error', error => {
      // stream error
    });
  }

  public stopWatching() {
    if (!this.stream)
      return;

    this.stream.close();
    this.stream = null;
  }
}
