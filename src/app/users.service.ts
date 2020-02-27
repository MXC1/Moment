import { Injectable } from '@angular/core';
import { User } from './user';
import { BehaviorSubject } from 'rxjs';
import { take, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth/auth.service';

interface UserData {
  bio: string;
  email: string;
  friendIds: string[];
  fullName: string;
  image: string;
  postIds: string[];
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private users = new BehaviorSubject<User[]>([]);

  get getUsers() {
    return this.users.asObservable();
  }

  fetchUsers() {
    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.get<{ [key: string]: UserData }>(`https://mmnt-io.firebaseio.com/users.json?auth=${token}`)
        .pipe(map(resData => {
          const users = [];
          for (const key in resData) {
            if (resData.hasOwnProperty(key)) {
              users.push(new User(key, resData[key].username, resData[key].email, resData[key].image, resData[key].fullName, resData[key].bio));
            }
          }
          return users;
        }), tap(users => {
          this.users.next(users);
        })
        );
    }));
  }

  getUser(id: string) {
    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.get<UserData>(`https://mmnt-io.firebaseio.com/users/${id}.json?auth=${token}`).pipe(take(1), map(resData => {
        const newUser = new User(id, resData.username, resData.email, resData.image, resData.fullName, resData.bio);
        return newUser;
      }));
    }));
  }

  addUser(username: string, email: string, image: string, fullName: string, bio: string) {
    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.authService.getUserId.pipe(take(1), switchMap(userId => {
        const newUser = new User(userId, username, email, image, fullName, bio);
        return this.http.put<{ name: string }>(`https://mmnt-io.firebaseio.com/users/${userId}.json/?auth=${token}`, { ...newUser, id: null })
          .pipe(take(1), switchMap(resData => {
            return this.users;
          }), take(1),
            tap(users => {
              this.users.next(users.concat(newUser));
            }));
      }));
    }));
  }

  uploadImage(image: File) {

    const uploadData = new FormData();

    uploadData.append('image', image);

    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.post<{ imageUrl: string, imagePath: string }>('https://us-central1-mmnt-io.cloudfunctions.net/storeImage', uploadData, { headers: { Authorization: 'Bearer ' + token } });
    }));
  }

  constructor(private http: HttpClient, private authService: AuthService) { }
}
