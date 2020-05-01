import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FeedPageRoutingModule } from './feed-routing.module';

import { FeedPage } from './feed.page';
import { ContentModule } from 'src/app/shared/content/content.module';
import { PostDetailComponent } from './post-detail/post-detail.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    FeedPageRoutingModule,
    ContentModule
  ],
  declarations: [FeedPage, PostDetailComponent],
  entryComponents: [PostDetailComponent]
})
export class FeedPageModule { }
