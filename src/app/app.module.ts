import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MomentModule } from 'angular2-moment';

import { AppComponent } from './app.component';
import { CommandService } from './_services/command.service';
import { FieldComponent } from './_partials/field.component';

@NgModule({
  declarations: [
    AppComponent,
    FieldComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MomentModule
  ],
  providers: [CommandService],
  bootstrap: [AppComponent]
})
export class AppModule { }
