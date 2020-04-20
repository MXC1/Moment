import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { User } from 'src/app/shared/models/user';
import { Post } from 'src/app/shared/models/post';
import { PostsService } from 'src/app/shared/services/posts.service';
import { filter, take, map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { NewPostComponent } from '../feed/new-post/new-post.component';
import { ModalController } from '@ionic/angular';
import { PostDetailComponent } from '../feed/post-detail/post-detail.component';
import { Subscription } from 'rxjs';
import { NotificationsComponent } from './notifications/notifications.component';

/**
 * Page for viewing both the users own profile and other users profiles
 *
 * @export
 * @class ProfilePage
 * @implements {OnInit}
 */
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  usersSubscription: Subscription;
  user: User;
  followerNumber: number;
  posts: Post[];
  isLoading = false;

  isThisUser: boolean;
  isFollowing: boolean;

  constructor(private authService: AuthService, private usersService: UsersService, private postsService: PostsService, private route: ActivatedRoute, private modalController: ModalController) { }

  /**
   * Check URL for a user ID and determine whether it is the users own profile or anothers
   *
   * @memberof ProfilePage
   */
  ngOnInit() {
    this.isLoading = true;

    let userId;

    this.route.paramMap.subscribe(paramMap => {
      this.authService.getUserId.pipe(take(1)).subscribe(id => {
        if (!paramMap.has('userId')) {

          if (!id) {
            throw new Error('No User ID Found!');
          } else {
            this.isThisUser = true;
            this.isFollowing = false;
            this.getUser(id);
          }
        } else {
          userId = paramMap.get('userId');
          if (userId === id) {
            this.isThisUser = true;
          } else {
            this.isThisUser = false;
          }

          this.authService.getUserId.pipe(take(1)).subscribe(thisUserId => {
            this.usersService.isFollowing(thisUserId, userId).pipe(take(1)).subscribe(isFollowing => {
              isFollowing.subscribe(resData => {
                this.isFollowing = resData;
                this.getUser(userId);
              });
            });
          });

        }
      });
    });
  }

  /**
   * Fetch the user, either from URL or using local user ID
   *
   * @param {string} userId
   * @memberof ProfilePage
   */
  getUser(userId: string) {
    this.usersSubscription = this.usersService.getUser(userId).subscribe(user => {
      this.user = user;
      this.postsService.fetchPosts().pipe(map(posts => posts.filter(
        post => post.userId === userId && (this.isThisUser ? true : post.isPrivate)))).subscribe(posts => {
          this.posts = posts;

          this.usersService.fetchUsers().pipe(take(1)).subscribe(allUsers => {
            this.followerNumber = allUsers.filter(eachUser => {
              return eachUser.friendIds.some(id => id === this.user.id);
            }).length;
          });

          this.isLoading = false;
        });
    });
  }

  /**
   * Send a follow request to the auth service
   *
   * @memberof ProfilePage
   */
  onFollow() {
    this.authService.getUserId.pipe(take(1)).subscribe(id => {
      this.usersService.follow(id, this.user.id).subscribe(() => {
        this.postsService.fetchPosts().subscribe();
        this.followerNumber++;
        this.isFollowing = true;
      });
    });
  }

  /**
   * Send an unfollow request to the auth service
   *
   * @memberof ProfilePage
   */
  onUnfollow() {
    this.authService.getUserId.pipe(take(1)).subscribe(id => {
      this.usersService.unfollow(id, this.user.id).subscribe(() => {
        this.postsService.fetchPosts().subscribe();
        this.isFollowing = false;
      });
    });
  }

  /**
   * Open the new post modal
   *
   * @memberof ProfilePage
   */
  onNewPost() {
    this.modalController.create({ component: NewPostComponent }).then(modalElement => {
      modalElement.present();
    });
  }

  /**
   * Open the post detail modal
   *
   * @param {string} postId
   * @memberof ProfilePage
   */
  onPostDetail(postId: string) {
    this.modalController.create({ component: PostDetailComponent, componentProps: { postId } }).then(modalElement => {
      modalElement.present();
    });
  }

  onClickNotifications() {
    this.modalController.create({ component: NotificationsComponent }).then(modalElement => {
      modalElement.present();
    });
  }

}
