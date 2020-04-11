import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { UsersService } from 'src/app/users.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { AlertController, ModalController } from '@ionic/angular';
import { PersonalInfoComponent } from './personal-info/personal-info.component';
import { FeedbackComponent } from 'src/app/shared/feedback/feedback.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  form: FormGroup;
  passwordMismatch = false;

  constructor(private usersService: UsersService, private router: Router, private authService: AuthService, private alertController: AlertController, private modalController: ModalController) { }

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl(null, {
        validators: [Validators.required, Validators.maxLength(255), Validators.email]
      }),
      username: new FormControl(null, {
        validators: [Validators.required, Validators.maxLength(255)]
      }),
      password: new FormControl(null, {
        validators: [Validators.required, Validators.maxLength(255), Validators.minLength(6)]
      }),
      verifyPassword: new FormControl(null, {
        validators: [Validators.required, Validators.maxLength(255)]
      })
    });
  }

  onRegister() {
    const email = this.form.value.email;
    const password = this.form.value.password;
    const username = this.form.value.username;

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

  showAlert(header: string, message: string) {
    this.alertController.create({
      header,
      message,
      buttons: ['Okay']
    }).then(alertElement => {
      alertElement.present();
    });
  }

  onFeedback() {
    this.modalController.create({ component: FeedbackComponent }).then(modalElement => {
      modalElement.present();
    });
  }
}
