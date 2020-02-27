import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisterPageRoutingModule } from './register-routing.module';

import { RegisterPage } from './register.page';
import { NewPostPageModule } from 'src/app/new-post/new-post.module';
import { PersonalInfoComponent } from './personal-info/personal-info.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RegisterPageRoutingModule,
    NewPostPageModule
  ],
  declarations: [RegisterPage, PersonalInfoComponent],
  entryComponents: [PersonalInfoComponent]
})
export class RegisterPageModule {}
