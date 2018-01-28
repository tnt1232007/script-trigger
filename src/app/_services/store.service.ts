import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Configuration } from '../_models/configuration';

@Injectable()
export class StoreService {
  private store: any;
  public configuration: Configuration;

  constructor() {
    this.store = new window.store({
      cwd: environment.production ? '' : window.path.resolve('src/assets')
    });
  }

  public fetch(): any {
    if (!this.configuration)
      this.configuration = this.store.store;
    return this.configuration;
  }

  public push(jsonObj: any): void {
    this.store.set(jsonObj);
  }

  public getWatchFileName(): string {
    return window.os.hostname() + '.txt';
  }

  public getConfigLocation() {
    return window.path.dirname(this.store.path);
  }

  public getWatchFilePath(): string {
    const watchLocation = this.configuration.watchLocation;
    return watchLocation ? window.path.join(watchLocation, this.getWatchFileName()) : null;
  }

  public getDatabaseFilePath(): string {
    const databaseLocation = this.configuration.databaseLocation;
    return window.path.join(databaseLocation || window.path.dirname(this.store.path), 'database.json');
  }
}
