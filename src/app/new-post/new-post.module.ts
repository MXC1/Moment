import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewPostPageRoutingModule } from './new-post-routing.module';

import { NewPostPage } from './new-post.page';
import { ImageChooserComponent } from '../image-chooser/image-chooser.component';

import { ImageCropperModule } from 'ngx-image-cropper';

import { IonicSelectableModule } from 'ionic-selectable';
import { NewEventComponent } from '../tabs/events/new-event/new-event.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    NewPostPageRoutingModule,
    ImageCropperModule,
    IonicSelectableModule
  ],
  entryComponents: [NewEventComponent],
  declarations: [NewPostPage, ImageChooserComponent, NewEventComponent],
  exports: [ImageChooserComponent]
})
export class NewPostPageModule {}
