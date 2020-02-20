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
  private posts = new BehaviorSubject<Post[]>([]);

  fetchPosts() {
    return this.http.get<{ [key: string]: PostData }>('https://mmnt-io.firebaseio.com/posts.json')
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

    const newPost = new Post('', userId, eventId, caption, content);
    let postId: string;

    return this.http.post<{ name: string }>('https://mmnt-io.firebaseio.com/posts.json', { ...newPost, id: null })
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
    return this.http.get<PostData>(`https://mmnt-io.firebaseio.com/posts/${id}.json`)
      .pipe(map(resData => {
        const newPost = new Post(id, resData.userId, resData.eventId, resData.caption, resData.content);
        return newPost;
      }));
  }

  uploadImage(image: File) {

    const uploadData = new FormData();

    uploadData.append('image', image);

    return this.http.post<{ imageUrl: string, imagePath: string }>('https://us-central1-mmnt-io.cloudfunctions.net/storeImage', uploadData);
  }

  constructor(private http: HttpClient) { }
}
