import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NavController, AlertController } from '@ionic/angular';
import { EventsService } from '../events.service';
import { UsersService } from '../users.service';
import { EventContent } from '../event';
import { User } from '../user';
import { PostCommentService } from '../post-comment.service';
import { PostComment } from '../post-comment';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.page.html',
  styleUrls: ['./post-detail.page.scss'],
})
export class PostDetailPage implements OnInit, OnDestroy {
  post: Post;
  event: EventContent;
  user: User;
  comments: PostComment[];
  private postsSubscription: Subscription;
  private eventsSubscription: Subscription;
  private usersSubscription: Subscription;
  private commentsSubscription: Subscription;
  isLoading = true;

  constructor(private postsService: PostsService, private eventsService: EventsService, private usersService: UsersService, private commentsService: PostCommentService, private route: ActivatedRoute, private navController: NavController, private alertController: AlertController) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('postId')) {
        this.navController.navigateBack('/tabs/feed');
        return;
      }
      const postId = paramMap.get('postId');

      this.isLoading = true;
      this.postsSubscription = this.postsService.getPost(postId).subscribe(post => {
        this.post = post;
        this.eventsSubscription = this.eventsService.getEvent(this.post.eventId).subscribe(event => {
          this.event = event;
        });
        this.usersSubscription = this.usersService.getUser(this.post.userId).subscribe(user => {
          this.user = user;
        });
        this.commentsSubscription = this.commentsService.getComments().subscribe(comments => {
          this.comments = comments.filter(comment => this.post.id === comment.postId);
        });
        this.isLoading = false;
      }, error => {
        this.alertController.create({header: 'An Error Occurred', message: 'Post could not be found. Please try again later.', buttons: [{text: 'Okay', handler: () => {
          this.navController.navigateBack('/tabs/feed');
        }}]}).then(alertElement => {
          alertElement.present();
        });
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

  onPostLike(id: string) { }

  onPostComment(id: string) { }

  onPostShare(id: string) { }

  ionViewWillEnter() { }

}
