import { Injectable } from '@angular/core';
import { Post } from './post';
import { BehaviorSubject } from 'rxjs';
import { take, tap, map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth/auth.service';

interface PostData {
  caption: string;
  commentIds: string[];
  content: string;
  eventId: string;
  likes: number;
  shares: number;
  userId: string;
  type: 'image' | 'video';
}

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private posts = new BehaviorSubject<Post[]>([]);

  fetchPosts() {
    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.get<{ [key: string]: PostData }>(`https://mmnt-io.firebaseio.com/posts.json?auth=${token}`)
        .pipe(map(resData => {
          const posts = [];
          for (const key in resData) {
            if (resData.hasOwnProperty(key)) {
              posts.push(new Post(key,
                resData[key].userId,
                resData[key].eventId,
                resData[key].caption,
                resData[key].content,
                resData[key].type));
            }
          }
          return posts;
        }), tap(posts => {
          this.posts.next(posts);
        })
        );
    }));
  }

  newPost(userId: string, eventId: string, caption: string, content: string, type: 'image' | 'video') {
    const newPost = new Post('', userId, eventId, caption, content, type);
    let postId: string;

    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.post<{ name: string }>(`https://mmnt-io.firebaseio.com/posts.json?auth=${token}`, { ...newPost, id: null })
        .pipe(take(1), switchMap(resData => {
          postId = resData.name;
          return this.posts;
        }), take(1),
          tap(posts => {
            newPost.id = postId;
            this.posts.next(posts.concat(newPost));
          }));
    }));
  }

  get getPosts() {
    return this.posts.asObservable();
  }

  getPost(id: string) {
    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.get<PostData>(`https://mmnt-io.firebaseio.com/posts/${id}.json?auth=${token}`)
        .pipe(map(resData => {
          const newPost = new Post(id, resData.userId, resData.eventId, resData.caption, resData.content, resData.type);
          return newPost;
        }));
    }));
  }

  uploadImage(image: File) {

    const uploadData = new FormData();

    uploadData.append('image', image);

    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.post<{ imageUrl: string, imagePath: string }>('https://us-central1-mmnt-io.cloudfunctions.net/storeImage', uploadData, { headers: { Authorization: 'Bearer ' + token } });
    }));
  }

  constructor(private http: HttpClient, private authService: AuthService) { }
}
