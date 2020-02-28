import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventContent } from '../event';
import { Subscription } from 'rxjs';
import { PostsService } from '../posts.service';
import { EventsService } from '../events.service';
import { UsersService } from '../users.service';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { Post } from '../post';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.page.html',
  styleUrls: ['./event-detail.page.scss'],
})
export class EventDetailPage implements OnInit, OnDestroy {
  event: EventContent;
  eventPosts: Post[];
  private postsSubscription: Subscription;
  private eventsSubscription: Subscription;
  private usersSubscription: Subscription;
  isFollowing = false;
  isLoading = false;

  constructor(private postsService: PostsService, private eventsService: EventsService, private usersService: UsersService, private route: ActivatedRoute, private navController: NavController, private alertController: AlertController) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('eventId')) {
        this.navController.navigateBack('/tabs/events');
        return;
      }
      const eventId = paramMap.get('eventId');
      this.isLoading = true;
      this.eventsSubscription = this.eventsService.getEvent(paramMap.get('eventId')).subscribe(event => {
        this.event = event;
        this.postsSubscription = this.postsService.getPosts.subscribe(posts => {
          this.eventPosts = posts.filter(post => post.eventId === eventId);
          this.isLoading = false;
        });
      }, error => {
        this.alertController.create({
          header: 'An Error Occurred', message: 'Event could not be found. Please try again later.', buttons: [{
            text: 'Okay', handler: () => {
              this.navController.navigateBack('/tabs/events');
            }
          }]
        }).then(alertElement => {
          alertElement.present();
        });
      });
    });
  }

  onFollowEvent() {}

  ngOnDestroy() {
    if (this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
  }
}
