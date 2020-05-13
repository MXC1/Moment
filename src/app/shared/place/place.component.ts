import { Component, OnInit, Input } from '@angular/core';
import { PlacesService } from '../services/places.service';
import { take } from 'rxjs/operators';
import { Place } from '../models/place';
import { EventsService } from '../services/events.service';
import { EventContent } from '../models/event';
import { ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/auth/auth.service';
import { EventDetailComponent } from 'src/app/tabs/events/event-detail/event-detail.component';

@Component({
  selector: 'app-place',
  templateUrl: './place.component.html',
  styleUrls: ['./place.component.scss'],
})
export class PlaceComponent implements OnInit {

  @Input() placeId;
  place: Place;
  placeEvents: EventContent[] = [];
  isLoading: boolean;

  constructor(private placesService: PlacesService, private eventsService: EventsService, private modalController: ModalController, private authService: AuthService) { }

  ngOnInit() {
    this.fetchPlaceDetails();
  }

  fetchPlaceDetails() {
    this.isLoading = true;
    this.placesService.getPlace(this.placeId).pipe(take(1)).subscribe(place => {
      this.eventsService.fetchEvents().pipe(take(1)).subscribe(allEvents => {
        this.authService.getUserId.pipe(take(1)).subscribe(userId => {

          
          this.placeEvents = allEvents.filter(e => (!e.isPrivate || e.creatorId === userId) && e.location === place.id);
          place.type = this.formatType(place.type);
          this.place = place;
          this.isLoading = false;
        })
      })
    })
  }

  formatType(type: string) {
    let final = '';
    type.split('_').forEach(s => final += " " + this.capitaliseFirst(s));
    
    return final;
  }

  capitaliseFirst(string: string) {
    return string.charAt(0).toUpperCase() + string.substring(1);
  }

  closeModal() {
    this.modalController.dismiss();
  }

  async onEventDetail(eventId: string) {
    const onEventDetailModal = await this.modalController.create({ component: EventDetailComponent, componentProps: { eventId } });

    onEventDetailModal.present();
  }

}
