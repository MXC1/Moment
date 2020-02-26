import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { UsersService } from 'src/app/users.service';
import { Subscription } from 'rxjs';
import { User } from 'src/app/user';
import { Post } from 'src/app/post';
import { PostsService } from 'src/app/posts.service';
import { filter, take, map } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  private usersSubscription: Subscription;
  private postsSubscription: Subscription;
  user: User;
  posts: Post[];
  isLoading = false;

  constructor(private authService: AuthService, private usersService: UsersService, private postsService: PostsService) { }

  getUserImage() {
    let thisImage: string;
    this.authService.getUserId.pipe(take(1)).subscribe(userId => {
      if (!userId) {
        throw new Error('No User ID Found!');
      } else {
        this.usersSubscription = this.usersService.getUser(userId).subscribe(user => {
          thisImage = user.image;
        });
      }
    });
    return thisImage;
  }

  ngOnInit() {
    this.isLoading = true;
    this.authService.getUserId.pipe(take(1)).subscribe(userId => {
      if (!userId) {
        throw new Error('No User ID Found!');
      } else {
        this.usersSubscription = this.usersService.getUser(userId).subscribe(user => {
          this.user = user;

          this.postsService.fetchPosts().pipe(map(posts => posts.filter(
            post => post.userId === userId))).subscribe(posts => {
              this.posts = posts;
              this.isLoading = false;
            });
        });
      }
    });
  }

  postDetail(post: Post) { }

}
