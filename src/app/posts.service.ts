import { Injectable } from '@angular/core';
import { Post } from './post';
import { BehaviorSubject } from 'rxjs';
import { take, tap, map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth/auth.service';

interface PostData {
  caption: string;
  content: string;
  eventId: string;
  likes: number;
  shares: number;
  userId: string;
  type: 'image' | 'video';
  comments: { [key: string]: { [key: string]: string } };
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
                resData[key].type,
                resData[key].comments,
                resData[key].likes,
                resData[key].shares
              ));
            }
          }
          return posts.reverse();
        }), tap(posts => {
          this.posts.next(posts);
        })
        );
    }));
  }

  newPost(userId: string, eventId: string, caption: string, content: string, type: 'image' | 'video') {
    const newPost = new Post('', userId, eventId, caption, content, type, null, 0, 0);
    console.log(newPost);

    let postId: string;

    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.post<{ name: string }>(`https://mmnt-io.firebaseio.com/posts.json?auth=${token}`, { ...newPost, id: null })
        .pipe(take(1), switchMap(resData => {
          postId = resData.name;
          return this.posts;
        }), take(1),
          tap(posts => {
            newPost.id = postId;
            this.posts.next(posts.reverse().concat(newPost).reverse());
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
          const newPost = new Post(id, resData.userId, resData.eventId, resData.caption, resData.content, resData.type, resData.comments, resData.likes, resData.shares);
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

  deletePost(postId: string) {
    return this.authService.getToken.pipe(take(1)).subscribe(token => {
      return this.http.delete(`https://mmnt-io.firebaseio.com/posts/${postId}.json?auth=${token}`).pipe(take(1), switchMap(() => {
        return this.posts;
      }), take(1), tap(posts => {
        return this.posts.next(posts.filter(post => {
          return post.id !== postId;
        }));
      })).subscribe();
    });
  }

  addComment(postId: string, comment: { [userId: string]: string }) {
    const userId = Object.keys(comment)[0];
    const commentContent = Object.values(comment)[0];

    return this.authService.getToken.pipe(take(1)).subscribe(token => {
      return this.http.get<object[]>(`https://mmnt-io.firebaseio.com/posts/${postId}/comments.json?auth=${token}`).pipe(take(1)).subscribe((comments => {

        let key;
        if (comments !== null) {
          key = Object.keys(comments).length;
        } else {
          key = 0;
        }

        return this.http.patch(`https://mmnt-io.firebaseio.com/posts/${postId}/comments.json?auth=${token}`,
          {
            [key]:
              { [userId]: commentContent }
          }
        ).subscribe();
      }));
    });
  }

  constructor(private http: HttpClient, private authService: AuthService) { }
}
