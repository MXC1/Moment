import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authenticated = true;
  private userId = 'u2';

  get isAuthenticated() {
    return this.authenticated;
  }

  get getUserId() {
    return this.userId;
  }

  login() {
    this.authenticated = true;
  }

  logout() {
    this.authenticated = false;
  }

  register() {}

  constructor() { }
}
