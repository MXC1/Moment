import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Post } from '../../../post';
import { PostsService } from '../../../posts.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController, ModalController } from '@ionic/angular';
import { EventsService } from '../../../events.service';
import { UsersService } from '../../../users.service';
import { EventContent } from '../../../event';
import { User } from '../../../user';
import { PostCommentService } from '../../../post-comment.service';
import { PostComment } from '../../../post-comment';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.scss'],
})
export class PostDetailComponent implements OnInit, OnDestroy {
  @Input() postId: string;
  post: Post;
  event: EventContent;
  user: User;
  comments: PostComment[];
  private postsSubscription: Subscription;
  private eventsSubscription: Subscription;
  private usersSubscription: Subscription;
  private commentsSubscription: Subscription;
  isLoading = true;

  constructor(private postsService: PostsService, private eventsService: EventsService, private usersService: UsersService, private commentsService: PostCommentService, private route: ActivatedRoute, private navController: NavController, private alertController: AlertController, private modalController: ModalController) { }

  ngOnInit() {
    this.isLoading = true;
    this.postsSubscription = this.postsService.getPost(this.postId).subscribe(post => {
      this.post = post;
      this.eventsSubscription = this.eventsService.getEvent(this.post.eventId).subscribe(event => {
        this.event = event;
        this.usersSubscription = this.usersService.getUser(this.post.userId).subscribe(user => {
          this.user = user;
          this.commentsSubscription = this.commentsService.getComments().subscribe(comments => {
            this.comments = comments.filter(comment => this.post.id === comment.postId);
            this.isLoading = false;
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
    if (this.commentsSubscription) {
      this.commentsSubscription.unsubscribe();
    }
  }

  closeModal() {
    this.modalController.dismiss();
  }

  onPostLike(id: string) { }

  onPostComment(id: string) { }

  onPostShare(id: string) { }

}
