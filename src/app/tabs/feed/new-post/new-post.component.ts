import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostsService } from '../../../posts.service';
import { AuthService } from '../../../auth/auth.service';
import { NavController, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { switchMap, take, tap } from 'rxjs/operators';
import { ImageChooserComponent } from '../../../image-chooser/image-chooser.component';
import { EventContent } from '../../../event';
import { EventsService } from '../../../events.service';
import { NewEventComponent } from '../../events/new-event/new-event.component';
import { IonicSelectableComponent } from 'ionic-selectable';

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
  templateUrl: './new-post.component.html',
  styleUrls: ['./new-post.component.scss'],
})
export class NewPostComponent implements OnInit {
  form: FormGroup;
  eventsSubscription: Subscription;
  loadedEvents: EventContent[];
  loadedEventNames: string[] = [];

  @ViewChild(ImageChooserComponent, { static: false }) imageChooser;
  @ViewChild(IonicSelectableComponent, { static: false }) eventSelector;
  event: EventContent;

  constructor(private postsService: PostsService, private authService: AuthService, private eventsService: EventsService, private navController: NavController, private router: Router, private modalController: ModalController) { }

  ngOnInit() {
    this.form = new FormGroup({
      caption: new FormControl(null, {
        validators: [Validators.required, Validators.maxLength(255)]
      }),
      event: new FormControl(null, {
        validators: [Validators.required]
      }),
      image: new FormControl(null, {
        validators: [Validators.required]
      })
    });

    this.fetchEvents();
  }

  fetchEvents() {
    this.eventsSubscription = this.eventsService.fetchEvents().pipe(take(1)).subscribe(events => {
      this.loadedEvents = events;
      // console.log(events);
    });
  }

  onEventSelect(event) {
    this.form.patchValue({ event: event.value.id });
  }

  async onAddEvent(event) {
    const newEventModal = await this.modalController.create({ component: NewEventComponent, showBackdrop: true, id: 'eventModal' });
    newEventModal.onDidDismiss().then(newEvent => {
      this.event = newEvent.data;
      this.eventSelector.close();
      this.form.patchValue({ event: newEvent.data.id });
    });
    await newEventModal.present();
  }

  onPost() {
    const caption = this.form.value.caption;
    const eventId = this.form.value.event;

    this.form.patchValue({ image: this.imageChooser.croppedImage });

    if (!this.form.valid || !this.form.get('image').value) {
      return;
    }

    this.postsService.uploadImage(this.form.get('image').value).pipe(switchMap(uploadRes => {
      const type = this.form.get('image').value.type.includes('image') ? 'image' : 'video';

      return this.authService.getUserId.pipe(take(1), tap(userId => {
        if (!userId) {
          throw new Error('No User ID Found!');
        } else {
          return this.postsService.newPost(userId, eventId, caption, uploadRes.imageUrl, type).subscribe();
        }
      }));
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

  playPause(thisDiv) {
    const thisVideo = thisDiv.children[0];
    const thisButton = thisDiv.children[1];

    if (thisVideo.paused) {
      thisVideo.play();
      thisButton.style = 'display: none';
    } else {
      thisVideo.pause();
      thisButton.style = 'display: inline';
    }
  }
}
