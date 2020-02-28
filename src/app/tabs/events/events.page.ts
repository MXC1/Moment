import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventContent } from 'src/app/event';
import { Subscription } from 'rxjs';
import { EventsService } from 'src/app/events.service';
import { AuthService } from 'src/app/auth/auth.service';
import { take } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { SearchComponent } from 'src/app/search/search.component';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
})
export class EventsPage implements OnInit, OnDestroy {
  loadedEvents: EventContent[];
  private eventsSubscription: Subscription;
  isLoading = false;

  constructor(private eventsService: EventsService, private authService: AuthService, private modalController: ModalController) { }

  ngOnInit() {
    this.isLoading = true;
    this.authService.getUserId.pipe(take(1)).subscribe(userId => {
      this.eventsSubscription = this.eventsService.fetchEvents().subscribe(events => {
        this.loadedEvents = events.filter(event => {
          let followedByUser = false;
          event.followerIds.forEach(followerId => {
            followedByUser = followerId === userId;
          });
          return followedByUser;
        });
        this.isLoading = false;
      });
    });

    // this.isLoading = true;
    // this.eventsSubscription = this.eventsService.fetchEvents().subscribe(events => {
    //   this.loadedEvents = events;
    //   this.isLoading = false;
    // });
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
  }

  onSearch() {
    this.modalController.create({ component: SearchComponent, componentProps: { toSearch: 'events' } }).then(modalElement => {
      modalElement.present();
    });
  }
}
