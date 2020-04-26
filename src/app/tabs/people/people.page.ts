import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/shared/models/user';
import { AuthService } from 'src/app/auth/auth.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { take } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { SearchComponent } from 'src/app/shared/search/search.component';

/**
 * Shows list of followed users
 *
 * @export
 * @class PeoplePage
 * @implements {OnInit}
 */
@Component({
  selector: 'app-people',
  templateUrl: './people.page.html',
  styleUrls: ['./people.page.scss'],
})
export class PeoplePage implements OnInit {
  isLoading = false;
  loadedPeople: User[] = [];

  constructor(private authService: AuthService, private usersService: UsersService, private modalController: ModalController) { }

  ngOnInit() {
    this.isLoading = true;
    this.fetchFollowedUsers();
  }

  /**
   * Fetch all users and filter by those followed by current user
   *
   * @memberof PeoplePage
   */
  ionViewWillEnter() {
    this.fetchFollowedUsers();
  }

  fetchFollowedUsers() {
    this.usersService.fetchUsers().pipe(take(1)).subscribe(users => {
      this.authService.getUserId.pipe(take(1)).subscribe(thisUserId => {
        this.usersService.getUser(thisUserId).pipe(take(1)).subscribe(thisUser => {
          users.filter(user => thisUser.friendIds.some(u => u === user.id && u !== thisUserId)).forEach(u => {
            if (this.loadedPeople.some(user => user.id === u.id)) {
              this.loadedPeople = this.loadedPeople.reverse().concat(u).reverse();
            }
          });
          this.isLoading = false;
        });
      });
    });
  }

  /**
   * Open search modal
   *
   * @memberof PeoplePage
   */
  onSearch() {
    this.modalController.create({ component: SearchComponent, componentProps: { toSearch: 'people' } }).then(modalElement => {
      modalElement.present();
    });
  }

}
