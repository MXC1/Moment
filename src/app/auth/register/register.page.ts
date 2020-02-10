import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { UsersService } from 'src/app/users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  form: FormGroup;

  constructor(private usersService: UsersService, private router: Router) { }

  ngOnInit() {
    this.form = new FormGroup({
      email: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(255), Validators.email]
      }),
      fullName: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(255)]
      }),
      username: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(255)]
      }),
      password: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(255)]
      }),
      verifyPassword: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(255)]
      })
    });
  }

onRegister() {
    const password = this.form.value.password;
    const verifyPassword = this.form.value.verifyPassword;

    if (password !== verifyPassword) {
      this.form.controls.verifyPassword.setErrors({incorrect: true});
    }

    if (!this.form.valid) {
      return;
    }

    const email = this.form.value.email;
    const fullName = this.form.value.fullName;
    const username = this.form.value.username;

    this.usersService.addUser(email, fullName, username, password);
    this.form.reset();
    this.router.navigateByUrl('/auth/login');
  }
}
