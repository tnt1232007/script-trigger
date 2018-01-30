import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { Configuration } from '../_models/configuration';
import { StoreService } from './store.service';

@Injectable()
export class PushBulletService {
  private pushbullet: any;
  private stream: any;

  constructor(private storeService: StoreService) { }

  public verify(apikey: string): Observable<any> {
    const pushbullet = new window.pushbullet(apikey);
    return Observable.create(obs => {
      pushbullet.me((err, res) => {
        if (err)
          obs.error(err);
        else {
          obs.next(res);
          obs.complete();
        }
      });
    });
  }

  public startWatching(): Observable<any> {
    this.pushbullet = new window.pushbullet(this.storeService.load().pushbulletApiKey);
    this.stream = this.pushbullet.stream();
    this.stream.connect();
    return Observable.create(obs => {
      this.stream.on('error', err => {
        obs.error(err);
      });
      this.stream.on('tickle', message => {
        if (message !== 'push')
          return;
        this.pushbullet.history({ limit: 1 }, (err, res) => {
          if (err) {
            obs.error(err);
          } else {
            const push = res.pushes[0];
            if (push && push.title === 'Script Trigger') {
              obs.next(push.body);
              this.pushbullet.deletePush(push.iden);
            }
          }
        });
      });
    });
  }

  public stopWatching() {
    if (!this.stream)
      return;

    this.stream.close();
    this.stream = null;
  }
}
