import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { BehaviorSubject, Notification } from 'rxjs';
import { take, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';

interface UserData {
  bio: string;
  email: string;
  friendIds: string[];
  fullName: string;
  image: string;
  postIds: string[];
  username: string;
}

interface Notif {
  text: string;
  from: string;
  type: 'user' | 'event';
}

/**
 * Handles user data 
 * Model of Model-View-Controller
 *
 * @export
 * @class UsersService
 */
@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private users = new BehaviorSubject<User[]>([]);

  /**
   * Only called if fetchUsers has been called at least once already
   *
   * @readonly
   * @memberof UsersService
   */
  get getUsers() {
    return this.users.asObservable();
  }

  /**
   * Access the database and create a Subject type containing all saved users
   *
   * @returns
   * @memberof UsersService
   */
  fetchUsers() {
    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.get<{ [key: string]: UserData }>(`https://mmnt-io.firebaseio.com/users.json?auth=${token}`)
        .pipe(map(resData => {
          const users = [];
          for (const key in resData) {
            if (resData.hasOwnProperty(key)) {
              users.push(new User(key, resData[key].username, resData[key].email, resData[key].image, resData[key].fullName, resData[key].bio, resData[key].postIds, resData[key].friendIds));
            }
          }
          return users.reverse();
        }), tap(users => {
          this.users.next(users);
        })
        );
    }));
  }

  /**
   * Fetch a single user from the database
   * @param id ID of user to be fetched
   */
  getUser(id: string) {
    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.get<UserData>(`https://mmnt-io.firebaseio.com/users/${id}.json?auth=${token}`).pipe(take(1), map(resData => {
        const newUser = new User(id, resData.username, resData.email, resData.image, resData.fullName, resData.bio, resData.postIds, resData.friendIds);
        return newUser;
      }));
    }));
  }

  /**
   * Add a user to the database
   *
   * @param {string} username
   * @param {string} email
   * @param {string} image URL of image
   * @param {string} fullName
   * @param {string} bio
   * @returns
   * @memberof UsersService
   */
  addUser(username: string, email: string, image: string, fullName: string, bio: string) {
    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.authService.getUserId.pipe(take(1), switchMap(userId => {
        const newUser = new User(userId, username, email, image, fullName, bio, [''], [userId]);
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

  /**
   * Upload an image to Firebase storage
   *
   * @param {File} image
   * @returns
   * @memberof UsersService
   */
  uploadImage(image: File) {
    const uploadData = new FormData();

    uploadData.append('image', image);

    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.post<{ imageUrl: string, imagePath: string }>('https://us-central1-mmnt-io.cloudfunctions.net/storeImage', uploadData, { headers: { Authorization: 'Bearer ' + token } });
    }));
  }

  /**
   * Add a user to another user's friends list
   *
   * @param {string} userId Following user
   * @param {string} toFollowId User to follow
   * @returns
   * @memberof UsersService
   */
  follow(userId: string, toFollowId: string) {

    this.getUser(userId).pipe(take(1)).subscribe(user => {
      user.friendIds.concat(toFollowId);
    });

    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.get<string[]>(`https://mmnt-io.firebaseio.com/users/${userId}/friendIds.json/?auth=${token}`).pipe(take(1), tap(ids => {
        const key = ids.length;
        return this.http.patch<{ name: string }>(`https://mmnt-io.firebaseio.com/users/${userId}/friendIds.json/?auth=${token}`, {
          [key]: toFollowId
        }).subscribe();
      }));
    }));
  }

  /**
   * Remove a user form another user's friends list
   *
   * @param {string} userId
   * @param {string} toUnfollowId
   * @returns
   * @memberof UsersService
   */
  unfollow(userId: string, toUnfollowId: string) {
    this.getUser(userId).pipe(take(1)).subscribe(user => {
      user.friendIds = user.friendIds.filter(i => i !== toUnfollowId);
    });

    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.get<string[]>(`https://mmnt-io.firebaseio.com/users/${userId}/friendIds.json/?auth=${token}`).pipe(take(1), tap(ids => {
        const key = ids.findIndex(i => i === toUnfollowId);
        return this.http.delete(`https://mmnt-io.firebaseio.com/users/${userId}/friendIds/${key}.json/?auth=${token}`).subscribe();
      }));
    }));
  }

  /**
   * Check whether one user is following another
   *
   * @param {string} userId
   * @param {string} userToCheckId
   * @returns
   * @memberof UsersService
   */
  isFollowing(userId: string, userToCheckId: string) {
    return this.authService.getToken.pipe(take(1), map(token => {
      return this.http.get<string[]>(`https://mmnt-io.firebaseio.com/users/${userId}/friendIds.json/?auth=${token}`).pipe(take(1), map(friendIds => {
        return friendIds.some(id => {
          return id === userToCheckId;
        });
      }));
    }));
  }

  getNotifications(userId: string) {
    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.get<Notif[]>(`https://mmnt-io.firebaseio.com/users/${userId}/notifications.json/?auth=${token}`).pipe(take(1), map(resData => {
        let notifs = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            notifs.push({ text: resData[key].text, from: resData[key].from, type: resData[key].type });
          }
        }
        return notifs.reverse();
      }));
    }));
  }

  constructor(private http: HttpClient, private authService: AuthService) { }
}
