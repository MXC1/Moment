import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/user';
import { AuthService } from 'src/app/auth/auth.service';
import { UsersService } from 'src/app/users.service';
import { take } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { SearchComponent } from 'src/app/search/search.component';

@Component({
  selector: 'app-people',
  templateUrl: './people.page.html',
  styleUrls: ['./people.page.scss'],
})
export class PeoplePage implements OnInit {
  isLoading = false;
  loadedPeople: User[];

  constructor(private authService: AuthService, private usersService: UsersService, private modalController: ModalController) { }

  ngOnInit() {
    this.isLoading = true;
    this.usersService.fetchUsers().pipe(take(1)).subscribe(users => {
      this.loadedPeople = users;
      this.isLoading = false;
    });
  }

  onSearch() {
    this.modalController.create({ component: SearchComponent, componentProps: { toSearch: 'people' } }).then(modalElement => {
      modalElement.present();
    });
  }

}
