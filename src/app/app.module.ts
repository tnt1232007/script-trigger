import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { SortableModule } from 'ngx-bootstrap/sortable';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { MomentModule } from 'angular2-moment';
import { HighlightModule } from 'ngx-highlightjs';
import { ConfirmationPopoverModule } from 'angular-confirmation-popover';
import { ElasticModule } from 'angular2-elastic';

import { ByteSizeIconComponent } from './nested-components/bytesize-icon/bytesize-icon.component';
import { AppComponent } from './app.component';
import { StoreService } from './_services/store.service';
import { CommandService } from './_services/command.service';
import { PushBulletService } from './_services/pushbullet.service';

@NgModule({
  declarations: [
    AppComponent,
    ByteSizeIconComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    MomentModule,
    ElasticModule,
    ModalModule.forRoot(),
    TooltipModule.forRoot(),
    SortableModule.forRoot(),
    AccordionModule.forRoot(),
    HighlightModule.forRoot({
      theme: 'solarized-light'
    }),
    ConfirmationPopoverModule.forRoot({
      confirmButtonType: 'primary',
      cancelButtonType: 'secondary'
    })
  ],
  providers: [
    StoreService,
    CommandService,
    PushBulletService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
