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
import { IonicSelectableModule } from 'ionic-selectable';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NewEventComponent } from './tabs/events/new-event/new-event.component';
import { EventDetailComponent } from './tabs/events/event-detail/event-detail.component';
import { ContentModule } from './shared/content/content.module';
import { PersonalInfoComponent } from './auth/register/personal-info/personal-info.component';
import { FeedbackComponent } from './shared/feedback/feedback.component';
import { EventDiscoverComponent } from './tabs/events/event-discover/event-discover.component';
import { PostDiscoverComponent } from './tabs/feed/post-discover/post-discover.component';


/**
 * Declar and import necessary Components and Modules
 *
 * @export
 * @class AppModule
 */
@NgModule({
  declarations: [AppComponent, ImageChooserComponent, ImageCropperComponent, SearchComponent, NewPostComponent, NewEventComponent, EventDetailComponent, PersonalInfoComponent, FeedbackComponent, EventDiscoverComponent, PostDiscoverComponent],
  entryComponents: [ImageChooserComponent, ImageCropperComponent, SearchComponent, NewPostComponent, NewEventComponent, EventDetailComponent, PersonalInfoComponent, FeedbackComponent, EventDiscoverComponent, PostDiscoverComponent],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule, IonicModule.forRoot(), AppRoutingModule, HttpClientModule, IonicSelectableModule, ContentModule],
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
