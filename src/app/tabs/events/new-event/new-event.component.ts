import { Component, OnInit, ViewChild, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ImageChooserComponent } from 'src/app/image-chooser/image-chooser.component';
import { EventsService } from 'src/app/shared/services/events.service';
import { AuthService } from 'src/app/auth/auth.service';
import { NavController, ModalController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
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
  selector: 'app-new-event',
  templateUrl: './new-event.component.html',
  styleUrls: ['./new-event.component.scss'],
})
export class NewEventComponent implements OnInit {
  form: FormGroup;

  @ViewChild(ImageChooserComponent, { static: false }) imageChooser;

  constructor(private eventsService: EventsService, private authService: AuthService, private navController: NavController, private router: Router, private modalController: ModalController, private loadingController: LoadingController) { }

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl(null, {
        validators: [Validators.required, Validators.maxLength(255)]
      }),
      location: new FormControl(null, {}),
      type: new FormControl(null, {
        validators: [Validators.required]
      }),
      image: new FormControl(null, {
        validators: [Validators.required]
      }),
      private: new FormControl(true)
    });
  }

  async onCreate() {
    const loadingElement = await this.loadingController.create({ message: 'Creating Event...' });

    loadingElement.present();

    const name = this.form.value.name;
    const location = this.form.value.location;
    const type = this.form.value.type;
    const isPrivate = this.form.value.private;
    console.log(isPrivate);
    

    this.form.patchValue({ image: this.imageChooser.croppedImage });

    if (!this.form.valid) {
      return;

    }

    this.eventsService.uploadImage(this.form.get('image').value).pipe(switchMap(uploadRes => {
      return this.authService.getUserId.pipe(take(1), tap(userId => {
        if (!userId) {
          throw new Error('No User ID Found!');
        } else {
          return this.eventsService.addEvent(name, location, type, uploadRes.imageUrl, userId, isPrivate).subscribe(newEvent => {
            loadingElement.dismiss();
            this.modalController.dismiss(newEvent);
          });
        }
      }));
    })).subscribe();
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

  closeModal() {
    this.modalController.dismiss();
  }
}
