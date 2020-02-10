import { Injectable } from '@angular/core';
import { Post } from './post';
import { BehaviorSubject } from 'rxjs';
import { take, tap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private posts = new BehaviorSubject<Post[]>([
    // tslint:disable-next-line: max-line-length
    new Post(
      'p1',
      'u1',
      'e1',
      'Check out this totally gnarly rave I went to',
      'https://www.ravejungle.com/wp-content/uploads/2017/12/rave-ravejungle-696x464-696x464.jpg',
      7,
      ['c1'],
      11
    ),
    new Post(
      'p2',
      'u1',
      'e1',
      'Check out this totally gnarly rave I went to',
      'https://www.eharmony.co.uk/relationship-advice/wp-content/uploads/2014/08/Red-gig.jpg',
      7,
      ['c1'],
      11
    ),
    new Post(
      'p3',
      'u1',
      'e1',
      'Check out this totally gnarly rave I went to',
      'https://res.cloudinary.com/www-virgin-com/virgin-com-prod/sites/virgin.com/files/Articles/Music/gig_0.jpg',
      7,
      ['c1'],
      11
    ),
    new Post(
      'p4',
      'u1',
      'e1',
      'Check out this totally gnarly rave I went to',
      'https://upload.wikimedia.org/wikipedia/commons/d/dd/Gig.jpg',
      7,
      ['c1'],
      11
    ),
    new Post(
      'p5',
      'u1',
      'e1',
      'Check out this totally gnarly rave I went to',
      'https://static.independent.co.uk/s3fs-public/thumbnails/image/2018/05/03/14/live-music-gigs.jpg',
      7,
      ['c1'],
      11
    ),
    new Post(
      'p2',
      'u2',
      'e2',
      'I was off my little tits at this one',
      'https://static.independent.co.uk/s3fs-public/thumbnails/image/2018/05/03/14/live-music-gigs.jpg?w968h681',
      14,
      ['c101', 'c209', 'c505', 'c100'],
      0
    ),
    new Post(
      'p3',
      'u3',
      'e3',
      'I\'m a slightly more mature person and I go to weddings instead of getting off my nut at raves',
      'https://cdn.fstoppers.com/styles/large-16-9/s3/lead/2019/11/9afbd16748b85ad4baee77b7c38f3237.jpg',
      0,
      [],
      0
    )
  ]);

  get getPosts() {
    return this.posts.asObservable();
  }

  getPost(id: string) {
    return this.posts.pipe(take(1), map(posts => {
      return {...posts.find(post => post.id === id)};
    }));
  }

constructor() { }
}
