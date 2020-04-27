import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { EventContent } from 'src/app/shared/models/event';
import { Subscription } from 'rxjs';
import { EventsService } from 'src/app/shared/services/events.service';
import { AuthService } from 'src/app/auth/auth.service';
import { take } from 'rxjs/operators';
import { ModalController, PopoverController } from '@ionic/angular';
import { SearchComponent } from 'src/app/shared/search/search.component';
import { NewEventComponent } from './new-event/new-event.component';
import { EventDetailComponent } from './event-detail/event-detail.component';
import { EventDiscoverComponent } from './event-discover/event-discover.component';
import { FilterOptionsComponent } from './filter-options/filter-options.component';
import { isUndefined } from 'util';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit, OnDestroy {
  loadedEvents: EventContent[] = [];
  private eventsSubscription: Subscription;
  isLoading = false;
  allEvents: EventContent[];
  filters: {
    pastEvents: boolean;
    upcomingEvents: boolean;
    fromDate: string;
    toDate: string;
    privateEvents: boolean;
    publicEvents: boolean;
  };
  @ViewChild('searchbar', { static: false }) searchbar;

  constructor(private eventsService: EventsService, private authService: AuthService, private modalController: ModalController, private popoverController: PopoverController) { }

  ngOnInit() {
    this.isLoading = true;
    this.fetchFollowedEvents();
  }

  ionViewWillEnter() {
    this.fetchFollowedEvents();

    this.filters = {
      pastEvents: true,
      upcomingEvents: true,
      fromDate: null,
      toDate: null,
      privateEvents: true,
      publicEvents: true
    }
  }

  fetchFollowedEvents() {
    this.authService.getUserId.pipe(take(1)).subscribe(userId => {
      this.eventsSubscription = this.eventsService.fetchEvents().subscribe(events => {
        events.filter(event => {
          let followedByUser = false;
          event.followerIds.forEach(followerId => {
            if (followerId === userId) {
              followedByUser = followerId === userId;
            }
            return followedByUser;
          });
          return followedByUser;
        }).forEach(e => {
          if (!this.loadedEvents.some(event => event.id === e.id)) {
            this.isLoading = true;
            this.loadedEvents = this.loadedEvents.reverse().concat(e).reverse();
            this.isLoading = false;
          }
        });
        this.allEvents = this.loadedEvents;

        this.isLoading = false;
      });
    });
  }

  ngOnDestroy() {
    if (this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
  }

  async onSearch() {
    const searchModal = await this.modalController.create({ component: SearchComponent, componentProps: { toSearch: 'events' } });
    searchModal.onDidDismiss().then(resData => {
      if (resData.data.update) {
        this.updateEvent(resData.data.eventId);
      }
    })
    searchModal.present();
  }

  async onNewEvent() {
    const newEventModal = await this.modalController.create({ component: NewEventComponent });

    newEventModal.onDidDismiss().then(() => {
      this.fetchFollowedEvents();
    });

    newEventModal.present();
  }

  async onEventDetail(eventId: string) {
    const onEventDetailModal = await this.modalController.create({ component: EventDetailComponent, componentProps: { eventId } });
    onEventDetailModal.onDidDismiss().then(resData => {
      if (resData.data.update) {
        this.updateEvent(resData.data.eventId);
      }
    });
    onEventDetailModal.present();
  }

  updateEvent(eventId: string) {
    this.eventsService.getEvent(eventId).pipe(take(1)).subscribe(event => {

      if (isUndefined(event)) {
        // Event was deleted
        this.loadedEvents = this.loadedEvents.filter(e => e.id !== eventId);
      } else {
        const index = this.loadedEvents.findIndex(e => e.id === eventId);
        if (index === -1) {
          // Event was followed
          this.loadedEvents = this.loadedEvents.reverse().concat(event).reverse();
        } else {
          // Event was unfollowed
          this.loadedEvents = this.loadedEvents.filter(e => e.id !== eventId);
        }
      }
    });
  }

  async onDiscoverEvents() {
    const onDiscoverEventsModal = await this.modalController.create({ component: EventDiscoverComponent });
    onDiscoverEventsModal.onDidDismiss().then(() => {
      this.fetchFollowedEvents();
    });
    onDiscoverEventsModal.present();
  }

  async onFilter(event) {
    const popover = await this.popoverController.create({
      component: FilterOptionsComponent,
      event: event,
      backdropDismiss: false,
      componentProps: {
        pastEvents: this.filters.pastEvents,
        upcomingEvents: this.filters.upcomingEvents,
        fromDate: this.filters.fromDate,
        toDate: this.filters.toDate,
        privateEvents: this.filters.privateEvents,
        publicEvents: this.filters.publicEvents
      }
    });
    popover.onDidDismiss().then(filters => {
      this.filters.pastEvents = filters.data.pastEvents;
      this.filters.upcomingEvents = filters.data.upcomingEvents;
      this.filters.fromDate = filters.data.fromDate;
      this.filters.toDate = filters.data.toDate;
      this.filters.privateEvents = filters.data.privateEvents;
      this.filters.publicEvents = filters.data.publicEvents;
      this.filterEvents();
    });
    return popover.present();
  }

  filterPastEvents(events: EventContent[]) {
    return events.filter(e => new Date(e.date).getTime() > new Date().getTime());
  }

  filterFutureEvents(events: EventContent[]) {
    return events.filter(e => new Date(e.date).getTime() < new Date().getTime());
  }

  filterFromDate(events: EventContent[], fromDate: string) {
    return events.filter(e => new Date(e.date).getTime() >= new Date(fromDate).getTime());
  }

  filterToDate(events: EventContent[], toDate: string) {
    return events.filter(e => new Date(e.date).getTime() <= new Date(toDate).getTime());
  }

  filterPrivateEvents(events: EventContent[]) {
    return events.filter(e => !e.isPrivate);
  }

  filterPublicEvents(events: EventContent[]) {
    return events.filter(e => e.isPrivate);
  }

  filterEvents() {
    let filteredEvents = this.allEvents;

    if (!this.filters.pastEvents) {
      filteredEvents = this.filterPastEvents(filteredEvents);
    }
    if (!this.filters.upcomingEvents) {
      filteredEvents = this.filterFutureEvents(filteredEvents);
    }
    if (this.filters.fromDate) {
      filteredEvents = this.filterFromDate(filteredEvents, this.filters.fromDate);
    }
    if (this.filters.toDate) {
      filteredEvents = this.filterToDate(filteredEvents, this.filters.toDate);
    }
    if (!this.filters.privateEvents) {
      filteredEvents = this.filterPrivateEvents(filteredEvents);
    }
    if (!this.filters.publicEvents) {
      filteredEvents = this.filterPublicEvents(filteredEvents);
    }

    this.searchbar.value = "";

    this.loadedEvents = filteredEvents;
  }

  searchEvents(event) {
    const searchValue = event.srcElement.value.toLowerCase();

    this.loadedEvents = this.allEvents.filter(e => e.name.toLowerCase().includes(searchValue) || e.location.toLowerCase().includes(searchValue));
  }
}
