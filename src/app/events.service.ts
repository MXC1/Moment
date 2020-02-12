import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EventContent } from './event';
import { take, map, switchMap, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private events = new BehaviorSubject<EventContent[]>([
    new EventContent(
      'e1',
      'SkankAndBass',
      'u1'
    ),
    new EventContent(
      'e2',
      'Metallica @ O2 Arena',
      'u2'
    ),
    new EventContent(
      'e3',
      'Jane and Barry\'s Wedding',
      'u3'
    )
  ]);

  addEvent(name: string, creatorId: string) {
    const newEvent = new EventContent('', name, creatorId);
    let eventId;
    return this.http.post<{name: string}>('https://momentio.firebaseio.com/events.json', {...newEvent, id: null})
    .pipe(take(1), switchMap(resData => {
      eventId = resData.name;
      return this.events;
    }), take(1),
    tap(users => {
      newEvent.id = eventId;
      this.events.next(users.concat(newEvent));
    }));
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
