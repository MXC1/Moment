import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EventContent } from '../models/event';
import { take, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { UsersService } from './users.service';

interface EventData {
  name: string;
  location: string;
  creatorId: string;
  postIds: string[];
  followerIds: string[];
  headerImage: string;
}

/**
 * Handles passing event data between the local and Firebase storage
 *
 * @export
 * @class EventsService
 */
@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private events = new BehaviorSubject<EventContent[]>([]);

  /**
   * Add an event to the database 
   *
   * @param {string} name
   * @param {string} location
   * @param {string} type
   * @param {string} headerImage URL of the header image
   * @param {string} creatorId ID of the event creator
   * @returns
   * @memberof EventsService
   */
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
            this.events.next(events.reverse().concat(newEvent).reverse());
            return newEvent;
          }));
    }));
  }

  /**
   * Remove an event from the database
   *
   * @param {string} eventId
   * @returns
   * @memberof EventsService
   */
  deleteEvent(eventId: string) {
    return this.authService.getToken.pipe(take(1)).subscribe(token => {
      return this.http.delete(`https://mmnt-io.firebaseio.com/events/${eventId}.json?auth=${token}`).pipe(take(1), switchMap(() => {
        return this.events;
      }), take(1), tap(events => {
        return this.events.next(events.filter(event => {
          return event.id !== eventId;
        }));
      })).subscribe();
    });
  }

  /**
   * Upload an image to Firebase storage
   *
   * @param {File} image
   * @returns
   * @memberof EventsService
   */
  uploadImage(image: File) {

    const uploadData = new FormData();

    uploadData.append('image', image);

    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.post<{ imageUrl: string, imagePath: string }>('https://us-central1-mmnt-io.cloudfunctions.net/storeImage', uploadData, { headers: { Authorization: 'Bearer ' + token } });
    }));
  }

  /**
   * Fetch all the events from the database 
   *
   * @returns
   * @memberof EventsService
   */
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

  /**
   * Fetch a single event from the database
   *
   * @param {string} id
   * @returns
   * @memberof EventsService
   */
  getEvent(id: string) {
    return this.authService.getToken.pipe<EventContent>(switchMap(token => {
      return this.http.get<EventData>(`https://mmnt-io.firebaseio.com/events/${id}.json?auth=${token}`)
        .pipe(map(resData => {
          if (resData !== null) {
            return new EventContent(id, resData.name, resData.location, resData.creatorId, resData.postIds, resData.followerIds, resData.headerImage);
          }
        }));
    }));
  }

  /**
   * Only called if fetchEvents has been called at least once already
   * Saves accessing the database twice if it can be helped
   *
   * @readonly
   * @memberof EventsService
   */
  get getEvents() {
    return this.events.asObservable();
  }

  /**
   * Add a user to an events follower list
   *
   * @param {string} userId
   * @param {string} eventId
   * @returns
   * @memberof EventsService
   */
  follow(userId: string, eventId: string) {
    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.get<string[]>(`https://mmnt-io.firebaseio.com/events/${eventId}/followerIds.json/?auth=${token}`).pipe(tap(followers => {
        const key = followers.length;

        return this.http.patch<{ name: string }>(`https://mmnt-io.firebaseio.com/events/${eventId}/followerIds.json/?auth=${token}`, {
          [key]: userId
        }).subscribe();
      }));
    }));

  }

  /**
   * Check whether a user is following a specific event or not
   *
   * @param {string} userId
   * @param {string} eventId
   * @returns
   * @memberof EventsService
   */
  isFollowing(userId: string, eventId: string) {
    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.get<string[]>(`https://mmnt-io.firebaseio.com/events/${eventId}/followerIds.json/?auth=${token}`).pipe(map(followerIds => {
        return !!(followerIds.find(id => {
          return !!(id === userId);
        }));
      }));
    }));
  }

  constructor(private http: HttpClient, private authService: AuthService, private userService: UsersService) { }
}
