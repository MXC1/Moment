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
  private postsSubscription: Subscription;
  private usersSubscription: Subscription;

  currentUser: User;

  ngOnInit() { }

  ngOnDestroy() {
    if (this.postsSubscription) {
      this.postsSubscription.unsubscribe();
    }
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
  }

  ionViewWillEnter() {
    this.postsSubscription = this.postsService.getPosts.subscribe(posts => {
      this.loadedPosts = posts;
    });
    // this.usersSubscription = this.usersService.getUsers.subscribe(users => {
    //   this.loadedUsers = users;
    // });
  }

  getUser(id: string): User {
    let thisUser: User;
    this.usersService.getUser(id).subscribe(user => {
      thisUser = user;
    });
    return thisUser;
  }

  getEvent(id: string): EventContent {
    let thisEvent: EventContent;
    this.eventsService.getEvent(id).subscribe(event => {
      thisEvent = event;
    });
    return thisEvent;
  }

  onPostLike(id: string) {}

  onPostComment(id: string) {}

  onPostShare(id: string) {}

}
