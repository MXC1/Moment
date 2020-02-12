import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EventContent } from './event';
import { take, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface EventData {
  name: string;
  creatorId: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private events = new BehaviorSubject<EventContent[]>([]);

  addEvent(name: string, creatorId: string) {
    const newEvent = new EventContent('', name, creatorId);
    let eventId;
    return this.http.post<{name: string}>('https://mmnt-io.firebaseio.com/events.json', {...newEvent, id: null})
    .pipe(take(1), switchMap(resData => {
      eventId = resData.name;
      return this.events;
    }), take(1),
    tap(users => {
      newEvent.id = eventId;
      this.events.next(users.concat(newEvent));
    }));
  }

  fetchEvents() {
    return this.http.get<{ [key: string]: EventData }>('https://mmnt-io.firebaseio.com/events.json')
      .pipe(map(resData => {
        const events = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            events.push(new EventContent(key, resData[key].name, resData[key].creatorId));
          }
        }
        return events;
      }), tap(events => {
        this.events.next(events);
      })
      );
  }

  get getEvents() {
    return this.events.asObservable();
  }

  getEvent(id: string) {
    return this.events.pipe(take(1), map(events => {
      return { ...events.find(e => e.id === id) };
    }));
  }

  constructor(private http: HttpClient) { }
}
