import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabsPageRoutingModule } from './tabs-routing.module';

import { TabsPage } from './tabs.page';
import { SearchComponent } from '../search/search.component';
import { FeedPageModule } from './feed/feed.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsPageRoutingModule,
    FeedPageModule
  ],
  declarations: [TabsPage, SearchComponent],
  entryComponents: [SearchComponent]
})
export class TabsPageModule {}
