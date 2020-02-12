import { Component, OnInit } from '@angular/core';
import { Post } from '../post';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
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
export class PostDetailPage implements OnInit {
  post: Post;
  event: EventContent;
  user: User;
  comments: PostComment[];
  private postsSubscription: Subscription;
  private eventsSubscription: Subscription;
  private usersSubscription: Subscription;
  private commentsSubscription: Subscription;
  isLoading = false;

  constructor(private postsService: PostsService, private eventsService: EventsService, private usersService: UsersService, private commentsService: PostCommentService, private route: ActivatedRoute, private navCtrl: NavController) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('postId')) {
        this.navCtrl.navigateBack('/tabs/feed');
        return;
      }
      this.isLoading = true;
      this.postsSubscription = this.postsService.getPost(paramMap.get('postId')).subscribe(post => {
        this.post = post;
      });
      this.eventsSubscription = this.eventsService.getEvent(this.post.eventId).subscribe(event => {
        this.event = event;
      });
      this.usersSubscription = this.usersService.getUser(this.post.userId).subscribe(user => {
        this.user = user;
      });
      this.commentsSubscription = this.commentsService.getComments().subscribe(comments => {
        this.comments = comments.filter(comment => this.post.id === comment.postId);
        this.isLoading = false;
      });
    });
  }

  onPostLike(id: string) {}

  onPostComment(id: string) {}

  onPostShare(id: string) {}

  ionViewWillEnter() {}

}
