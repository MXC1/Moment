import { Component, OnInit, OnDestroy, Input, Output, ViewChild } from '@angular/core';
import { EventContent } from '../../../shared/models/event';
import { Subscription } from 'rxjs';
import { PostsService } from '../../../shared/services/posts.service';
import { EventsService } from '../../../shared/services/events.service';
import { UsersService } from '../../../shared/services/users.service';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController, ModalController, IonSelect } from '@ionic/angular';
import { Post } from '../../../shared/models/post';
import { AuthService } from '../../../auth/auth.service';
import { take } from 'rxjs/operators';
import { NewPostComponent } from '../../../tabs/feed/new-post/new-post.component';
import { User } from 'src/app/shared/models/user';
import { IonicSelectableComponent } from 'ionic-selectable';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss'],
})
export class EventDetailComponent implements OnInit, OnDestroy {
  event: EventContent;
  eventPosts: Post[] = [];
  private postsSubscription: Subscription;
  private eventsSubscription: Subscription;
  private usersSubscription: Subscription;
  thisUser: User;
  isFollowing = false;
  isLoading = false;
  @Input() eventId;
  @ViewChild('menu', { static: false }) menu: IonSelect;
  didFollow = false;

  @ViewChild('inviteSelectable', { static: false }) inviteSelectable: IonicSelectableComponent;
  private loadedPeople: User[];

  constructor(private postsService: PostsService, private eventsService: EventsService, private usersService: UsersService, private authService: AuthService, private route: ActivatedRoute, private navController: NavController, private alertController: AlertController, private modalController: ModalController) { }

  ngOnInit() {
    this.isLoading = true;
    this.eventsSubscription = this.eventsService.getEvent(this.eventId).subscribe(event => {
      this.event = event;
      this.postsSubscription = this.postsService.fetchPosts().subscribe(posts => {
        this.eventPosts = posts.filter(post => post.eventId === this.eventId);
        this.authService.getUserId.pipe(take(1)).subscribe(thisUserId => {
          this.eventsService.isFollowing(thisUserId, this.eventId).pipe(take(1)).subscribe(isFollowing => {
            this.isFollowing = isFollowing;
            this.authService.getUserId.pipe(take(1)).subscribe(userId => {
              this.usersService.getUser(userId).pipe(take(1)).subscribe(thisUser => {
                this.thisUser = thisUser;
                this.isLoading = false;
              });
            });
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
      });
    });
  }

  onUnfollowEvent() {

    this.isFollowing = false;
    this.authService.getUserId.pipe(take(1)).subscribe(id => {
      this.eventsService.unfollow(id, this.event.id).subscribe(() => {
        this.didFollow = true;
      });
    })
  }

  onNewPost() {
    this.modalController.create({ component: NewPostComponent, componentProps: { event: this.event } }).then(modalElement => {
      modalElement.present();
    });
  }

  onShowMenu() {
    this.menu.open();
  }

  isThisUsersEvent() {
    return this.thisUser.id === this.event.creatorId;
  }

  handleSelectOption(menu) {
    switch (menu.value) {
      case 'delete': {
        this.onDeleteEvent();
        break;
      }
      case 'public': {
        this.onMakePublic();
        break;
      }
      case 'private': {
        this.onMakePrivate();
        break;
      }
    }
  }

  onDeleteEvent() {
    this.eventsService.deleteEvent(this.event.id);
    this.modalController.dismiss();
  }

  onMakePublic() {
    this.eventsService.makePublic(this.eventId).subscribe(() => {
      this.event.isPrivate = false;
    });
  }


  onMakePrivate() {
    this.eventsService.makePrivate(this.eventId).subscribe(() => {
      this.event.isPrivate = true;
    });
  }

  closeModal() {
    this.modalController.dismiss({ didFollow: this.didFollow });
  }

  onInvite() {
    this.usersService.fetchUsers().pipe(take(1)).subscribe(users => {
      this.authService.getUserId.pipe(take(1)).subscribe(thisUserId => {
        this.usersService.getUser(thisUserId).pipe(take(1)).subscribe(thisUser => {
          this.loadedPeople = users.filter(user => thisUser.friendIds.some(u => u === user.id && u !== thisUserId));
        });
      });
    });
    this.inviteSelectable.open();
  }

  onInviteUser(event) {
    const userToInvite = event.value;

    this.usersService.generateNotification(userToInvite.id, 'You were invited to this event', this.event.id, 'event').subscribe();
  }

  ngOnDestroy() {
    if (this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
    if (this.postsSubscription) {
      this.postsSubscription.unsubscribe();
    }
  }
}
