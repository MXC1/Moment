import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EventContent } from './event';
import { take, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth/auth.service';
import { UsersService } from './users.service';

interface EventData {
  name: string;
  location: string;
  creatorId: string;
  postIds: string[];
  followerIds: string[];
  headerImage: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private events = new BehaviorSubject<EventContent[]>([]);

  addEvent(name: string, location: string, type: string, headerImage: string, creatorId: string) {
    const newEvent = new EventContent('', name, location, creatorId, [], [creatorId], headerImage);
    let eventId;
    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.post<{ name: string }>(`https://mmnt-io.firebaseio.com/events.json?auth=${token}`, { ...newEvent, id: null })
        .pipe(take(1), switchMap(resData => {
          eventId = resData.name;
          return this.events;
        }), take(1),
          map(events => {
            newEvent.id = eventId;
            this.events.next(events.concat(newEvent));
            return newEvent;
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

  fetchEvents() {
    return this.authService.getToken.pipe(switchMap(token => {
      return this.http.get<{ [key: string]: EventData }>(`https://mmnt-io.firebaseio.com/events.json?auth=${token}`)
        .pipe(map(resData => {
          const events = [];
          for (const key in resData) {
            if (resData.hasOwnProperty(key)) {
              events.push(new EventContent(key,
                resData[key].name,
                resData[key].location,
                resData[key].creatorId,
                resData[key].postIds,
                resData[key].followerIds,
                resData[key].headerImage));
            }
          }
          return events.reverse();
        }), tap(events => {
          this.events.next(events);
        })
        );
    }));

  }

  getEvent(id: string) {
    return this.authService.getToken.pipe(switchMap(token => {
      return this.http.get<EventData>(`https://mmnt-io.firebaseio.com/events/${id}.json?auth=${token}`)
        .pipe(map(resData => {
          return new EventContent(id, resData.name, resData.location, resData.creatorId, resData.postIds, resData.followerIds, resData.headerImage);
        }));
    }));
  }

  get getEvents() {
    return this.events.asObservable();
  }

  follow(userId: string, eventId: string) {
    this.userService.getUser(userId).pipe(take(1)).subscribe(user => {
      user.followedEvents.concat(eventId);
    });

    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.get<string[]>(`https://mmnt-io.firebaseio.com/events/${eventId}/followerIds.json/?auth=${token}`).pipe(tap(followers => {
        const key = followers.length;

        return this.http.patch<{ name: string }>(`https://mmnt-io.firebaseio.com/events/${eventId}/followerIds.json/?auth=${token}`, {
          [key]: userId
        }).subscribe();
      }));
    }));

  }

  isFollowing(userId: string, eventId: string) {
    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.get<string[]>(`https://mmnt-io.firebaseio.com/events/${eventId}/followerIds.json/?auth=${token}`).pipe(tap(ids => {
        return ids.find(id => {
          return id !== userId;
        });
      }));
    }));
  }

  constructor(private http: HttpClient, private authService: AuthService, private userService: UsersService) { }
}
