import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FeedPageRoutingModule } from './feed-routing.module';

import { FeedPage } from './feed.page';
import { ContentComponent } from 'src/app/content/content.component';
import { ImageChooserComponent } from 'src/app/image-chooser/image-chooser.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FeedPageRoutingModule
  ],
  declarations: [FeedPage, ContentComponent, ImageChooserComponent],
  exports: [ContentComponent, ImageChooserComponent]
})
export class FeedPageModule {}
