import { Injectable } from '@angular/core';
import { User } from '../user';
import { HttpClient } from '@angular/common/http';

interface UserAuth {
  email: string;
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authenticated = true;
  private userId = 'u2';
  private users = [];

  get isAuthenticated() {
    return this.authenticated;
  }

  get getUserId() {
    return this.userId;
  }

  login(login: string, password: string) {
    if (this.users.find(user => {
      return (user.email === login || user.username === login) && user.password === password;
    })) {
      this.authenticated = true;
    }
  }

  logout() {
    this.authenticated = false;
  }

  register() { }

  constructor(private http: HttpClient) {
    this.http.get<UserAuth>('https://mmnt-io.firebaseio.com/users.json').subscribe(resData => {
      const fetchedUsers = [];
      for (const key in resData) {
        if (resData.hasOwnProperty(key)) {
          fetchedUsers.push(resData.email, resData.username, resData.password);
        }
      }
      this.users = fetchedUsers;
    });
  }
}
