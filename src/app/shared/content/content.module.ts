import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentComponent } from 'src/app/shared/content/content.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ContentComponent],
  entryComponents: [ContentComponent],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  exports: [ContentComponent]
})
export class ContentModule { }
