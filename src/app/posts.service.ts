import { Injectable } from '@angular/core';
import { Post } from './post';
import { BehaviorSubject } from 'rxjs';
import { take, tap, map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface PostData {
  caption: string;
  commentIds: string[];
  content: string;
  eventId: string;
  likes: number;
  shares: number;
  userId: string;
}

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
      'https://www.ravejungle.com/wp-content/uploads/2017/12/rave-ravejungle-696x464-696x464.jpg'
    ),
    new Post(
      'p2',
      'u1',
      'e1',
      'Check out this totally gnarly rave I went to',
      'https://www.eharmony.co.uk/relationship-advice/wp-content/uploads/2014/08/Red-gig.jpg'
    ),
    new Post(
      'p3',
      'u1',
      'e1',
      'Check out this totally gnarly rave I went to',
      'https://res.cloudinary.com/www-virgin-com/virgin-com-prod/sites/virgin.com/files/Articles/Music/gig_0.jpg'
    ),
    new Post(
      'p4',
      'u1',
      'e1',
      'Check out this totally gnarly rave I went to',
      'https://upload.wikimedia.org/wikipedia/commons/d/dd/Gig.jpg'
    ),
    new Post(
      'p5',
      'u1',
      'e1',
      'Check out this totally gnarly rave I went to',
      'https://static.independent.co.uk/s3fs-public/thumbnails/image/2018/05/03/14/live-music-gigs.jpg'
    ),
    new Post(
      'p2',
      'u2',
      'e2',
      'I was off my little tits at this one',
      'https://static.independent.co.uk/s3fs-public/thumbnails/image/2018/05/03/14/live-music-gigs.jpg?w968h681'
    ),
    new Post(
      'p3',
      'u3',
      'e3',
      'I\'m a slightly more mature person and I go to weddings instead of getting off my nut at raves',
      'https://cdn.fstoppers.com/styles/large-16-9/s3/lead/2019/11/9afbd16748b85ad4baee77b7c38f3237.jpg'
    )
  ]);

  fetchPosts() {
    return this.http.get<{ [key: string]: PostData }>('https://moment48.firebaseio.com/posts.json')
      .pipe(map(resData => {
        const posts = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            posts.push(new Post(key,
              resData[key].userId,
              resData[key].eventId,
              resData[key].caption,
              resData[key].content));
          }
        }
        return posts;
      }), tap(posts => {
        this.posts.next(posts);
      })
      );
  }

  newPost(userId: string, eventId: string, caption: string, content: string) {
    const newPost = new Post('', userId, eventId, caption, 'https://www.visit-hampshire.co.uk/dbimgs/Wickham%20Festival%202019.jpg');
    let postId;

    return this.http.post<{ name: string }>('https://moment48.firebaseio.com/posts.json', { ...newPost, id: null })
      .pipe(take(1), switchMap(resData => {
        postId = resData.name;
        return this.posts;
      }), take(1),
        tap(posts => {
          newPost.id = userId;
          this.posts.next(posts.concat(newPost));
        }));

  }

  get getPosts() {
    return this.posts.asObservable();
  }

  getPost(id: string) {
    return this.posts.pipe(take(1), map(posts => {
      return { ...posts.find(post => post.id === id) };
    }));
  }

  constructor(private http: HttpClient) { }
}
