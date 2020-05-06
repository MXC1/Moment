import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EventContent } from 'src/app/shared/models/event';
import { Subscription } from 'rxjs';
import { EventsService } from 'src/app/shared/services/events.service';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { EventDetailComponent } from '../event-detail/event-detail.component';
import { UsersService } from 'src/app/shared/services/users.service';
import { SegmentChangeEventDetail } from '@ionic/core';

@Component({
  selector: 'app-event-discover',
  templateUrl: './event-discover.component.html',
  styleUrls: ['./event-discover.component.scss'],
})
export class EventDiscoverComponent implements OnInit {

  followedEvents: EventContent[];
  displayedEvents: { event: EventContent, weight: number }[] = [];
  loadedEvents: { event: EventContent, weight: number }[] = [];
  private eventsSubscription: Subscription;
  isLoading = false;

  @ViewChild('searchbar', { static: false }) searchbar;

  constructor(private modalController: ModalController, private eventsService: EventsService, private authService: AuthService, private usersService: UsersService) { }

  ngOnInit() {
    this.isLoading = true;
    this.fetchAllEvents();
  }

  fetchTailoredEvents() {
    this.isLoading = true;
    this.loadedEvents = [];
    this.authService.getUserId.pipe(take(1)).subscribe(userId => {
      this.eventsSubscription = this.eventsService.fetchEvents().subscribe(allEvents => {
        this.followedEvents = allEvents.filter(e => e.followerIds.some(i => i === userId));

        // For each event I follow
        this.followedEvents.forEach(le => {
          // For each person that follows this event
          le.followerIds.forEach(lef => {
            // For each event this person follows
            allEvents.filter(e => e.followerIds.some(fi => fi === lef)).forEach(event => {
              // If event hasn't been found and added already
              if (!this.loadedEvents.some(e => e.event.id === event.id)) {
                // If event isn't already in my feed & event isn't private
                if (!this.followedEvents.some(e => e.id === event.id) && !event.isPrivate) {
                  this.loadedEvents = this.loadedEvents.concat({ event: event, weight: 1 });
                }
              } else {
                this.loadedEvents.find(e => e.event.id === event.id).weight++;
              }  
            })
          })
        })

        this.loadedEvents = this.loadedEvents.sort((e1, e2) => {
          return e2.weight - e1.weight;
        });

        this.displayedEvents = this.loadedEvents;

        this.isLoading = false;
      });

    });
  }

  fetchPopularEvents() {
    this.isLoading = true;

    this.loadedEvents = [];

    this.authService.getUserId.pipe(take(1)).subscribe(userId => {
      this.eventsService.fetchEvents().pipe(take(1)).subscribe(allEvents => {

        // Events already being followed
        this.followedEvents = allEvents.filter(e => e.followerIds.some(i => i === userId));

        this.loadedEvents = allEvents.filter(e => !e.isPrivate
          && !this.followedEvents.some(le => le.id === e.id))
          .sort((e1, e2) => e2.followerIds.length - e1.followerIds.length)
          .map(e => {
            return { event: e, weight: 1 };
          });

        this.displayedEvents = this.loadedEvents;

        this.isLoading = false;
      });
    });
  }

  fetchAllEvents() {
    this.isLoading = true;

    this.loadedEvents = [];

    this.authService.getUserId.pipe(take(1)).subscribe(userId => {
      this.eventsService.fetchEvents().pipe(take(1)).subscribe(allEvents => {

        // Events already followed
        this.followedEvents = allEvents.filter(e => e.followerIds.some(i => i === userId));

        this.loadedEvents = allEvents.filter(e => !e.isPrivate
          && !this.followedEvents.some(le => le.id === e.id))
          .reverse()
          .map(e => {
            return { event: e, weight: 1 };
          });

        this.displayedEvents = this.loadedEvents;

        this.isLoading = false;
      });
    });
  }

  onSearch(event) {
    const searchValue = event.srcElement.value.toLowerCase();

    this.displayedEvents = this.loadedEvents.filter(e => e.event.name.toLowerCase().includes(searchValue) || e.event.location.toLowerCase().includes(searchValue));
  }

  onChangeSegment(event: CustomEvent<SegmentChangeEventDetail>) {
    this.searchbar.value = "";

    if (event.detail.value === "popular") {
      this.fetchPopularEvents();
    } else if (event.detail.value === "tailored") {
      this.fetchTailoredEvents();
    } else if (event.detail.value === "all") {
      this.fetchAllEvents();
    }
  }

  closeModal() {
    this.modalController.dismiss();
  }

  async onEventDetail(eventId: string) {
    const onEventDetailModal = await this.modalController.create({ component: EventDetailComponent, componentProps: { eventId } });
    onEventDetailModal.present();
  }
}
