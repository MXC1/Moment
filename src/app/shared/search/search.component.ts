import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { User } from '../models/user';
import { EventContent } from '../models/event';
import { Post } from '../models/post';
import { UsersService } from '../services/users.service';
import { PostsService } from '../services/posts.service';
import { EventsService } from '../services/events.service';
import { take } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';
import { EventDetailComponent } from '../../tabs/events/event-detail/event-detail.component';
import { PostDetailComponent } from '../../tabs/feed/post-detail/post-detail.component';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  @Input() toSearch: 'people' | 'posts' | 'events';
  title: string;
  filteredUsers: User[];
  filteredPosts: Post[];
  filteredEvents: EventContent[];
  loadedUsers: User[];

  isLoading = false;

  constructor(private modalController: ModalController, private usersService: UsersService, private postsService: PostsService, private eventsService: EventsService, private authService: AuthService) { }

  ngOnInit() {
    this.title = this.toSearch.charAt(0).toUpperCase() + this.toSearch.slice(1);

    this.usersService.fetchUsers().pipe(take(1)).subscribe(allUsers => {
      this.loadedUsers = allUsers;
    })
  }

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
    this.authService.getUserId.pipe(take(1)).subscribe(thisUserId => {
      this.usersService.fetchUsers().pipe(take(1)).subscribe(users => {
        this.filteredUsers = users.filter(user => {
          return this.userFind(user, searchValue, thisUserId);
        });
      });
    });
  }

  userFind(user: User, searchValue: string, thisUserId: string) {
    return (user.username.toLowerCase().includes(searchValue.toLowerCase()) || user.fullName.toLowerCase().includes(searchValue.toLowerCase())) && user.id !== thisUserId;
  }

  filterEvents(searchValue: string) {
    this.eventsService.fetchEvents().pipe(take(1)).subscribe(events => {
      this.filteredEvents = events.filter(event => {
        return this.eventFind(event, searchValue);
      });
    });
  }

  eventFind(event: EventContent, searchValue: string) {
    return ((event.name.toLowerCase().includes(searchValue.toLowerCase())) && !event.isPrivate);
  }

  filterPosts(searchValue: string) {
    this.eventsService.fetchEvents().pipe(take(1)).subscribe(events => {
      this.filteredEvents = events;
      this.postsService.fetchPosts().pipe(take(1)).subscribe(posts => {
        this.filteredPosts = posts.filter(post => {
          const connectedEvent = events.find(e => e.id === post.eventId);
          return this.postFind(post, searchValue, connectedEvent);
        });
      });
    });
  }

  postFind(post: Post, searchValue: string, connectedEvent: EventContent) {
    return (post.caption.toLowerCase().includes(searchValue.toLowerCase()) || connectedEvent.name.toLowerCase().includes(searchValue.toLowerCase())) && !connectedEvent.isPrivate;
  }

  getEvent(eventId: string) {
    if (this.filteredEvents) {
      return this.filteredEvents.find(event => event.id === eventId);
    }
  }

  /**
   * Get a single user 
   *
   * @param {string} id
   * @returns {User}
   * @memberof FeedPage
   */
  getUser(id: string): User {
    return this.loadedUsers.find(user => user.id === id);
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

  /**
 * Open post detail modal
 *
 * @param {string} postId
 * @memberof FeedPage
 */
  onPostDetail(postId: string) {
    this.modalController.create({ component: PostDetailComponent, componentProps: { postId } }).then(modalElement => {
      modalElement.present();
    });
  }
}
