import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { EventsService } from '../events.service';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-event.page.html',
  styleUrls: ['./new-event.page.scss'],
})
export class NewEventPage implements OnInit {
  form: FormGroup;

  constructor(private eventsService: EventsService, private authService: AuthService) { }

  ngOnInit() {
    this.form = new FormGroup({
      title: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(255)]
      }),
      type: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required]
      })
    });
  }

  onCreate() {
    const title = this.form.value.title;
    const userId = this.authService.getUserId;

    if (!this.form.valid) {
      return;
    }

    this.eventsService.addEvent(title, userId);
  }

}
