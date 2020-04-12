import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/user';
import { AuthService } from 'src/app/auth/auth.service';
import { UsersService } from 'src/app/users.service';
import { take } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { SearchComponent } from 'src/app/search/search.component';

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
  loadedPeople: User[];

  constructor(private authService: AuthService, private usersService: UsersService, private modalController: ModalController) { }

  /**
   * Fetch all users and filter by those followed by current user
   *
   * @memberof PeoplePage
   */
  ngOnInit() {
    // this.isLoading = true;
    // this.usersService.fetchUsers().pipe(take(1)).subscribe(users => {
    //   this.authService.getUserId.pipe(take(1)).subscribe(userId => {
    //     this.usersService.getUser(userId).pipe(take(1)).subscribe(thisUser => {
    //       this.loadedPeople = users.filter(user => {
    //         for (const friend of thisUser.friendIds) {
    //           if (friend !== thisUser.id) {
    //             return friend === user.id;
    //           }
    //         }
    //       });
    //       this.isLoading = false;
    //     });
    //   });
    // });
  }

  /**
   * Fetch all users and filter by those followed by current user
   *
   * @memberof PeoplePage
   */
  ionViewWillEnter() {
    this.isLoading = true;
    this.usersService.fetchUsers().pipe(take(1)).subscribe(users => {
      this.authService.getUserId.pipe(take(1)).subscribe(thisUserId => {
        this.usersService.getUser(thisUserId).pipe(take(1)).subscribe(thisUser => {
          this.loadedPeople = users.filter(user => thisUser.friendIds.some(u => u === user.id && u !== thisUserId));
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
