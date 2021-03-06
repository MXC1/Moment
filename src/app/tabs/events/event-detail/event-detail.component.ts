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
import { PostDetailComponent } from '../../feed/post-detail/post-detail.component';
import { PlacesService } from 'src/app/shared/services/places.service';
import { Place } from 'src/app/shared/models/place';
import { isUndefined } from 'util';
import { PlaceComponent } from 'src/app/shared/place/place.component';

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
  update: boolean = false;

  @ViewChild('inviteSelectable', { static: false }) inviteSelectable: IonicSelectableComponent;
  private loadedPeople: User[];

  date: string;
  placeName: string;

  clickablePlace: boolean;

  constructor(private postsService: PostsService, private eventsService: EventsService, private usersService: UsersService, private authService: AuthService, private route: ActivatedRoute, private navController: NavController, private alertController: AlertController, private modalController: ModalController, private placesService: PlacesService) { }

  ngOnInit() {
    this.fetchEventDetails();
  }

  fetchEventDetails() {
    this.isLoading = true;
    this.eventsSubscription = this.eventsService.getEvent(this.eventId).subscribe(event => {
      this.event = event;
      const dateObject = new Date(event.date);
      this.date = this.dayOfTheWeek(dateObject.getDay()) + " " + dateObject.getDate().toString() + " " + this.monthOfTheYear(dateObject.getMonth() + 1) + " " + dateObject.getFullYear().toString();
      this.placesService.getPlace(this.event.location).pipe(take(1)).subscribe(place => {

        // For backwards compatibility
        if (isUndefined(place)) {
          this.clickablePlace = false;
          this.placeName = this.event.location;
        } else {
          this.clickablePlace = true;
          this.placeName = place.name;
        }
        this.postsSubscription = this.postsService.fetchPosts().subscribe(posts => {
          this.eventPosts = posts.filter(post => post.eventId === this.eventId);
          this.authService.getUserId.pipe(take(1)).subscribe(thisUserId => {
            this.eventsService.isFollowing(thisUserId, this.eventId).pipe(take(1)).subscribe(isFollowing => {
              this.isFollowing = isFollowing;
              this.authService.getUserId.pipe(take(1)).subscribe(userId => {
                this.usersService.getUser(userId).pipe(take(1)).subscribe(thisUser => {
                  this.thisUser = thisUser;
                  this.sortByRecent();
                  this.isLoading = false;
                });
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

  onChangeSegment(event) {
    switch (event.detail.value) {
      case ("recent"): {
        this.sortByRecent();
        break;
      }
      
      case ("likes"): {
        this.sortByLikes();
        break;
      }
    }
  }

  sortByRecent() {
    this.eventPosts = this.eventPosts.sort((e1, e2) => new Date(e2.posted).getTime() - new Date(e1.posted).getTime());
  }
  
  sortByLikes() {
    this.eventPosts = this.eventPosts.sort((e1, e2) => {
      let e1likes;
      let e2likes;

      e1likes = isUndefined(e1.likers) ? 0 : e1.likers.length;
      e2likes = isUndefined(e2.likers) ? 0 : e2.likers.length;

      return e2likes - e1likes;
    });
  }

  dayOfTheWeek(number: number) {
    switch (number) {
      case (0): {
        return 'Sun';
        break;
      }
      case (1): {
        return 'Mon';
        break;
      }
      case (2): {
        return 'Tue'
        break;
      }
      case (3): {
        return 'Wed'
        break;
      }
      case (4): {
        return 'Thu'
        break;
      }
      case (5): {
        return 'Fri'
        break;
      }
      case (6): {
        return 'Sat'
        break;
      }
    }
  }

  monthOfTheYear(number: number) {
    switch (number) {
      case (1): {
        return 'Jan';
        break;
      }
      case (2): {
        return 'Feb'
        break;
      }
      case (3): {
        return 'Mar'
        break;
      }
      case (4): {
        return 'Apr'
        break;
      }
      case (5): {
        return 'May'
        break;
      }
      case (6): {
        return 'Jun'
        break;
      }
      case (7): {
        return 'Jul'
        break;
      }
      case (8): {
        return 'Aug'
        break;
      }
      case (9): {
        return 'Sept'
        break;
      }
      case (10): {
        return 'Oct'
        break;
      }
      case (11): {
        return 'Nov'
        break;
      }
      case (12): {
        return 'Dec'
        break;
      }
    }
  }

  onFollowEvent() {
    this.isFollowing = true;
    this.authService.getUserId.pipe(take(1)).subscribe(id => {
      this.eventsService.follow(id, this.event.id).subscribe(() => {
        this.update = true;
      });
    });
  }

  onUnfollowEvent() {

    this.isFollowing = false;
    this.authService.getUserId.pipe(take(1)).subscribe(id => {
      this.eventsService.unfollow(id, this.event.id).subscribe(() => {
        this.update = true;
      });
    })
  }

  async onNewPost() {
    const newPostModal = await this.modalController.create({ component: NewPostComponent, componentProps: { event: this.event } });
    newPostModal.onDidDismiss().then(() => {
      this.fetchEventDetails();
    });
    newPostModal.present();
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
      case 'invite': {
        this.onInvite();
        break;
      }
    }
  }

  onDeleteEvent() {
    this.update = true;
    this.eventsService.deleteEvent(this.event.id);
    this.closeModal();
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
    this.modalController.dismiss({ update: this.update, eventId: this.eventId });
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

  onPostDetail(postId: string) {
    this.modalController.create({ component: PostDetailComponent, componentProps: { postId } }).then(modalElement => {
      modalElement.present();
    });
  }

  async onPlaceDetail() {
    if (this.clickablePlace) {
      const placeDetailModal = await this.modalController.create({ component: PlaceComponent, componentProps: { placeId: this.event.location } });
      placeDetailModal.present();
    }
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
