import { Injectable } from '@angular/core';
import { User } from './user';
import { BehaviorSubject } from 'rxjs';
import { take, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private users = new BehaviorSubject<User[]>([
    new User('u1',
      'rigmonkey01',
      'rig@email.com',
      'https://i1.sndcdn.com/artworks-000260625248-3xsfb1-t500x500.jpg',
      '',
      'Eggtek last week was a madness',
      ['p1'],
      ['u2']),
    new User('u2',
      'heavymetaldude',
      'metal@email.com',
      'https://i.pinimg.com/originals/e9/01/ca/e901ca35a83758be3ed29dc97d9f7f9f.jpg',
      'Jake Walton',
      'I\'m a heavy metal and hard rock songwriter from Son, Norway. My music draws inspiration from various genres including power metal, 80s-era glam, folk, classical and traditional Japanese and Chinese music.',
      ['p2'],
      ['u1']),
    new User('u3',
      'sophisticatedbloke123',
      'james@email.com',
      'https://cunto.org/wp-content/uploads/2018/07/jacob-rees-mogg-square-1024x1024.jpg',
      'Jacob Rees-Mogg',
      'I love long walks and turning my nose up at poor people',
      ['p3'],
      []),
  ]);

  get getUsers() {
    return this.users.asObservable();
  }

  getUser(id: string) {
    return this.users.pipe(take(1), map(users => {
      return { ...users.find(u => u.id === id) };
    }));
  }

  addUser(email: string, fullname: string, username: string, password: string) {
    const newUser = new User('', username, email, '', fullname, '', [''], ['']);
    let userId;
    return this.http.post<{name: string}>('https://moment48.firebaseio.com/users.json', {...newUser, id: null})
    .pipe(take(1), switchMap(resData => {
      userId = resData.name;
      return this.users;
    }), take(1),
    tap(users => {
      newUser.id = userId;
      this.users.next(users.concat(newUser));
    }));
  }

  constructor(private http: HttpClient) { }
}
