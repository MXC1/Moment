import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { UsersService } from 'src/app/users.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { AlertController, ModalController } from '@ionic/angular';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { FeedbackComponent } from 'src/app/shared/feedback/feedback.component';

/**
 * A form for entering compulsory register information
 *
 * @export
 * @class RegisterPage
 * @implements {OnInit}
 */
@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  form: FormGroup;
  passwordMismatch = false;

  constructor(private usersService: UsersService, private router: Router, private authService: AuthService, private alertController: AlertController, private modalController: ModalController) { }

  /**
   * Generate a new back-end form controller form with the correct fields and validators
   *
   * @memberof RegisterPage
   */
  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl(null, {
        validators: [Validators.required, Validators.maxLength(255), Validators.email]
      }),
      username: new FormControl(null, {
        validators: [Validators.required, Validators.maxLength(15)]
      }),
      password: new FormControl(null, {
        validators: [Validators.required, Validators.maxLength(255), Validators.minLength(6)]
      }),
      verifyPassword: new FormControl(null, {
        validators: [Validators.required, Validators.maxLength(255), Validators.minLength(6)]
      })
    });
  }

  /**
   * Called when the register button is pressed
   * Checks form inputs and passes on a register request if everything is okay
   * Create an alert if not
   *
   * @returns
   * @memberof RegisterPage
   */
  onRegister() {
    const email = this.form.value.email;
    const username = this.form.value.username;
    const password = this.form.value.password;
    const passwordVerify = this.form.value.verifyPassword;

    if (password !== passwordVerify) {
      this.passwordMismatch = true;
      return;
    }

    this.authService.register(email, password).subscribe(resData => {
      this.modalController.create({ component: PersonalInfoComponent, componentProps: { email, username } }).then(modalElement => {
        modalElement.present();
      });
    }, errorResponse => {
      const code = errorResponse.error.error.message;
      let header = 'Sign Up Failed';
      let message = 'There was a problem. Please try again.';
      if (code === 'EMAIL_EXISTS') {
        header = 'Email Already Exists';
        message = 'An account with this email already exists.';
      }
      this.showAlert(header, message);
    });
  }

  /**
   * Create an alert message
   *
   * @param {string} header Alert header
   * @param {string} message Alert message
   * @memberof RegisterPage
   */
  showAlert(header: string, message: string) {
    this.alertController.create({
      header,
      message,
      buttons: ['Okay']
    }).then(alertElement => {
      alertElement.present();
    });
  }

  /**
   * Open the feedback modal
   *
   * @memberof RegisterPage
   */
  onFeedback() {
    this.modalController.create({ component: FeedbackComponent }).then(modalElement => {
      modalElement.present();
    });
  }
}
