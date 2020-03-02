import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';

import { Plugins, Capacitor, CameraSource, Camera, CameraResultType } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';

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
  selector: 'app-image-chooser',
  templateUrl: './image-chooser.component.html',
  styleUrls: ['./image-chooser.component.scss'],
})
export class ImageChooserComponent implements OnInit {
  @Input() public message;
  // @Output() chosenImage = new EventEmitter<string | File>();
  selectedImage: string;
  type: 'image' | 'video';
  @Output() isLoading = false;

  useChooser = false;
  @ViewChild('fileChooser', { static: false }) fileChooserRef: ElementRef<HTMLInputElement>;

  @Output() croppedImage: File;
  imagePreview: string;
  finishedCropping: boolean = false;
  @ViewChild(ImageCropperComponent, { static: false }) imageCropper: ImageCropperComponent;

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
      // this.chosenImage.emit(image.dataUrl);
      this.type = this.selectedImage.includes('image') ? 'image' : 'video';
    }).catch(error => {
      console.log(error);
      return false;
    });
  }

  dataURLtoFile(dataurl, filename) {

    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], 'filename', { type: mime });
  }

  imageCropped(event: ImageCroppedEvent) {
    this.imagePreview = event.base64;
    this.croppedImage = this.dataURLtoFile(event.base64, event.base64);
    this.isLoading = false;
  }

  onFileChosen(event: Event) {
    this.isLoading = true;
    const chosenFile = (event.target as HTMLInputElement).files[0];

    if (!chosenFile) {
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = () => {
      const dataUrl = fileReader.result.toString();
      this.selectedImage = dataUrl;
      // this.chosenImage.emit(chosenFile);
      this.type = chosenFile.type.includes('image') ? 'image' : 'video';
    };
    fileReader.readAsDataURL(chosenFile);
  }

  onFinishCrop() {
    this.finishedCropping = true;
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
