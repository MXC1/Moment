import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EventContent } from './event';
import { take, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

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
    return this.http.post<{ name: string }>('https://mmnt-io.firebaseio.com/events.json', { ...newEvent, id: null })
      .pipe(take(1), switchMap(resData => {
        eventId = resData.name;
        return this.events;
      }), take(1),
        tap(users => {
          newEvent.id = eventId;
          this.events.next(users.concat(newEvent));
        }));
  }

  uploadImage(image: File) {

    const uploadData = new FormData();

    uploadData.append('image', image);

    return this.http.post<{ imageUrl: string, imagePath: string }>('https://us-central1-mmnt-io.cloudfunctions.net/storeImage', uploadData);
  }

  fetchEvents() {
    return this.http.get<{ [key: string]: EventData }>('https://mmnt-io.firebaseio.com/events.json')
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
        return events;
      }), tap(events => {
        this.events.next(events);
      })
      );
  }

  getEvent(id: string) {
    return this.http.get<EventData>(`https://mmnt-io.firebaseio.com/events/${id}.json`)
      .pipe(map(resData => {
        return new EventContent(id, resData.name, resData.location, resData.creatorId, resData.postIds, resData.followerIds, resData.headerImage);
      }));

    // this.fetchEvents().subscribe();

    // return this.events.pipe(take(1), map(events => {
    //   return { ...events.find(e => e.id === id) };
    // }));
  }

  get getEvents() {
    return this.events.asObservable();
  }

  constructor(private http: HttpClient) { }
}
