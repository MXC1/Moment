import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
})
export class FeedbackComponent implements OnInit {
  form: FormGroup;

  constructor(private authService: AuthService, private http: HttpClient, private modalController: ModalController) { }

  ngOnInit() {
    this.form = new FormGroup({
      feedback: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(255)]
      })
    });
  }

  onSubmit() {
    const feedback = this.form.get('feedback').value;
    let user;
    this.authService.getUserId.pipe(take(1)).subscribe(userId => {
      user = userId;
    });
    const feedbackObj = { feedback, user };

    this.authService.getToken.pipe(take(1)).subscribe(token => {
      this.http.post(`https://mmnt-io.firebaseio.com/feedback.json`, { ...feedbackObj }).subscribe(() => {
        this.closeModal();
      });
    });
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
