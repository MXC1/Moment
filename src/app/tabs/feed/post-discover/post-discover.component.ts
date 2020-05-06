import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EventContent } from 'src/app/shared/models/event';
import { Subscription } from 'rxjs';
import { EventsService } from 'src/app/shared/services/events.service';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { PostsService } from 'src/app/shared/services/posts.service';
import { Post } from 'src/app/shared/models/post';
import { User } from 'src/app/shared/models/user';
import { PostDetailComponent } from '../post-detail/post-detail.component';
import { SegmentChangeEventDetail } from '@ionic/core';
import { Router } from '@angular/router';
import { EventDetailComponent } from '../../events/event-detail/event-detail.component';
import { isUndefined } from 'util';


/**
 * Modal for discovering new posts
 *
 * @export
 * @class PostDiscoverComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-post-discover',
  templateUrl: './post-discover.component.html',
  styleUrls: ['./post-discover.component.scss'],
})
export class PostDiscoverComponent implements OnInit {
  allEvents: EventContent[] = [];
  followedPosts: Post[] = [];
  displayedPosts: { post: Post, weight: number }[] = [];
  loadedPosts: { post: Post, weight: number }[] = [];
  loadedUsers: User[];
  private eventsSubscription: Subscription;
  isLoading = false;
  followedEvents: EventContent[];

  constructor(private modalController: ModalController, private eventsService: EventsService, private authService: AuthService, private usersService: UsersService, private postsService: PostsService, private router: Router) { }

  /**
   * Load in all users and events and load popular posts by default
   *
   * @memberof PostDiscoverComponent
   */
  ngOnInit() {
    this.isLoading = true;
    this.usersService.fetchUsers().pipe(take(1)).subscribe(allUsers => {
      this.loadedUsers = allUsers;
      this.eventsService.fetchEvents().pipe(take(1)).subscribe(allEvents => {
        this.allEvents = allEvents;
        this.authService.getUserId.pipe(take(1)).subscribe(userId => {
          this.followedEvents = allEvents.filter(e => e.followerIds.some(i => i === userId));

          this.fetchAllPosts();
        });
      });
    });
  }

  /**
   * Filter posts by those within the current users network
   * Shows posts by people who follow the same events as the current user
   * Weights each post by how many events the poster has in common with the user and sorts the list by this weight
   *
   * @memberof PostDiscoverComponent
   */
  fetchTailoredPosts() {
    this.isLoading = true;
    this.loadedPosts = [];

    this.authService.getUserId.pipe(take(1)).subscribe(userId => {
      this.postsService.fetchPosts().pipe(take(1)).subscribe(allPosts => {
        this.usersService.getUser(userId).pipe(take(1)).subscribe(currentUser => {

          // Find every post that is posted by a friend and in a non-private event or that is under an event I follow
          this.followedPosts = allPosts.filter(p =>
            (currentUser.friendIds.some(f => f === p.userId) && this.allEvents.some(e => !e.isPrivate && e.id === p.eventId))
            || this.allEvents.some(e => e.id === p.eventId && e.followerIds.some(f => f === userId)));

          // For each event I follow
          this.followedEvents.forEach(fe => {
            // For each follower of this event
            fe.followerIds.forEach(fi => {
              // For each post by this user
              allPosts.filter(ap => ap.userId == fi).forEach(post => {
                // If the post has not already been added to the displayed posts array
                if (!this.loadedPosts.some(p => p.post.id === post.id)) {
                  // If the post is not already in the users feed && event the post is associated with is not private
                  if (!this.followedPosts.some(p => p.id === post.id) && !this.allEvents.find(e => e.id === post.eventId).isPrivate) {
                    // Add it to the displayed posts array
                    this.loadedPosts = this.loadedPosts.concat({ post: post, weight: 1 });
                  }
                  // If the post has already been added to the displayed posts array, increment its weight
                } else {
                  this.loadedPosts.find(p => p.post.id === post.id).weight++;
                }
              })
            })
          })

          // Sort by post weight (how many times the post cropped up in the event => followers => posts search)
          // Puts posts the user is most likely to enjoy at the top
          this.loadedPosts = this.loadedPosts.sort((p1, p2) => {
            return p2.weight - p1.weight;
          });

          this.displayedPosts = this.loadedPosts;
          
          this.isLoading = false;
        });

      });
    });
  }

  /**
   * Sort all the posts the user will not currently be shown already by how many likes they have
   *
   * @memberof PostDiscoverComponent
   */
  fetchPopularPosts() {
    this.isLoading = true;
    this.loadedPosts = [];

    this.postsService.fetchPosts().pipe(take(1)).subscribe(allPosts => {
      this.eventsService.fetchEvents().pipe(take(1)).subscribe(allEvents => {
        // Filter out private events
        this.loadedPosts = allPosts.filter(p => allEvents.some(e => (e.id === p.eventId) && !e.isPrivate))
          // Sort by how many likes they have
          .sort((p1, p2) => {

            let p1Likes;
            let p2Likes;

            isUndefined(p1.likers) ? p1Likes = 0 : p1Likes = p1.likers.length;
            isUndefined(p2.likers) ? p2Likes = 0 : p2Likes = p2.likers.length;

            return p2Likes - p1Likes;

            // Map to post and weight configuration
            // Weight is never used but it means the view doesn't have to change depending on popular // tailored
          }).map(p => {
            return { post: p, weight: 1 };
          });

        this.displayedPosts = this.loadedPosts;

        this.isLoading = false;
      });
    });
  }

  fetchAllPosts() {
    this.isLoading = true;
    this.loadedPosts = [];

    this.postsService.fetchPosts().pipe(take(1)).subscribe(allPosts => {
      this.eventsService.fetchEvents().pipe(take(1)).subscribe(allEvents => {
        this.loadedPosts = allPosts.filter(p => allEvents.some(e => (e.id === p.eventId) && !e.isPrivate))
          .reverse()
          .map(p => {
            return { post: p, weight: 1 };
          });

        this.displayedPosts = this.loadedPosts;

        this.isLoading = false;
      });
    });
  }

  /**
   * Switch from popular to tailored or vice-versa
   *
   * @param {CustomEvent<SegmentChangeEventDetail>} event
   * @memberof PostDiscoverComponent
   */
  onChangeSegment(event: CustomEvent<SegmentChangeEventDetail>) {
    if (event.detail.value === 'popular') {
      this.fetchPopularPosts();
    } else if (event.detail.value === 'tailored') {
      this.fetchTailoredPosts();
    } else if (event.detail.value === 'all') {
      this.fetchAllPosts();
    }
  }

  onSearch(event) {
    const searchValue = event.srcElement.value.toLowerCase();

    this.displayedPosts = this.loadedPosts.filter(p => p.post.caption.toLowerCase().includes(searchValue) || this.allEvents.some(e => e.name.toLowerCase().includes(searchValue) && e.id === p.post.eventId));
  }

  /**
   * Get a single user
   *
   * @param {string} id
   * @returns {User}
   * @memberof PostDiscoverComponent
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
   * @memberof PostDiscoverComponent
   */
  getEvent(id: string): EventContent {
    if (this.allEvents) {
      return this.allEvents.find(event => event.id === id);
    }
  }

  /**
   * Open post detail modal
   *
   * @param {string} postId
   * @memberof PostDiscoverComponent
   */
  onPostDetail(postId: string) {
    this.modalController.create({ component: PostDetailComponent, componentProps: { postId } }).then(modalElement => {
      modalElement.present();
    });
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

  closeModal() {
    this.modalController.dismiss();
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
        this.closeModal();
      } else {
        this.router.navigateByUrl('/tabs/people/' + postUserId);
        this.closeModal();
      }
    });
  }

  onPostLike(postId: string) {
    this.postsService.likePost(postId).subscribe();
  }

  onPostComment(id: string) {
    this.onPostDetail(id);
  }
}
