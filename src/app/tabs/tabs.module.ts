import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabsPageRoutingModule } from './tabs-routing.module';

import { TabsPage } from './tabs.page';
import { ImageChooserComponent } from '../image-chooser/image-chooser.component';
import { NewPostPageModule } from '../new-post/new-post.module';
import { NewEventPageModule } from '../new-event/new-event.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TabsPageRoutingModule,
    NewPostPageModule,
    NewEventPageModule
  ],
  declarations: [TabsPage]
})
export class TabsPageModule {}
