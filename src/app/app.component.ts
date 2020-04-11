import { Component, OnInit, OnDestroy } from '@angular/core';

import { Platform, ModalController } from '@ionic/angular';

import { Plugins, Capacitor } from '@capacitor/core';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FeedbackComponent } from './shared/feedback/feedback.component';

// import { SplashScreen } from '@ionic-native/splash-screen/ngx';
// import { StatusBar } from '@ionic-native/status-bar/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private authSubscription: Subscription;
  private previousAuthState = false;

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private router: Router,
    private modalController: ModalController
    // private splashScreen: SplashScreen,
    // private statusBar: StatusBar
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable('SplashScreen')) {
        Plugins.SplashScreen.hide();
      }

      // this.statusBar.styleDefault();
      // this.splashScreen.hide();
    });
  }

  onLogOut() {
    this.authService.logout();
  }

  onFeedback() {
    this.modalController.create({ component: FeedbackComponent }).then(modalElement => {
      modalElement.present();
    });
  }

  ngOnInit() {
    this.authSubscription = this.authService.isAuthenticated.subscribe(isAuthenticated => {
      if (!isAuthenticated && this.previousAuthState !== isAuthenticated) {
        this.router.navigateByUrl('/auth/login');
      }
      this.previousAuthState = isAuthenticated;
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
