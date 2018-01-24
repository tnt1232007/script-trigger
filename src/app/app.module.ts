import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MomentModule } from 'angular2-moment';
import { HighlightModule } from 'ngx-highlightjs';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';

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
    HighlightModule.forRoot({
      theme: 'solarized-light'
    }),
    ConfirmationPopoverModule.forRoot({
      confirmButtonType: 'primary',
      cancelButtonType: 'secondary'
    })
  ],
  providers: [CommandService],
  bootstrap: [AppComponent]
})
export class AppModule { }
