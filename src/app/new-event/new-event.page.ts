import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth/auth.service';
import { EventsService } from '../events.service';
import { NavController } from '@ionic/angular';
import { switchMap, take, tap } from 'rxjs/operators';

const b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

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
      }),
      image: new FormControl(null)
    });
  }

  onCreate() {
    const name = this.form.value.name;
    const location = this.form.value.location;
    const type = this.form.value.type;
    const headerImage = this.form.get('image').value;

    if (!this.form.valid) {
      return;
    }

    this.eventsService.uploadImage(headerImage).pipe(switchMap(uploadRes => {
      return this.authService.getUserId.pipe(take(1), tap(userId => {
        if (!userId) {
          throw new Error('No User ID Found!');
        } else {
          return this.eventsService.addEvent(name, location, type, uploadRes.imageUrl, userId);
        }
      }));
    })).subscribe();

    this.navController.navigateBack('/tabs/events');
  }

  onImageChosen(imageData: string) {
    let imageFile;
    if (typeof imageData === 'string') {
      try {
        // imageFile = b64toBlob(imageData.replace('data:image/jpeg;base64,', ''), 'image/jpeg');
        imageFile = b64toBlob(imageData);
      } catch (error) {
        console.log(error);
        return;
      }
    } else {
      imageFile = imageData;
    }

    this.form.patchValue({ image: imageFile.target.files[0] });
  }

}
