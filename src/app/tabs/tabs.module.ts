import { NgModule, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabsPageRoutingModule } from './tabs-routing.module';

import { TabsPage } from './tabs.page';
import { SearchComponent } from '../search/search.component';
import { FeedPageModule } from './feed/feed.module';
import { ContentComponent } from '../content/content.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsPageRoutingModule,
    FeedPageModule
  ],
  declarations: [TabsPage]
})
export class TabsPageModule {}
