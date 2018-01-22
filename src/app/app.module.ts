import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MomentModule } from 'angular2-moment';
import { HighlightJsModule, HighlightJsService } from 'angular2-highlight-js';

import { AppComponent } from './app.component';
import { CommandService } from './_services/command.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MomentModule,
    HighlightJsModule
  ],
  providers: [CommandService, HighlightJsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
