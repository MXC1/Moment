import { Component, OnInit, OnDestroy } from '@angular/core';

import { Platform, ModalController, AlertController } from '@ionic/angular';

import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FeedbackComponent } from './shared/feedback/feedback.component';

/**
 * Wraps the whole application
 *
 * @export
 * @class AppComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private authSubscription: Subscription;
  private previousAuthState = false;

  isMobile: boolean;

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalController: ModalController,
    private platform: Platform,
    private alertController: AlertController
  ) { }

  /**
   * Check authentication status and navigate to login if not
   *
   * @memberof AppComponent
   */
  ngOnInit() {
    if (!this.platform.is('mobile') || this.platform.is('desktop')) {
      this.alertController.create({ header: 'Incorrect Device', message: 'It looks like you\'re trying to access this site from a desktop browser. Please use the browser on your phone.', backdropDismiss: false}).then(alertElement => {
        alertElement.present();
      })
      this.isMobile = false;
    } else {
      this.authSubscription = this.authService.isAuthenticated.subscribe(isAuthenticated => {
        if (!isAuthenticated && this.previousAuthState !== isAuthenticated) {
          this.router.navigateByUrl('/auth/login');
        }
        this.previousAuthState = isAuthenticated;
      });
    }
    this.isMobile = true;
  }

  /**
   * Method for logout option in the sidebar menu
   *
   * @memberof AppComponent
   */
  onLogOut() {
    this.authService.logout();
  }

  /**
   * Create the feedback modal
   *
   * @memberof AppComponent
   */
  onFeedback() {
    this.modalController.create({ component: FeedbackComponent }).then(modalElement => {
      modalElement.present();
    });
  }


  /**
   * Dispose of auth subscription
   *
   * @memberof AppComponent
   */
  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}
