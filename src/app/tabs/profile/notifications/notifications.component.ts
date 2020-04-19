import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { take } from 'rxjs/operators';

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

  notifications: Notif[] = [];

  constructor(private modalController: ModalController, private authService: AuthService, private usersService: UsersService) { }

  ngOnInit() {
    this.authService.getUserId.pipe(take(1)).subscribe(userId => {
      this.usersService.getNotifications(userId).subscribe(notifs => {
        this.notifications = notifs;
      });
    });
   }

  closeModal() {
    this.modalController.dismiss();
  }
}
