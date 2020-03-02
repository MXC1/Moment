import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentComponent } from 'src/app/content/content.component';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { ContentComponent } from './content.component';



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
