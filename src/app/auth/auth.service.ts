import { Injectable } from '@angular/core';
import { User } from './user';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';

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
  private authenticated = true;
  private userId = 'u2';
  private users = [];
 
  private user = new BehaviorSubject<User>(null);

  get isAuthenticated() {
    return true;
  }

  // get isAuthenticated() {
  //   return this.user.asObservable().pipe(map(user => {
  //     if (user) {
  //       return !!user.getToken;
  //     } else {
  //       return false;
  //     }
  //   }));
  // }

  get getUserId() {
    return this.user.asObservable().pipe(map(user => {
      if (user) {
        return user.id;
      } else {
        return null;
      }
    }));
  }

  login(email: string, password: string) {
    return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`, { email, password }).pipe(tap(this.setUserData.bind(this)));
  }

  logout() {
    this.user.next(null);
  }

  register(email: string, password: string) {
    return this.http.post<AuthResData>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`, { email, password, returnSecureToken: true }).pipe(tap(this.setUserData.bind(this)));
  }

  private setUserData(userData: AuthResData) {
    const tokenExpiration = new Date(new Date().getTime() + (+userData.expiresIn * 1000));
    this.user.next(new User(userData.localId, userData.email, userData.idToken, tokenExpiration));
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
