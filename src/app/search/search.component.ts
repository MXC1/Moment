import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { User } from '../user';
import { EventContent } from '../event';
import { Post } from '../post';
import { UsersService } from '../users.service';
import { PostsService } from '../posts.service';
import { EventsService } from '../events.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
  @Input() toSearch: 'people' | 'posts' | 'users';
  filteredUsers: User[];
  filteredPosts: Post[];
  filteredEvents: EventContent[];

  isLoading = false;

  constructor(private modalController: ModalController, private usersService: UsersService, private postsService: PostsService, private eventsService: EventsService) { }

  ngOnInit() { }

  closeModal() {
    this.modalController.dismiss();
  }

  filterList(event) {
    const searchValue = event.srcElement.value;
    this.isLoading = true;

    switch (this.toSearch) {
      case 'people': {
        this.filterUsers(searchValue);
        this.isLoading = false;

        break;
      }
      case 'posts': {
        this.filterPosts(searchValue);
        this.isLoading = false;

        break;
      }
      case 'users': {
        this.filterEvents(searchValue);
        this.isLoading = false;

        break;
      }
      default: {
        this.closeModal();
        break;
      }
    }
  }

  // console.log(event.srcElement.value);

  filterUsers(searchValue: string) {
    if (!this.filteredUsers) {
      this.usersService.fetchUsers().pipe(take(1)).subscribe(users => {
        this.filteredUsers = users.filter(user => {
          return (user.username.includes(searchValue) || user.fullName.includes(searchValue));
        });
      });
    } else {
      this.usersService.getUsers.pipe(take(1)).subscribe(users => {
        this.filteredUsers = users.filter(user => {
          return (user.username.includes(searchValue) || user.fullName.includes(searchValue) || user.username.includes(searchValue.toUpperCase()) || user.fullName.includes(searchValue.toUpperCase()) || user.username.includes(searchValue.toLowerCase()) || user.fullName.includes(searchValue.toLowerCase()));
        });
      });
    }
    console.log(this.filteredUsers);
  }

  filterEvents(searchValue: string) {

  }

  filterPosts(searchValue: string) {

  }
}
