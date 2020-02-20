import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewPostPageRoutingModule } from './new-post-routing.module';

import { NewPostPage } from './new-post.page';
import { ImageChooserComponent } from '../image-picker/image-chooser.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    NewPostPageRoutingModule
  ],
  declarations: [NewPostPage, ImageChooserComponent]
})
export class NewPostPageModule {}
