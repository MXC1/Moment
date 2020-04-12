import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { User } from '../user';
import { EventContent } from '../event';
import { Post } from '../post';
import { UsersService } from '../users.service';
import { PostsService } from '../posts.service';
import { EventsService } from '../events.service';
import { take } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { EventDetailComponent } from '../tabs/events/event-detail/event-detail.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  @Input() toSearch: 'people' | 'posts' | 'events';
  filteredUsers: User[];
  filteredPosts: Post[];
  filteredEvents: EventContent[];

  isLoading = false;

  constructor(private modalController: ModalController, private usersService: UsersService, private postsService: PostsService, private eventsService: EventsService, private authService: AuthService) { }

  ngOnInit() { }

  closeModal() {
    this.modalController.dismiss();
  }

  filterList(event) {
    const searchValue = event.srcElement.value;
    this.isLoading = true;

    switch (this.toSearch) {
      case 'people': {
        this.filterUsers(searchValue);
        this.isLoading = false;

        break;
      }
      case 'posts': {
        this.filterPosts(searchValue);
        this.isLoading = false;

        break;
      }
      case 'events': {
        this.filterEvents(searchValue);
        this.isLoading = false;

        break;
      }
      default: {
        this.closeModal();
        break;
      }
    }
  }

  filterUsers(searchValue: string) {
    if (!this.filteredUsers) {
      this.authService.getUserId.pipe(take(1)).subscribe(thisUserId => {
        this.usersService.fetchUsers().pipe(take(1)).subscribe(users => {
          this.filteredUsers = users.filter(user => {
            return ((user.username.includes(searchValue) || user.fullName.includes(searchValue) || user.username.includes(searchValue.toUpperCase()) || user.fullName.includes(searchValue.toUpperCase()) || user.username.includes(searchValue.toLowerCase()) || user.fullName.includes(searchValue.toLowerCase())) && user.id !== thisUserId);
          });
        });
      });
    } else {
      this.authService.getUserId.pipe(take(1)).subscribe(thisUserId => {
        this.usersService.getUsers.pipe(take(1)).subscribe(users => {
          this.filteredUsers = users.filter(user => {            
            return ((user.username.includes(searchValue) || user.fullName.includes(searchValue) || user.username.includes(searchValue.toUpperCase()) || user.fullName.includes(searchValue.toUpperCase()) || user.username.includes(searchValue.toLowerCase()) || user.fullName.includes(searchValue.toLowerCase())) && user.id !== thisUserId);
          });
        });
      });
    }
  }

  filterEvents(searchValue: string) {
    if (!this.filteredEvents) {
      this.eventsService.fetchEvents().pipe(take(1)).subscribe(events => {
        this.filteredEvents = events.filter(event => {
          return (event.name.includes(searchValue) || event.name.includes(searchValue.toUpperCase()) || event.name.includes(searchValue.toLowerCase()));
        });
      });
    } else {
      this.eventsService.getEvents.pipe(take(1)).subscribe(events => {
        this.filteredEvents = events.filter(event => {
          return (event.name.includes(searchValue) || event.name.includes(searchValue.toUpperCase()) || event.name.includes(searchValue.toLowerCase()));
        });
      });
    }
  }

  filterPosts(searchValue: string) {
    if (!this.filteredPosts) {
      this.eventsService.fetchEvents().pipe(take(1)).subscribe(events => {
        this.filteredEvents = events;
        this.postsService.fetchPosts().pipe(take(1)).subscribe(posts => {
          this.filteredPosts = posts.filter(post => {
            return (post.caption.includes(searchValue));
          });
        });
      });
    } else {
      this.postsService.getPosts.pipe(take(1)).subscribe(posts => {
        this.filteredPosts = posts.filter(post => {
          return (post.caption.includes(searchValue) || post.caption.includes(searchValue.toUpperCase()) || post.caption.includes(searchValue.toLowerCase()));
        });
      });
    }
  }

  getEvent(eventId: string) {
    if (this.filteredEvents) {
      return this.filteredEvents.find(event => event.id === eventId);
    }
  }

  async onEventDetail(eventId: string) {
    const onEventDetailModal = await this.modalController.create({ component: EventDetailComponent, componentProps: { eventId } });
    onEventDetailModal.onDidDismiss().then(didFollow => {
      if (didFollow.data.didFollow) {
        this.eventsService.fetchEvents().subscribe();
        this.postsService.fetchPosts().subscribe();
      }
    });
    onEventDetailModal.present();
  }
}
