import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SortableModule } from 'ngx-bootstrap/sortable';
import { MomentModule } from 'angular2-moment';
import { HighlightModule } from 'ngx-highlightjs';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';

import { ByteSizeIconComponent } from './nested-components/bytesize-icon/bytesize-icon.component';
import { AppComponent } from './app.component';
import { CommandService } from './_services/command.service';

@NgModule({
  declarations: [
    AppComponent,
    ByteSizeIconComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MomentModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    SortableModule.forRoot(),
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
