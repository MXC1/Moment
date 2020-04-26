import { Component, OnInit, Output, Input } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-filter-options',
  templateUrl: './filter-options.component.html',
  styleUrls: ['./filter-options.component.scss'],
})
export class FilterOptionsComponent implements OnInit {
  @Input() @Output() pastEvents: boolean;
  @Input() @Output() upcomingEvents: boolean;
  @Input() @Output() fromDate: string;
  @Input() @Output() toDate: string;
  @Input() @Output() privateEvents: boolean;
  @Input() @Output() publicEvents: boolean;

  constructor(private popoverController: PopoverController) { }

  ngOnInit() { }

  changePastEvents(event) {
    this.pastEvents = event.detail.checked;
  }

  changeUpcomingEvents(event) {
    this.upcomingEvents = event.detail.checked;
  }

  changeFromDate(event) {
    this.fromDate = event.detail.value;
  }

  changeToDate(event) {
    this.toDate = event.detail.value;
  }

  changePrivateEvents(event) {
    this.privateEvents = event.detail.checked;
  }

  changePublicEvents(event) {
    this.publicEvents = event.detail.checked;
  }

  dismissPopover() {
    this.popoverController.dismiss({
      pastEvents: this.pastEvents,
      upcomingEvents: this.upcomingEvents,
      fromDate: this.fromDate,
      toDate: this.toDate,
      privateEvents: this.privateEvents,
      publicEvents: this.publicEvents
    });
  }

  clearFilters() {
    this.pastEvents = true;
    this.upcomingEvents = true;
    this.fromDate = null;
    this.toDate = null;
  }
}
