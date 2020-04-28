import { Component, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';
import { Post } from '../../../shared/models/post';
import { PostsService } from '../../../shared/services/posts.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController, ModalController, IonSelect, IonInput } from '@ionic/angular';
import { EventsService } from '../../../shared/services/events.service';
import { UsersService } from '../../../shared/services/users.service';
import { EventContent } from '../../../shared/models/event';
import { User } from '../../../shared/models/user';
import { take } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';

interface Comment {
  userId: string;
  commentContent: string;
}

/**
 *  Shows a single post
 *
 * @export
 * @class PostDetailComponent
 * @implements {OnInit}
 * @implements {OnDestroy}
 */
@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
})
export class PostDetailComponent implements OnInit, OnDestroy {
  @Input() postId: string;
  @ViewChild('menu', { static: false }) menu: IonSelect;
  post: Post;
  event: EventContent;
  user: User;
  thisUser: User;
  comments: Comment[] = [];
  comment: string;
  commentUsers: User[];
  hasLiked: boolean;
  @ViewChild(IonInput, { static: false }) commentBox;
  private postsSubscription: Subscription;
  private eventsSubscription: Subscription;
  private usersSubscription: Subscription;
  isLoading = true;
  update: boolean;

  constructor(private postsService: PostsService, private eventsService: EventsService, private usersService: UsersService, private authService: AuthService, private route: ActivatedRoute, private navController: NavController, private alertController: AlertController, private modalController: ModalController) { }

  ngOnInit() {
    this.isLoading = true;
    this.postsSubscription = this.postsService.getPost(this.postId).subscribe(post => {
      this.post = post;

      if (this.post.comments) {
        for (const eachComment of Object.values(this.post.comments)) {
          this.comments = this.comments.concat({ userId: Object.keys(eachComment)[0], commentContent: Object.values(eachComment)[0] });
        }
      }

      this.eventsSubscription = this.eventsService.getEvent(this.post.eventId).subscribe(event => {
        this.event = event;
        this.usersSubscription = this.usersService.getUser(this.post.userId).subscribe(user => {
          this.user = user;
          this.authService.getUserId.pipe(take(1)).subscribe(userId => {

            if (post.likers) {
              this.hasLiked = post.likers.some(l => l === userId);
            }

            this.usersService.getUser(userId).pipe(take(1)).subscribe(thisUser => {
              this.thisUser = thisUser;
              this.usersService.fetchUsers().pipe(take(1)).subscribe(users => {
                this.commentUsers = users;
                this.isLoading = false;
              });
            });
          });
        });
      });
    }, error => {
      this.alertController.create({
        header: 'An Error Occurred', message: 'Post could not be found. Please try again later.', buttons: [{
          text: 'Okay', handler: () => {
            this.navController.navigateBack('/tabs/feed');
          }
        }]
      }).then(alertElement => {
        alertElement.present();
      });
    });

  }

  ngOnDestroy() {
    if (this.postsSubscription) {
      this.postsSubscription.unsubscribe();
    }
    if (this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
    if (this.usersSubscription) {
      this.usersSubscription.unsubscribe();
    }
  }

  closeModal() {
    this.modalController.dismiss({ update: this.update, postId: this.postId });
  }

  onShowMenu() {
    this.menu.open();
  }

  onDeletePost() {
    this.update = true;
    this.postsService.deletePost(this.post.id);
    this.closeModal();
  }

  isThisUsersPost() {
    return this.thisUser.id === this.post.userId;
  }

  onPostLike() {
    this.hasLiked = true;
    this.update = true;
    this.postsService.likePost(this.postId).subscribe(() => {
      this.updatePost();
    });
  }

  onPostUnLike() {
    this.hasLiked = false;
    this.update = true;
    this.postsService.unLikePost(this.postId).subscribe(() => {
      this.updatePost();
    });
  }

  updatePost() {
    this.authService.getUserId.pipe(take(1)).subscribe(userId => {
      this.postsService.getPost(this.postId).pipe(take(1)).subscribe(post => {
        this.usersService.fetchUsers().pipe(take(1)).subscribe(users => {
          this.eventsService.fetchEvents().pipe(take(1)).subscribe(events => {

            this.user = users.find(user => user.id === post.userId);
            this.event = events.find(event => event.id === post.eventId);

            if (post.likers) {
              this.hasLiked = post.likers.some(l => l === userId);
            } else {
              this.hasLiked = false;
            }

            this.post = post;
          })
        })
      })
    });
  }

  onPostComment() {
    this.commentBox.setFocus();
  }

  onAddComment() {
    const userId = this.thisUser.id;
    const comment = this.comment;

    this.postsService.addComment(this.post.id, { [userId]: comment });
    this.commentUsers = this.commentUsers.concat(this.thisUser);
    this.comments = this.comments.concat({ userId, commentContent: comment });
    this.commentBox.value = '';
    this.updatePost();
  }

  getUser(userId: string) {
    if (this.commentUsers) {
      return this.commentUsers.find(user => user.id === userId);
    }
  }
}
