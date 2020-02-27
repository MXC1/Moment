import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { UsersService } from 'src/app/users.service';
import { switchMap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { ImageChooserComponent } from 'src/app/image-chooser/image-chooser.component';

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
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss'],
})
export class PersonalInfoComponent implements OnInit {
  form: FormGroup;
  @Input() email;
  @Input() username;

  @ViewChild(ImageChooserComponent, { static: false }) imageChooser;

  constructor(private authService: AuthService, private router: Router, private usersService: UsersService, private modalController: ModalController) { }

  ngOnInit() {
    this.form = new FormGroup({
      fullName: new FormControl(null, {
        validators: [Validators.maxLength(31)]
      }),
      image: new FormControl(null),
      bio: new FormControl(null, {
        validators: [Validators.maxLength(127)]
      })
    });
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

  onSubmit() {
    const fullName = this.form.value.fullName;
    const bio = this.form.value.bio;

    this.form.patchValue({ image: this.imageChooser.croppedImage });

    this.usersService.uploadImage(this.form.get('image').value).pipe(switchMap(uploadRes => {
      return this.usersService.addUser(this.username, this.email, uploadRes.imageUrl, fullName, bio);
    })).subscribe(() => {
      this.modalController.dismiss()
      this.router.navigateByUrl('/tabs/feed');
    });

    // this.usersService.addUser(this.email, fullName, this.username, bio);
  }

}

