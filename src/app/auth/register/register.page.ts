import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { UsersService } from 'src/app/users.service';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  form: FormGroup;
  passwordMismatch = false;

  constructor(private usersService: UsersService, private router: Router, private authService: AuthService, private alertController: AlertController) { }

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl(null, {
        validators: [Validators.required, Validators.maxLength(255), Validators.email]
      }),
      fullName: new FormControl(null, {
        validators: [Validators.required, Validators.maxLength(255)]
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

    this.authService.register(email, password).subscribe(resData => {
    }, errorResponse => {
      const code = errorResponse.error.error.message;
      let message = 'There was a problem. Please try again.';
      if (code === 'EMAIL_EXISTS') {
      message = 'An account with this email already exists.';
      }
      this.showAlert(message);
    });
    this.router.navigateByUrl('/auth/login');
  }

  showAlert(message: string) {
    this.alertController.create({
      header: 'Authentication Failed',
      message,
      buttons: ['Okay'] }).then(alertElement => {
      alertElement.present();
    });
  }
}
