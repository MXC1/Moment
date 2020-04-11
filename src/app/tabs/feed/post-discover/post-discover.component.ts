import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { EventContent } from 'src/app/event';
import { Subscription } from 'rxjs';
import { EventsService } from 'src/app/events.service';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import { UsersService } from 'src/app/users.service';
import { EventDetailComponent } from '../../events/event-detail/event-detail.component';
import { PostsService } from 'src/app/posts.service';
import { Post } from 'src/app/post';
import { User } from 'src/app/user';
import { PostDetailComponent } from '../post-detail/post-detail.component';

@Component({
  selector: 'app-post-discover',
  templateUrl: './post-discover.component.html',
  styleUrls: ['./post-discover.component.scss'],
})
export class PostDiscoverComponent implements OnInit {

  loadedEvents: EventContent[];
  displayedEvents: { event: EventContent, weight: number }[] = [];
  loadedPosts: Post[];
  displayedPosts: { post: Post, weight: number }[] = [];
  loadedUsers: User[];
  private eventsSubscription: Subscription;
  isLoading = false;

  constructor(private modalController: ModalController, private eventsService: EventsService, private authService: AuthService, private usersService: UsersService, private postsService: PostsService) { }

  ngOnInit() {
    this.isLoading = true;
    this.fetchAllUsers();
    this.fetchFollowedPosts();
  }

  fetchAllUsers() {
    this.usersService.fetchUsers().pipe(take(1)).subscribe(allUsers => {
      this.loadedUsers = allUsers;
    });
  }

  fetchFollowedPosts() {
    this.authService.getUserId.pipe(take(1)).subscribe(userId => {
      this.eventsService.fetchEvents().pipe(take(1)).subscribe(allEvents => {
        this.loadedEvents = allEvents;

        this.postsService.fetchPosts().pipe(take(1)).subscribe(allPosts => {
          allEvents.filter(eachEvent => {
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
                  this.displayedPosts = this.displayedPosts.concat({ post: tryPost[0], weight: 1 });
                } else {
                  this.displayedPosts.find(p => p.post.id === tryPost[0].id).weight = this.displayedPosts.find(p => p.post.id === tryPost[0].id).weight + 1;
                }
              }
            });
          });
          this.displayedPosts.sort((p1, p2) => {
            return p2.weight - p1.weight;
          });
          this.isLoading = false;
        });
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

  onPostDetail(postId: string) {
    this.modalController.create({ component: PostDetailComponent, componentProps: { postId } }).then(modalElement => {
      modalElement.present();
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
