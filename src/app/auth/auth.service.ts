import { Injectable } from '@angular/core';
import { User } from './user';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { BehaviorSubject, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Capacitor, Plugins } from '@capacitor/core';

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
  private user = new BehaviorSubject<User>(null);

  get isAuthenticated() {
    return this.user.asObservable().pipe(map(user => {
      if (user) {
        return !!user.getToken;
      } else {
        return false;
      }
    }));
  }

  get getUserId() {
    return this.user.asObservable().pipe(map(user => {
      if (user) {
        return user.id;
      } else {
        return null;
      }
    }));
  }

  get getToken() {
    return this.user.asObservable().pipe(map(user => {
      if (user) {
        return user.getToken;
      } else {
        return null;
      }
    }));
  }

  login(email: string, password: string) {
    return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.firebaseAPIKey}`, { email, password, returnSecureToken: true }).pipe(tap(this.setUserData.bind(this)));
  }

  logout() {
    this.user.next(null);
    Plugins.Storage.remove({key: 'authData'});
  }

  register(email: string, password: string) {
    return this.http.post<AuthResData>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.firebaseAPIKey}`, { email, password, returnSecureToken: true }).pipe(tap(this.setUserData.bind(this)));
  }

  private setUserData(userData: AuthResData) {
    const tokenExpiration = new Date(new Date().getTime() + (+userData.expiresIn * 1000));

    console.log(userData);

    this.user.next(new User(userData.localId, userData.email, userData.idToken, tokenExpiration));
    this.storeAuthData(userData.localId, userData.email, userData.idToken, tokenExpiration.toISOString());
  }

  autoLogin() {
    return from(Plugins.Storage.get({ key: 'authData' })).pipe(map(storedData => {
      if (!storedData || !storedData.value) {
        return null;
      } else {
        const parsedData = JSON.parse(storedData.value) as { token: string; tokenExpiration: string; userId: string; email: string; };

        const tokenExpiration = new Date(parsedData.tokenExpiration);

        if (tokenExpiration <= new Date()) {
          return null;
        } else {
          const user = new User(parsedData.userId, parsedData.email, parsedData.token, tokenExpiration);
          return user;
        }
      }
    }), tap(user => {
      if (user) {
        this.user.next(user);
      }
    }), map(user => {
      return !!user;
    }));
  }

  private storeAuthData(userId: string, email: string, token: string, tokenExpiration: string) {
    const data = JSON.stringify({ userId, email, token, tokenExpiration });
    Plugins.Storage.set({ key: 'authData', value: data });
  }

  constructor(private http: HttpClient) {
    // this.http.get<UserAuth>('https://mmnt-io.firebaseio.com/users.json').subscribe(resData => {
    //   const fetchedUsers = [];
    //   for (const key in resData) {
    //     if (resData.hasOwnProperty(key)) {
    //       fetchedUsers.push(resData.email, resData.username, resData.password);
    //     }
    //   }
    //   this.users = fetchedUsers;
    // });
  }
}
