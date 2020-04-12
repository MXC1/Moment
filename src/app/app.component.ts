import { Component, OnInit, OnDestroy } from '@angular/core';

import { Platform, ModalController } from '@ionic/angular';

import { Plugins, Capacitor } from '@capacitor/core';
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

  constructor(
    private authService: AuthService,
    private router: Router,
    private modalController: ModalController
  ) {}

  /**
   * Check authentication status and navigate to login if not
   *
   * @memberof AppComponent
   */
  ngOnInit() {
    this.authSubscription = this.authService.isAuthenticated.subscribe(isAuthenticated => {
      if (!isAuthenticated && this.previousAuthState !== isAuthenticated) {
        this.router.navigateByUrl('/auth/login');
      }
      this.previousAuthState = isAuthenticated;
    });
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
