import { Injectable } from '@angular/core';
import { User } from '../user';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface UserAuth {
  email: string;
  username: string;
  password: string;
}

interface AuthResData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  localId: string;
  expiresIn: string;
  registered?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authenticated = false;
  private userId = null;
  private users = [];

  get isAuthenticated() {
    return this.authenticated;
  }

  get getUserId() {
    return this.userId;
  }

  login(email: string, password: string) {
    return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`, { email, password });
  }

  logout() {
    this.authenticated = false;
  }

  register(email: string, password: string) {
    return this.http.post<AuthResData>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`, { email, password, returnSecureToken: true });
  }

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
