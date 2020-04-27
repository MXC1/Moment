import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { take, switchMap } from 'rxjs/operators';
import { EventsService } from 'src/app/shared/services/events.service';
import { User } from 'src/app/shared/models/user';
import { EventContent } from 'src/app/shared/models/event';
import { EventDetailComponent } from '../../events/event-detail/event-detail.component';
import { Router } from '@angular/router';
import { PostDetailComponent } from '../../feed/post-detail/post-detail.component';
import { PostsService } from 'src/app/shared/services/posts.service';
import { Post } from 'src/app/shared/models/post';

interface Notif {
  text: string;
  from: string;
  type: string;
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {

  loadedUsers: User[];
  loadedEvents: EventContent[];
  loadedPosts: Post[];

  notifications: Notif[] = [];

  constructor(private modalController: ModalController, private authService: AuthService, private usersService: UsersService, private eventsService: EventsService, private router: Router, private postsService: PostsService) { }

  ngOnInit() {
    this.usersService.fetchUsers().pipe(take(1)).subscribe(allUsers => {
      this.loadedUsers = allUsers;
      this.eventsService.fetchEvents().pipe(take(1)).subscribe(allEvents => {
        this.loadedEvents = allEvents;
        this.postsService.fetchPosts().pipe(take(1)).subscribe(allPosts => {
          this.loadedPosts = allPosts;
          this.authService.getUserId.pipe(take(1)).subscribe(userId => {
            this.usersService.getNotifications(userId).pipe(take(1)).subscribe(notifs => {
              
              this.notifications = notifs;
              console.log(this.notifications);
            });
          });
        });
      });
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }

  getFromImage(notification: Notif) { 
    if (notification.type === 'event') {
      return this.loadedEvents.find(event => event.id === notification.from).headerImage;
    } else if (notification.type === 'post') {
      return this.loadedPosts.find(post => post.id === notification.from).content;
    } else if (notification.type === 'user') {
      return this.loadedUsers.find(user => user.id === notification.from).image;
    }
  }

  getFromName(notification: Notif) {
    if (notification.type === 'event') {
      return this.loadedEvents.find(event => event.id === notification.from).name + " @ " + this.loadedEvents.find(event => event.id === notification.from).location;
    } else if (notification.type === 'post') {
      return this.loadedPosts.find(post => post.id === notification.from).caption;
    } else if (notification.type === 'user') {
      return this.loadedUsers.find(user => user.id === notification.from).username;
    }
  }

  async onClickNotif(notification: Notif) {
    if (notification.type === 'event') {
      const onEventDetailModal = await this.modalController.create({ component: EventDetailComponent, componentProps: { eventId: notification.from } });
      onEventDetailModal.present();
    } else if (notification.type === 'post') {
      const onPostDetailModal = await this.modalController.create({ component: PostDetailComponent, componentProps: { postId: notification.from } });
      onPostDetailModal.present();
    } else if (notification.type === 'user') {
      this.router.navigateByUrl('/tabs/people/' + notification.from);
      this.closeModal();
    }
  }
}