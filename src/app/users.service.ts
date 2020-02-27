import { Injectable } from '@angular/core';
import { User } from './user';
import { BehaviorSubject } from 'rxjs';
import { take, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private users = new BehaviorSubject<User[]>([]);

  get getUsers() {
    return this.users.asObservable();
  }

  getUser(id: string) {
    return this.users.pipe(take(1), map(users => {
      return { ...users.find(u => u.id === id) };
    }));
  }

  addUser(username: string, email: string, image: string, fullName: string, bio: string) {

    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.authService.getUserId.pipe(take(1), switchMap(userId => {
        const newUser = new User(userId, username, email, image, fullName, bio);
        return this.http.post<{ name: string }>(`https://mmnt-io.firebaseio.com/users.json?auth=${token}`, { ...newUser, id: null })
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
