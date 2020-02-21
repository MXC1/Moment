import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

import { Plugins, Capacitor, CameraSource, Camera, CameraResultType } from '@capacitor/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-chooser.component.html',
  styleUrls: ['./image-chooser.component.scss'],
})
export class ImageChooserComponent implements OnInit {
  @Output() chosenImage = new EventEmitter<string | File>();
  selectedImage: string;
  type: 'image' | 'video';

  useChooser = false;
  @ViewChild('fileChooser', { static: false }) fileChooserRef: ElementRef<HTMLInputElement>;

  constructor(private platform: Platform) { }

  ngOnInit() {
    if (this.platform.is('mobile') && !this.platform.is('hybrid') || this.platform.is('desktop')) {
      this.useChooser = true;
    }
  }

  onChooseImage() {
    if (!Capacitor.isPluginAvailable('Camera') || this.useChooser) {
      this.fileChooserRef.nativeElement.click();
      return;
    }
    Plugins.Camera.getPhoto({
      quality: 100,
      source: CameraSource.Prompt,
      correctOrientation: true,
      height: 320,
      width: 200,
      resultType: CameraResultType.DataUrl
    }).then(image => {
      this.selectedImage = image.dataUrl;
      this.chosenImage.emit(image.dataUrl);
      this.type = this.selectedImage.includes('image') ? 'image' : 'video';

    }).catch(error => {
      console.log(error);
      return false;
    });
  }

  onFileChosen(event: Event) {
    const chosenFile = (event.target as HTMLInputElement).files[0];
    if (!chosenFile) {
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const dataUrl = fileReader.result.toString();
      this.selectedImage = dataUrl;
      this.chosenImage.emit(chosenFile);
      this.type = chosenFile.type.includes('image') ? 'image' : 'video';
    };
    fileReader.readAsDataURL(chosenFile);
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
