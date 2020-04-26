import { Component, OnInit, OnDestroy } from '@angular/core';
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

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit, OnDestroy {
  loadedEvents: EventContent[];
  private eventsSubscription: Subscription;
  isLoading = false;

  constructor(private eventsService: EventsService, private authService: AuthService, private modalController: ModalController, private popoverController: PopoverController) { }

  ngOnInit() {
    this.isLoading = true;
    this.fetchFollowedEvents();
  }

  fetchFollowedEvents() {
    this.authService.getUserId.pipe(take(1)).subscribe(userId => {
      this.eventsSubscription = this.eventsService.fetchEvents().subscribe(events => {
        this.loadedEvents = events.filter(event => {
          let followedByUser = false;
          event.followerIds.forEach(followerId => {
            if (followerId === userId) {
              followedByUser = followerId === userId;
            }
            return followedByUser;
          });
          return followedByUser;
        });

        this.isLoading = false;
      });
    });
  }

  ngOnDestroy() {
    if (this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
  }

  ionViewWillEnter() {
    this.authService.getUserId.pipe(take(1)).subscribe(userId => {
      if (!userId) {
        throw new Error('No User ID Found!');
      } else {
        this.eventsSubscription = this.eventsService.getEvents.subscribe(events => {
          this.loadedEvents = events.filter(event => {
            let followedByUser = false;
            event.followerIds.forEach(followerId => {
              followedByUser = followerId === userId;
            });
            return followedByUser;
          });
        });
      }
    });

    this.isLoading = true;
    this.fetchFollowedEvents();
  }

  onSearch() {
    this.modalController.create({ component: SearchComponent, componentProps: { toSearch: 'events' } }).then(modalElement => {
      modalElement.present();
    });
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
    onEventDetailModal.onDidDismiss().then(didFollow => {
      if (didFollow) {
        this.fetchFollowedEvents();
      }
    });
    onEventDetailModal.present();
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
      event: event
    });
    return popover.present();
  }
}
