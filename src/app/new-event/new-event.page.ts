import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { EventsService } from '../events.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-event.page.html',
  styleUrls: ['./new-event.page.scss'],
})
export class NewEventPage implements OnInit {
  form: FormGroup;

  constructor(private eventsService: EventsService, private authService: AuthService, private navController: NavController) { }

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null, {
        validators: [Validators.required, Validators.maxLength(255)]
      }),
      location: new FormControl(null, {}),
      type: new FormControl(null, {
        validators: [Validators.required]
      })
    });
  }

  onCreate() {
    const name = this.form.value.name;
    const location = this.form.value.location;
    const type = this.form.value.type;
    const userId = this.authService.getUserId;

    if (!this.form.valid) {
      return;
    }

    this.eventsService.addEvent(name, location, type, userId).subscribe();
    this.navController.navigateBack('/tabs/events');
  }

}
