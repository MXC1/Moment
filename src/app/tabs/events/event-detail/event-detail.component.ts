import { Component, OnInit, OnDestroy, Input, Output } from '@angular/core';
import { EventContent } from '../../../event';
import { Subscription } from 'rxjs';
import { PostsService } from '../../../posts.service';
import { EventsService } from '../../../events.service';
import { UsersService } from '../../../users.service';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { Post } from '../../../post';
import { AuthService } from '../../../auth/auth.service';
import { take } from 'rxjs/operators';
import { NewPostComponent } from '../../../tabs/feed/new-post/new-post.component';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss'],
})
export class EventDetailComponent implements OnInit, OnDestroy {
  event: EventContent;
  eventPosts: Post[];
  private postsSubscription: Subscription;
  private eventsSubscription: Subscription;
  private usersSubscription: Subscription;
  isFollowing = false;
  isLoading = false;
  @Input() eventId;
  didFollow = false;

  constructor(private postsService: PostsService, private eventsService: EventsService, private usersService: UsersService, private authService: AuthService, private route: ActivatedRoute, private navController: NavController, private alertController: AlertController, private modalController: ModalController) { }

  ngOnInit() {

      this.isLoading = true;
      this.eventsSubscription = this.eventsService.getEvent(this.eventId).subscribe(event => {
        this.event = event;
        this.postsSubscription = this.postsService.getPosts.subscribe(posts => {
          this.eventPosts = posts.filter(post => post.eventId === this.eventId);
          this.authService.getUserId.pipe(take(1)).subscribe(thisUserId => {
            this.eventsService.isFollowing(thisUserId, this.eventId).pipe(take(1)).subscribe(isFollowing => {
              this.isFollowing = isFollowing;
              this.isLoading = false;
            });
          });
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
  }

  onFollowEvent() {
    this.isFollowing = true;
    this.authService.getUserId.pipe(take(1)).subscribe(id => {
      this.eventsService.follow(id, this.event.id).subscribe(() => {
        this.didFollow = true;
        console.log(this.didFollow);
      });
    });
  }

  onNewPost() {
    this.modalController.create({ component: NewPostComponent }).then(modalElement => {
      modalElement.present();
    });
  }

  closeModal() {
    this.modalController.dismiss({didFollow: this.didFollow});
  }

  ngOnDestroy() {
    if (this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
  }
}