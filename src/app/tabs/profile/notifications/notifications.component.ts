import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {

  

  constructor(private modalController: ModalController) { }

  ngOnInit() { }

  closeModal() {
    this.modalController.dismiss();
  }
}
