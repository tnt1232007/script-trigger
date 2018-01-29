import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Configuration } from '../_models/configuration';

@Injectable()
export class StoreService {
  private store: any;
  public configuration: Configuration;

  constructor() {
    this.store = new window.store({
      cwd: environment.production ? '' : window.path.resolve('res')
    });
  }

  public fetch(): any {
    if (!this.configuration)
      this.configuration = this.store.store;
    if (!this.configuration.clearActivityAfterHours)
      this.configuration.clearActivityAfterHours = 48;
    return this.configuration;
  }

  public push(jsonObj: any): void {
    this.store.set(jsonObj);
  }

  public getConfigLocation() {
    return window.path.dirname(this.store.path);
  }
}
