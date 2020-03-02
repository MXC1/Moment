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

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
})
export class FeedPage implements OnInit, OnDestroy {

  constructor(private postsService: PostsService, private usersService: UsersService, private eventsService: EventsService, public router: Router, private modalController: ModalController, private authService: AuthService) { }
  loadedPosts: Post[] = [];
  loadedUsers: User[];
  loadedEvents: EventContent[];
  private postsSubscription: Subscription;
  private usersSubscription: Subscription;
  private eventsSubscription: Subscription;
  isLoading = false;

  ngOnInit() {
    this.isLoading = true;
    this.eventsSubscription = this.eventsService.fetchEvents().subscribe(events => {
      this.loadedEvents = events;
      this.postsSubscription = this.postsService.fetchPosts().subscribe(posts => {
        this.filterPosts(posts);
      });
    });
  }

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
    this.postsService.getPosts.subscribe(posts => {
      this.filterPosts(posts);
    });
  }

  filterPosts(posts) {
    this.authService.getUserId.pipe(take(1)).subscribe(userId => {
      this.usersService.getUser(userId).pipe(take(1)).subscribe(currentUser => {
        this.loadedPosts = posts.filter(post => {
          let followsUser;
          let followsEvent;

          currentUser.friendIds.forEach(person => {
            followsUser = person === post.userId;
          });

          this.loadedEvents.forEach(event => {
            if (event.id === post.eventId) {
              event.followerIds.forEach(follower => {
                followsEvent = follower === userId;
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

  getUser(id: string): User {
    if (this.loadedUsers) {
      return this.loadedUsers.find(user => user.id === id);
    }
  }

  getEvent(id: string): EventContent {
    if (this.loadedEvents) {
      return this.loadedEvents.find(event => event.id === id);
    }
  }

  onSearch() {
    this.modalController.create({ component: SearchComponent, componentProps: { toSearch: 'posts' } }).then(modalElement => {
      modalElement.present();
    });
  }

  onNewPost() {
    this.modalController.create({ component: NewPostComponent }).then(modalElement => {
      modalElement.present();
    });
  }

  onPostDetail(postId: string) {
    this.modalController.create({ component: PostDetailComponent, componentProps: { postId } }).then(modalElement => {
      modalElement.present();
    });
  }

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

  onPostLike(id: string) { }

  onPostComment(id: string) { }

  onPostShare(id: string) { }

}
