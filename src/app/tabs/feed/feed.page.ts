import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from 'src/app/post';
import { PostsService } from 'src/app/posts.service';
import { Subscription, of } from 'rxjs';
import { UsersService } from 'src/app/users.service';
import { User } from 'src/app/user';
import { EventsService } from 'src/app/events.service';
import { EventContent } from 'src/app/event';
import { Router } from '@angular/router';
import { take, switchMap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { SearchComponent } from 'src/app/search/search.component';
import { AuthService } from 'src/app/auth/auth.service';
import { NewPostComponent } from './new-post/new-post.component';
import { PostDetailComponent } from './post-detail/post-detail.component';
import { PostDiscoverComponent } from './post-discover/post-discover.component';

/**
 * Feed of all posts by users or events the current user follows
 *
 * @export
 * @class FeedPage
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
})
export class FeedPage implements OnInit, OnDestroy {
  loadedPosts: Post[] = [];
  loadedUsers: User[];
  loadedEvents: EventContent[];
  private postsSubscription: Subscription;
  private usersSubscription: Subscription;
  private eventsSubscription: Subscription;
  isLoading = false;

  constructor(private postsService: PostsService, private usersService: UsersService, private eventsService: EventsService, public router: Router, private modalController: ModalController, private authService: AuthService) { }

  ngOnInit() { }

  /**
   * Load in all events and posts
   *
   * @memberof FeedPage
   */
  fetchFollowedPosts() {
    this.eventsSubscription = this.eventsService.fetchEvents().subscribe(events => {
      this.loadedEvents = events;
      this.postsSubscription = this.postsService.fetchPosts().subscribe(posts => {
        this.filterPosts(posts);
      });
    });
  }

  /**
   * Dispose of subscriptions
   *
   * @memberof FeedPage
   */
  ngOnDestroy() {
    if (this.postsSubscription) {
      this.postsSubscription.unsubscribe();
    }
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
    if (this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.fetchFollowedPosts();
  }

  /**
   * Check whether a post was made by a user or event that the current user follows
   * Filter the array accordingly
   *
   * @param {*} posts
   * @memberof FeedPage
   */
  filterPosts(posts) {
    this.authService.getUserId.pipe(take(1)).subscribe(userId => {
      this.usersService.getUser(userId).pipe(take(1)).subscribe(currentUser => {
        this.loadedPosts = posts.filter(post => {
          let followsUser;
          let followsEvent;

          currentUser.friendIds.forEach(person => {
            if (!followsUser) {
              followsUser = person === post.userId;
            }

          });

          this.loadedEvents.forEach(event => {
            if (event.id === post.eventId) {
              event.followerIds.forEach(follower => {
                if (!followsUser) {
                  followsEvent = follower === userId;
                }
              });
            }
          });

          return followsUser || followsEvent;
        });
      });
      this.usersSubscription = this.usersService.fetchUsers().subscribe(users => {
        this.loadedUsers = users;
        this.isLoading = false;
      });
    });

  }

  /**
   * Get a single user 
   *
   * @param {string} id
   * @returns {User}
   * @memberof FeedPage
   */
  getUser(id: string): User {
    if (this.loadedUsers) {
      return this.loadedUsers.find(user => user.id === id);
    }
  }

  /**
   * Get a single event
   *
   * @param {string} id
   * @returns {EventContent}
   * @memberof FeedPage
   */
  getEvent(id: string): EventContent {
    if (this.loadedEvents) {
      return this.loadedEvents.find(event => event.id === id);
    }
  }

  /**
   * Open search modal
   *
   * @memberof FeedPage
   */
  onSearch() {
    this.modalController.create({ component: SearchComponent, componentProps: { toSearch: 'posts' } }).then(modalElement => {
      modalElement.present();
    });
  }

  /**
   * Open new post modal and refresh posts to show the latest
   *
   * @memberof FeedPage
   */
  async onNewPost() {
    const newPostModal = await this.modalController.create({ component: NewPostComponent });
    newPostModal.onDidDismiss().then(() => {
      this.postsSubscription = this.postsService.fetchPosts().subscribe(posts => {
        this.fetchFollowedPosts();
      });
    });
    newPostModal.present();
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

  /**
   * Open discover modal
   *
   * @memberof FeedPage
   */
  async onDiscoverPosts() {
    const onDiscoverEventsModal = await this.modalController.create({ component: PostDiscoverComponent });
    onDiscoverEventsModal.onDidDismiss().then(() => {
      this.fetchFollowedPosts();
    });
    onDiscoverEventsModal.present();
  }

  /**
   * Play or pause a video element
   *
   * @param {*} thisDiv
   * @memberof FeedPage
   */
  playPause(thisDiv) {
    const thisVideo = thisDiv.children[0];
    const thisButton = thisDiv.children[1];

    if (thisVideo.paused) {
      thisVideo.play();
      thisButton.style = 'display: none';
    } else {
      thisVideo.pause();
      thisButton.style = 'display: inline';
    }
  }

  /**
   * Called when a users name is pressed
   * Determines whether to navigate to the profile or people page
   *
   * @param {string} postUserId
   * @memberof FeedPage
   */
  onClickUser(postUserId: string) {
    this.authService.getUserId.pipe(take(1)).subscribe(thisUserId => {
      if (thisUserId === postUserId) {
        this.router.navigateByUrl('/tabs/profile');
      } else {
        this.router.navigateByUrl('/tabs/people/' + postUserId);
      }
    });
  }

  onPostLike(id: string) { }

  onPostComment(id: string) { }

  onPostShare(id: string) { }

}
