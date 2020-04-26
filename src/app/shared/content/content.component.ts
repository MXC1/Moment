import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
})
export class ContentComponent implements OnInit {
  @Input() public content;
  @Input() public type;
  @Input() public playable;
  @Input() public square;

  constructor() { }

  ngOnInit() {}

  playPause(thisDiv) {
    if (this.playable !== 'false' && this.content.type === 'video') {
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

}
