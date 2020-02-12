import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventContent } from 'src/app/event';
import { Subscription } from 'rxjs';
import { EventsService } from 'src/app/events.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit, OnDestroy {
  loadedEvents: EventContent[];
  private eventsSubscription: Subscription;
  isLoading = false;

  constructor(private eventsService: EventsService) { }

  ngOnInit() {
    this.eventsSubscription = this.eventsService.getEvents.subscribe(events => {
      this.loadedEvents = events;
    });
  }

  ngOnDestroy() {
    if (this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.eventsService.fetchEvents().subscribe(() => {
      this.isLoading = false;
    });
  }

}
