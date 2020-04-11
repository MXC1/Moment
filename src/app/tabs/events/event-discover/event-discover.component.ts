import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EventContent } from 'src/app/event';
import { Subscription } from 'rxjs';
import { EventsService } from 'src/app/events.service';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { EventDetailComponent } from '../event-detail/event-detail.component';
import { UsersService } from 'src/app/users.service';

@Component({
  selector: 'app-event-discover',
  templateUrl: './event-discover.component.html',
  styleUrls: ['./event-discover.component.scss'],
})
export class EventDiscoverComponent implements OnInit {

  loadedEvents: EventContent[];
  displayedEvents: { event: EventContent, weight: number }[] = [];
  private eventsSubscription: Subscription;
  isLoading = false;

  constructor(private modalController: ModalController, private eventsService: EventsService, private authService: AuthService, private usersService: UsersService) { }

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
          });
          return followedByUser;
        });

        this.eventsService.fetchEvents().pipe(take(1)).subscribe(allEvents => {
          this.loadedEvents.forEach(myFollowedEvent => {
            myFollowedEvent.followerIds.forEach(followerId => {
              allEvents.filter(eachEvent => {
                let followedByUser = false;
                eachEvent.followerIds.forEach(eventFollowerId => {
                  if (eventFollowerId === followerId) {
                    followedByUser = eventFollowerId === followerId;
                  }
                });
                return followedByUser;
              }).forEach(followerFollowedEvent => {
                if (!this.displayedEvents.some(e => e.event.id === followerFollowedEvent.id)) {
                  if (!this.loadedEvents.some(e => e.id === followerFollowedEvent.id)) {
                    this.displayedEvents = this.displayedEvents.concat({ event: followerFollowedEvent, weight: 1 });
                  }
                } else {
                  this.displayedEvents.find(e => e.event.id === followerFollowedEvent.id).weight = this.displayedEvents.find(e => e.event.id === followerFollowedEvent.id).weight + 1;
                }
              });

              this.displayedEvents = this.displayedEvents.sort((e1, e2) => {
                return e2.weight - e1.weight;
              });

              this.isLoading = false;
            });
          });
        });

      });
    });
  }

  closeModal() {
    this.modalController.dismiss();
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
}
