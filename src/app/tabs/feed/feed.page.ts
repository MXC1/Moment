import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from 'src/app/post';
import { PostsService } from 'src/app/posts.service';
import { Subscription } from 'rxjs';
import { UsersService } from 'src/app/users.service';
import { User } from 'src/app/user';
import { EventsService } from 'src/app/events.service';
import { EventContent } from 'src/app/event';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
})
export class FeedPage implements OnInit, OnDestroy {

  constructor(private postsService: PostsService, private usersService: UsersService, private eventsService: EventsService) { }
  loadedPosts: Post[];
  loadedUsers: User[];
  loadedEvents: EventContent[];
  private postsSubscription: Subscription;
  private usersSubscription: Subscription;
  private eventsSubscription: Subscription;
  isLoading = false;

  currentUser: User;

  ngOnInit() {
    this.isLoading = true;
    this.postsSubscription = this.postsService.fetchPosts().subscribe(posts => {
      this.loadedPosts = posts;
      this.isLoading = false;
    });
    this.eventsSubscription = this.eventsService.fetchEvents().subscribe(events => {
      this.loadedEvents = events;
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
      this.loadedPosts = posts;
    });
  }

  getUser(id: string): User {
    let thisUser: User;
    this.usersService.getUser(id).subscribe(user => {
      thisUser = user;
    });
    return thisUser;
  }

  getEvent(id: string): EventContent {
    if (this.loadedEvents) {
      return this.loadedEvents.find(event => event.id === id);
    }
  }

  onPostLike(id: string) { }

  onPostComment(id: string) { }

  onPostShare(id: string) { }

}
