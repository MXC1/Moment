import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/shared/services/users.service';
import { switchMap } from 'rxjs/operators';
import { ModalController, LoadingController } from '@ionic/angular';
import { ImageChooserComponent } from 'src/app/shared/image-chooser/image-chooser.component';
import { FeedbackComponent } from 'src/app/shared/feedback/feedback.component';

/**
 * Converts a base64 string to a Blob object
 * https://www.npmjs.com/package/b64-to-blob
 *
 * @param {*} b64Data
 * @param {string} [contentType='']
 * @param {number} [sliceSize=512]
 * @returns
 */
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

/**
 * A form for entering personal info during the register process
 *
 * @export
 * @class PersonalInfoComponent
 * @implements {OnInit}
 */
@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss'],
})
export class PersonalInfoComponent implements OnInit {
  form: FormGroup;
  @Input() email: string;
  @Input() username: string;

  @ViewChild(ImageChooserComponent, { static: false }) imageChooser;

  constructor(private authService: AuthService, private router: Router, private usersService: UsersService, private modalController: ModalController, private loadingController: LoadingController) { }

  ngOnInit() {
    this.form = new FormGroup({
      fullName: new FormControl('', {
        validators: [Validators.maxLength(31)]
      }),
      image: new FormControl(null),
      bio: new FormControl('', {
        validators: [Validators.maxLength(127)]
      })
    });
  }

  /**
   * Called when a picture is chosen or taken
   * Converts image file to blob if necessary and patches it into the form
   *
   * @param {string} imageData
   * @returns
   * @memberof PersonalInfoComponent
   */
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

  /**
   * Called when the form is submitted or skipped
   *
   * @memberof PersonalInfoComponent
   */
  async onSubmit() {
    const loadingElement = await this.loadingController.create({ message: 'Creating Your Account...' });

    loadingElement.present();

    const fullName = this.form.value.fullName;
    const bio = this.form.value.bio;

    let image;

    if (this.imageChooser.croppedImage) {
      image = this.imageChooser.croppedImage;

      this.form.patchValue({ image });

      this.usersService.uploadImage(this.form.get('image').value).pipe(switchMap(uploadRes => {
        return this.usersService.addUser(this.username, this.email, uploadRes.imageUrl, fullName, bio);
      })).subscribe(() => {
        loadingElement.dismiss();
        this.modalController.dismiss();
        this.router.navigateByUrl('/tabs/feed');
      });
    } else {
      /**
       * Use a default letter from the assets folder for forms with no image 
       */

      let blob = null;
      const xhr = new XMLHttpRequest();
      xhr.open('GET', './assets/default_pictures/' + this.username.substr(0, 1).toUpperCase() + '.jpg');
      xhr.responseType = 'blob'; // force the HTTP response, response-type header to be blob
      xhr.onload = () => {
        blob = xhr.response; // xhr.response is now a blob object
        const file = new File([blob], 'logo.jpeg', { type: 'image/jpeg', lastModified: Date.now() });

        this.form.patchValue({ image });

        this.usersService.uploadImage(file).pipe(switchMap(uploadRes => {
          return this.usersService.addUser(this.username, this.email, uploadRes.imageUrl, fullName, bio);
        })).subscribe(() => {
          loadingElement.dismiss();
          this.modalController.dismiss();
          this.router.navigateByUrl('/tabs/feed');
        });
      };
      xhr.send();
    }

  }

  /**
   * Open the feedback modal
   *
   * @memberof PersonalInfoComponent
   */
  onFeedback() {
    this.modalController.create({ component: FeedbackComponent }).then(modalElement => {
      modalElement.present();
    });
  }
}

