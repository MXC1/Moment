import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostsService } from '../posts.service';
import { AuthService } from '../auth/auth.service';
import { NavController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';

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
  templateUrl: './new-post.page.html',
  styleUrls: ['./new-post.page.scss'],
})
export class NewPostPage implements OnInit {
  form: FormGroup;
  eventsSubscription: Subscription;

  constructor(private postsService: PostsService, private authService: AuthService, private navController: NavController, private router: Router) { }

  ngOnInit() {
    this.form = new FormGroup({
      caption: new FormControl(null, {
        validators: [Validators.required, Validators.maxLength(255)]
      }),
      image: new FormControl(null)
    });
  }

  onPost() {
    console.log('onpost');
    console.log(this.form.get('image').value);

    const caption = this.form.value.caption;

    if (!this.form.valid || !this.form.get('image').value) {
      return;
    }

    this.postsService.uploadImage(this.form.get('image').value).pipe(switchMap(uploadRes => {
      const type = this.form.get('image').value.type.includes('image') ? 'image' : 'video';
      return this.postsService.newPost(this.authService.getUserId, '', caption, uploadRes.imageUrl, type);
    })).subscribe();

    this.router.navigateByUrl('/tabs/feed');
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

  playPause(thisVideo) {
    if (thisVideo.paused) {
      thisVideo.play();
    } else {
      thisVideo.pause();
    }
  }

  searchEvents() { }

}
