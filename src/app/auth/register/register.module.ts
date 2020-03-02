import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisterPageRoutingModule } from './register-routing.module';

import { RegisterPage } from './register.page';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { FeedPageModule } from 'src/app/tabs/feed/feed.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RegisterPageRoutingModule,
    FeedPageModule
  ],
  declarations: [RegisterPage, PersonalInfoComponent],
  entryComponents: [PersonalInfoComponent]
})
export class RegisterPageModule {}
