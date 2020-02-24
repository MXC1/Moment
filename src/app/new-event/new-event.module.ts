import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewEventPageRoutingModule } from './new-event-routing.module';

import { NewEventPage } from './new-event.page';
import { NewPostPageModule } from '../new-post/new-post.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    NewEventPageRoutingModule,
    NewPostPageModule
  ],
  declarations: [NewEventPage]
})
export class NewEventPageModule {}
