import { Component, OnInit, ViewChild, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ImageChooserComponent } from 'src/app/shared/image-chooser/image-chooser.component';
import { EventsService } from 'src/app/shared/services/events.service';
import { AuthService } from 'src/app/auth/auth.service';
import { NavController, ModalController, LoadingController, PopoverController, IonInput } from '@ionic/angular';
import { Router } from '@angular/router';
import { switchMap, take, tap } from 'rxjs/operators';
import { Place } from 'src/app/shared/models/place';
import { PlacesService } from 'src/app/shared/services/places.service';
import { IonicSelectableComponent } from 'ionic-selectable';
import { isUndefined } from 'util';

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

  @ViewChild(IonicSelectableComponent, { static: false }) placeSelector;
  @ViewChild(ImageChooserComponent, { static: false }) imageChooser;

  @ViewChild('mapsInput', { static: false }) mapsInput: IonInput;
  @ViewChild('native', { static: false }) native;

  place: Place;

  isLoading: boolean;

  constructor(private eventsService: EventsService, private authService: AuthService, private navController: NavController, private router: Router, private modalController: ModalController, private loadingController: LoadingController, private placesService: PlacesService, private popoverController: PopoverController) { }

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
      date: new FormControl(null, {
        validators: [Validators.required]
      }),
      private: new FormControl(false)
    });
  }

  async onIonFocus() {
    const input = await this.mapsInput.getInputElement();

    let autocomplete = new google.maps.places.Autocomplete(input, {
      types: ["establishment"],
      componentRestrictions: {
        country: ["UK"]
      }
    });

    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      this.place = new Place('',
        autocomplete.getPlace().name,
        autocomplete.getPlace().id,
        autocomplete.getPlace().photos[0].getUrl({}),
        autocomplete.getPlace().rating,
        autocomplete.getPlace().types[0],
        autocomplete.getPlace().vicinity);
    });
  }

  async onCreate() {
    const loadingElement = await this.loadingController.create({ message: 'Creating Event...' });

    loadingElement.present();

    const name = this.form.value.name;
    const type = this.form.value.type;
    const isPrivate = this.form.value.private;
    const date = this.form.value.date;

    this.form.patchValue({ image: this.imageChooser.croppedImage });

    if (!this.form.valid) {
      return;
    }

    this.eventsService.uploadImage(this.form.get('image').value).pipe(take(1)).subscribe(uploadRes => {
      return this.authService.getUserId.pipe(take(1)).subscribe(userId => {
        if (!userId) {
          throw new Error('No User ID Found!');
        } else {

          // Check if the place is already in our database
          this.placesService.getPlaceByGoogleId(this.place.googleId).subscribe(async existingPlaceRes => {

            if (isUndefined(existingPlaceRes)) {
              console.log(existingPlaceRes);

              // Add it if not
              this.placesService.addPlace(this.place.name, this.place.googleId, this.place.image, this.place.rating, this.place.type, this.place.vicinity).subscribe((newPlaceRes: Place) => {
                return this.eventsService.addEvent(name, newPlaceRes.name, type, uploadRes.imageUrl, userId, isPrivate, date).subscribe(newEvent => {
                  loadingElement.dismiss();
                  this.modalController.dismiss(newEvent);
                });
              });
            } else {
              return this.eventsService.addEvent(name, existingPlaceRes.id, type, uploadRes.imageUrl, userId, isPrivate, date).subscribe(newEvent => {
                loadingElement.dismiss();
                this.modalController.dismiss(newEvent);
              });
            }

          });
        }
      });
    });
  }

  onImageChosen(imageData: string) {
    this.isLoading = true;
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
    this.isLoading = false;
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
