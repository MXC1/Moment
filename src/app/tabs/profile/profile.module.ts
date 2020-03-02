import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';
import { FeedPageModule } from '../feed/feed.module';
import { ContentModule } from 'src/app/shared/content/content.module';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    FeedPageModule,
    ContentModule
  ],
  declarations: [ProfilePage]
})
export class ProfilePageModule {}
