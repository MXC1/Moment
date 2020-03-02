import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { UsersService } from 'src/app/users.service';
import { Subscription } from 'rxjs';
import { User } from 'src/app/user';
import { Post } from 'src/app/post';
import { PostsService } from 'src/app/posts.service';
import { filter, take, map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { NewPostComponent } from '../feed/new-post/new-post.component';
import { ModalController } from '@ionic/angular';

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

  isThisUser;
  isFollowing: boolean;

  constructor(private authService: AuthService, private usersService: UsersService, private postsService: PostsService, private route: ActivatedRoute, private modalController: ModalController) { }


  ngOnInit() {
    this.isLoading = true;

    let userId;

    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('userId')) {

        this.authService.getUserId.pipe(take(1)).subscribe(id => {
          if (!id) {
            throw new Error('No User ID Found!');
          } else {
            this.isThisUser = true;
            this.isFollowing = false;
            this.getUser(id);
          }
        });
      } else {
        userId = paramMap.get('userId');
        this.isThisUser = false;

        this.authService.getUserId.pipe(take(1)).subscribe(thisUserId => {
          this.usersService.isFollowing(thisUserId, userId).pipe(take(1)).subscribe(isFollowing => {
            this.isFollowing = isFollowing.length !== 1;
          });
        });

        this.getUser(userId);
      }
    });
  }

  getUserImage() {
    let thisImage: string;
    this.authService.getUserId.pipe(take(1)).subscribe(userId => {
      if (!userId) {
        throw new Error('No User ID Found!');
      } else {
        this.usersSubscription = this.usersService.getUser(userId).pipe(take(1)).subscribe(user => {
          thisImage = user.image;
        });
      }
    });
    return thisImage;
  }

  getUser(userId: string) {
    this.usersSubscription = this.usersService.getUser(userId).subscribe(user => {
      this.user = user;
      this.postsService.fetchPosts().pipe(map(posts => posts.filter(
        post => post.userId === userId))).subscribe(posts => {
          this.posts = posts;
          this.isLoading = false;
        });
    });
  }

  onFollow() {
    this.authService.getUserId.pipe(take(1)).subscribe(id => {
      this.usersService.follow(id, this.user.id).subscribe();
      this.isFollowing = true;
    });
  }

  onNewPost() {
    this.modalController.create({ component: NewPostComponent }).then(modalElement => {
      modalElement.present();
    });
  }

}
