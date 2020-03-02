import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NewPostComponent } from './tabs/feed/new-post/new-post.component';
import { ImageChooserComponent } from './image-chooser/image-chooser.component';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { SearchComponent } from './search/search.component';
import { IonicSelectableComponent, IonicSelectableModule } from 'ionic-selectable';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ContentComponent } from 'src/app/content/content.component';
import { PostDetailComponent } from './tabs/feed/post-detail/post-detail.component';
import { ContentModule } from './shared/content/content.module';


@NgModule({
  declarations: [AppComponent, ImageChooserComponent, ImageCropperComponent, SearchComponent, NewPostComponent],
  entryComponents: [ImageChooserComponent, ImageCropperComponent, SearchComponent, NewPostComponent],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, IonicSelectableModule],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }


// entryComponents: [ImageChooserComponent, ImageCropperComponent],
// declarations: [FeedPage, ContentComponent, ImageChooserComponent, ImageCropperComponent],
