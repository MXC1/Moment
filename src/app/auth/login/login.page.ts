import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { FeedbackComponent } from 'src/app/shared/feedback/feedback.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  form: FormGroup;

  constructor(private authService: AuthService, private router: Router, private alertController: AlertController, private modalController: ModalController) { }

  ngOnInit() {
    this.form = new FormGroup({
      login: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(255)]
      }),
      password: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(255)]
      })
    });
  }

  onLogin() {
    if (!this.form.valid) {
      return;
    }

    const email = this.form.value.login;
    const password = this.form.value.password;

    this.authService.login(email, password).subscribe(resData => {
      this.router.navigateByUrl('/tabs/feed');
    }, errorResponse => {
      const code = errorResponse.error.error.message;
      let message = 'There was a problem. Please try again.';
      if (code === 'EMAIL_NOT_FOUND') {
        message = 'Your username or password is incorrect.';
      } else if (code === 'INVALID_PASSWORD') {
        message = 'Your username or password is incorrect.';
      }
      this.showAlert(message);
    });
    this.form.reset();
  }

  showAlert(message: string) {
    this.alertController.create({
      header: 'Authentication Failed',
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
