import { Component, OnInit, OnDestroy } from '@angular/core';
import { EventContent } from '../event';
import { Subscription } from 'rxjs';
import { PostsService } from '../posts.service';
import { EventsService } from '../events.service';
import { UsersService } from '../users.service';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Post } from '../post';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.page.html',
  styleUrls: ['./event-detail.page.scss'],
})
export class EventDetailPage implements OnInit, OnDestroy {
  event: EventContent;
  eventPosts: Post[];
  private postsSubscription: Subscription;
  private eventsSubscription: Subscription;
  private usersSubscription: Subscription;
  isLoading = false;

  constructor(private postsService: PostsService, private eventsService: EventsService, private usersService: UsersService, private route: ActivatedRoute, private navCtrl: NavController) { }

  ngOnInit() {
    this.route.paramMap.subscribe(paramMap => {
      if (!paramMap.has('eventId')) {
        console.log('!paramMap.has(eventId)');
        this.navCtrl.navigateBack('/tabs/events');
        return;
      }
      this.isLoading = true;
      this.eventsSubscription = this.eventsService.getEvent(paramMap.get('eventId')).subscribe(event => {
        this.event = event;
        this.isLoading = false;
      });
      this.postsSubscription = this.postsService.getPosts.subscribe(posts => {
        posts.filter(post => post.eventId = this.event.id);
      });
    });
  }

  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
  }
}
