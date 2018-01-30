import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Configuration } from '../_models/configuration';

@Injectable()
export class StoreService {
  private store: any;

  constructor() {
    this.store = new window.store({
      cwd: environment.production ? '' : window.path.resolve('res')
    });
  }

  public load(): any {
    return this.store.store;
  }

  public save(jsonObj: any): void {
    this.store.set(jsonObj);
  }

  public getConfigLocation() {
    return window.path.dirname(this.store.path);
  }
}
