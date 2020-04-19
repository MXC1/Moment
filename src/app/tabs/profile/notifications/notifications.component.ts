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

interface Notif {
  text: string;
  from: string;
  type: 'user' | 'event';
}

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {

  loadedUsers: User[];
  loadedEvents: EventContent[];

  notifications: Notif[] = [];

  constructor(private modalController: ModalController, private authService: AuthService, private usersService: UsersService, private eventsService: EventsService, private router: Router) { }

  ngOnInit() {
    this.usersService.fetchUsers().pipe(take(1)).subscribe(allUsers => {
      this.loadedUsers = allUsers;
      this.eventsService.fetchEvents().pipe(take(1)).subscribe(allEvents => {
        this.loadedEvents = allEvents;
        this.authService.getUserId.pipe(take(1)).subscribe(userId => {
          this.usersService.getNotifications(userId).subscribe(notifs => {
            this.notifications = notifs;
          });
        });
      });
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }

  getFromImage(notification: Notif) {
    if(notification.type === 'event') {
      return this.loadedEvents.find(event => event.id === notification.from).headerImage;
    } else {
      return this.loadedUsers.find(user => user.id === notification.from).image;
    }
  }

  getFromName(notification: Notif) {
    if(notification.type === 'event') {
      return this.loadedEvents.find(event => event.id === notification.from).name;
    } else {
      return this.loadedUsers.find(user => user.id === notification.from).username;
    }
  }

  async onClickNotif(notification: Notif) {
    if(notification.type === 'event') {
      const onEventDetailModal = await this.modalController.create({ component: EventDetailComponent, componentProps: { eventId: notification.from } });
      onEventDetailModal.present();
    } else {
      this.router.navigateByUrl('/tabs/people/' + notification.from);
    }
  }
}
