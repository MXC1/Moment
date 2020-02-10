import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EventContent } from './event';
import { take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EventsService {
  private events = new BehaviorSubject<EventContent[]>([
    new EventContent(
      'e1',
      'SkankAndBass',
      'u1',
      ['p1'],
      ['u1']
    ),
    new EventContent(
      'e2',
      'Metallica @ O2 Arena',
      'u2',
      ['p2'],
      ['u1, u2']
    ),
    new EventContent(
      'e3',
      'Jane and Barry\'s Wedding',
      'u3',
      ['p3'],
      ['u3']
    )
  ]);

  get getEvents() {
    return this.events.asObservable();
  }

  getEvent(id: string) {
    return this.events.pipe(take(1), map(events => {
      return { ...events.find(e => e.id === id) };
    }));
  }

  constructor() { }
}
