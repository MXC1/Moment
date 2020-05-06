import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Post } from 'src/app/shared/models/post';
import { PostsService } from 'src/app/shared/services/posts.service';
import { Subscription, of } from 'rxjs';
import { UsersService } from 'src/app/shared/services/users.service';
import { User } from 'src/app/shared/models/user';
import { EventsService } from 'src/app/shared/services/events.service';
import { EventContent } from 'src/app/shared/models/event';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { ModalController, IonInput } from '@ionic/angular';
import { SearchComponent } from 'src/app/shared/search/search.component';
import { AuthService } from 'src/app/auth/auth.service';
import { NewPostComponent } from './new-post/new-post.component';
import { PostDetailComponent } from './post-detail/post-detail.component';
import { PostDiscoverComponent } from './post-discover/post-discover.component';
import { EventDetailComponent } from '../events/event-detail/event-detail.component';
import { PostExtra } from 'src/app/shared/models/post-extra';
import { isUndefined } from 'util';
import { PlacesService } from 'src/app/shared/services/places.service';

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
  loadedPosts: PostExtra[] = [];
  loadedUsers: User[];
  loadedEvents: EventContent[];
  private postsSubscription: Subscription;
  private usersSubscription: Subscription;
  private eventsSubscription: Subscription;
  isLoading = false;

  @ViewChild(IonInput, { static: false }) commentBox;
  comment: string;

  constructor(private postsService: PostsService, private usersService: UsersService, private eventsService: EventsService, public router: Router, private modalController: ModalController, private authService: AuthService, private placesService: PlacesService) { }

  ngOnInit() {
    this.isLoading = true;
    this.fetchFollowedPosts();
  }

  ionViewDidEnter() {
    this.fetchFollowedPosts();
  }

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
        this.isLoading = false;              
      });
    });
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
        this.usersSubscription = this.usersService.fetchUsers().subscribe(users => {
          this.eventsSubscription = this.eventsService.fetchEvents().subscribe(events => {

            const followedPosts = posts.filter(post => {
              // Find every post that is (posted by a friend OR is posted under an event I follow) AND (is not private OR is posted by me)
              return (currentUser.friendIds.some(p => p === post.userId)
                || this.loadedEvents.some(e => e.followerIds.some(f => f === userId) && e.id === post.eventId))
                && this.loadedEvents.some(e => e.id === post.eventId && !e.isPrivate
                  || post.userId === userId)
            });

            followedPosts.forEach(p => {
              p.user = users.find(user => user.id === p.userId);
              p.event = events.find(event => event.id === p.eventId);

              if (p.likers) {
                p.hasLiked = p.likers.some(l => l === userId);
              }

              this.placesService.getPlace(p.event.location).pipe(take(1)).subscribe(place => {

                let placeName;
                // For backwards compatibility
                if (isUndefined(place)) {
                  placeName = p.event.location;
                } else {
                  placeName = place.name;
                }
                p.locationName = placeName;

                // If it's not already in the loadedposts
                if (!this.loadedPosts.some(post => post.id === p.id)) {
                  // Add it to the top
                  this.isLoading = true;
                  this.loadedPosts = this.loadedPosts.reverse().concat(p).reverse();
                  this.isLoading = false;
                }
              });

            });
            // Check for posts under no-longer-followed events or users
            this.loadedPosts.forEach(p => {
              
              if (!followedPosts.some(post => post.id === p.id)) {
                // Remove it
                this.isLoading = true;
                this.loadedPosts = this.loadedPosts.filter(post => post.id !== p.id);
                this.isLoading = false;
              }
            })
            this.loadedPosts = this.loadedPosts.sort((p1, p2) => new Date(p1.posted).getTime() - new Date(p2.posted).getTime()).reverse();
          });
        });
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
  async onPostDetail(postId: string) {

    const postDetailModal = await this.modalController.create({ component: PostDetailComponent, componentProps: { postId } });

    postDetailModal.onDidDismiss().then(resData => {
      if (resData.data.update) {
        this.isLoading = true;
        this.updatePost(resData.data.postId);
      }
    });
    postDetailModal.present();
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

  onPostLike(postId: string) {
    this.loadedPosts.find(p => p.id === postId).hasLiked = true;
    this.postsService.likePost(postId).subscribe(() => {
      this.updatePost(postId);
    });
  }

  onPostUnLike(postId: string) {
    this.loadedPosts.find(p => p.id === postId).hasLiked = false;
    this.postsService.unLikePost(postId).subscribe(() => {
      this.updatePost(postId);
    });
  }

  updatePost(postId: string) {
    this.authService.getUserId.pipe(take(1)).subscribe(userId => {
      this.postsService.getPost(postId).pipe(take(1)).subscribe(post => {
        if (isUndefined(post)) {
          this.loadedPosts = this.loadedPosts.filter(p => p.id !== postId);
          this.isLoading = false;
        } else {
          this.usersService.fetchUsers().pipe(take(1)).subscribe(users => {
            this.eventsService.fetchEvents().pipe(take(1)).subscribe(events => {

              const postUser = users.find(user => user.id === post.userId);
              const postEvent = events.find(event => event.id === post.eventId);

              let postHasLiked;
              if (post.likers) {
                postHasLiked = post.likers.some(l => l === userId);
              } else {
                postHasLiked = false;
              }

              this.placesService.getPlace(postEvent.location).pipe(take(1)).subscribe(place => {

                let placeName;
                // For backwards compatibility
                if (isUndefined(place)) {
                  placeName = postEvent.location;
                } else {
                  placeName = place.name;
                }

                const index = this.loadedPosts.findIndex(p => p.id === postId);

                this.loadedPosts[index] = new PostExtra(post.id, post.userId, post.eventId, post.caption, post.content, post.type, post.comments, post.likers, post.shares, postUser, postEvent, postHasLiked, placeName, post.posted);

                this.isLoading = false;
              });
            });
          })
        }
      })
    });
  }

  onPostComment() {
    this.commentBox.setFocus();
  }

  onAddComment(postId: string) {
    this.authService.getUserId.pipe(take(1)).subscribe(thisUserId => {
      const comment = this.comment;

      this.postsService.addComment(postId, { [thisUserId]: comment });
      this.commentBox.value = '';
      this.updatePost(postId);
    });
  }
}
