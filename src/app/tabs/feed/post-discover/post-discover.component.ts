import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EventContent } from 'src/app/event';
import { Subscription } from 'rxjs';
import { EventsService } from 'src/app/events.service';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { UsersService } from 'src/app/users.service';
import { PostsService } from 'src/app/posts.service';
import { Post } from 'src/app/post';
import { User } from 'src/app/user';
import { PostDetailComponent } from '../post-detail/post-detail.component';
import { SegmentChangeEventDetail } from '@ionic/core';


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
  loadedEvents: EventContent[] = [];
  loadedPosts: Post[] = [];
  displayedPosts: { post: Post, weight: number }[] = [];
  loadedUsers: User[];
  private eventsSubscription: Subscription;
  isLoading = false;

  constructor(private modalController: ModalController, private eventsService: EventsService, private authService: AuthService, private usersService: UsersService, private postsService: PostsService) { }

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
        this.loadedEvents = allEvents;

        this.fetchPopularPosts();
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
    this.displayedPosts = [];

    this.authService.getUserId.pipe(take(1)).subscribe(userId => {

      this.postsService.fetchPosts().pipe(take(1)).subscribe(allPosts => {

        this.usersService.getUser(userId).pipe(take(1)).subscribe(currentUser => {
          this.loadedPosts = allPosts.filter(post => {
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


          this.loadedEvents.filter(eachEvent => {
            let followedByUser = false;
            eachEvent.followerIds.forEach(followerId => {
              if (followerId === userId) {
                followedByUser = followerId === userId;
              }
            });
            return followedByUser;
          }).forEach(eachMyFollowedEvent => {
            eachMyFollowedEvent.followerIds.forEach(eachFollowerId => {
              const tryPost = allPosts.filter(eachPost => {
                return eachPost.userId === eachFollowerId;
              });
              if (tryPost.length > 0) {
                if (!this.displayedPosts.some(p => p.post.id === tryPost[0].id)) {
                  if (!this.loadedPosts.some(p => p.id === tryPost[0].id)) {
                    this.displayedPosts = this.displayedPosts.concat({ post: tryPost[0], weight: 1 });
                  }
                } else {
                  this.displayedPosts.find(p => p.post.id === tryPost[0].id).weight = this.displayedPosts.find(p => p.post.id === tryPost[0].id).weight + 1;
                }
              }
            });
          });
        });
        this.displayedPosts = this.displayedPosts.sort((p1, p2) => {
          return p2.weight - p1.weight;
        });

        this.isLoading = false;
      });
    });
  }

  /**
   * Sort all the posts the user will not currently be shown already by how many likes they have 
   *
   * @memberof PostDiscoverComponent
   */
  fetchPopularPosts() {
    this.displayedPosts = [];

    this.postsService.fetchPosts().pipe(take(1)).subscribe(allPosts => {
      this.displayedPosts = this.displayedPosts.concat(allPosts.sort((p1, p2) => {
        return p2.likes - p1.likes;
      }).map(p => {
        return { post: p, weight: 1 }
      }));

      this.usersService.fetchUsers().pipe(take(1)).subscribe(allUsers => {
        this.loadedUsers = allUsers;
        
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
    if (event.detail.value === "popular") {
      this.fetchPopularPosts();
    } else {
      this.fetchTailoredPosts();
    }
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
    if (this.loadedEvents) {
      return this.loadedEvents.find(event => event.id === id);
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

  closeModal() {
    this.modalController.dismiss();
  }
}
