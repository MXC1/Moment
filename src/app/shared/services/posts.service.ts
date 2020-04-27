import { Injectable } from '@angular/core';
import { Post } from '../models/post';
import { BehaviorSubject } from 'rxjs';
import { take, tap, map, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/auth.service';
import { UsersService } from './users.service';
import { EventsService } from './events.service';

interface PostData {
  caption: string;
  content: string;
  eventId: string;
  likers: string[];
  shares: number;
  userId: string;
  type: 'image' | 'video';
  comments: { [key: string]: { [key: string]: string } };
}

/**
 * Handle all post data
 *
 * @export
 * @class PostsService
 */
@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private posts = new BehaviorSubject<Post[]>([]);

  constructor(private http: HttpClient, private authService: AuthService, private usersService: UsersService) { }

  /**
   * Fetch all posts from the database and add them to a local BehaviourSubject
   *
   * @returns
   * @memberof PostsService
   */
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
                resData[key].likers,
                resData[key].shares
              ));
            }
          }
          return posts;
        }), tap(posts => {
          this.posts.next(posts);
        })
        );
    }));
  }

  /**
   * Create a new post with the supplied parameters and add it to the database
   *
   * @param {string} userId
   * @param {string} eventId
   * @param {string} caption
   * @param {string} content URl of post content
   * @param {('image' | 'video')} type Content type
   * @returns
   * @memberof PostsService
   */
  newPost(userId: string, eventId: string, caption: string, content: string, type: 'image' | 'video') {
    const newPost = new Post('', userId, eventId, caption, content, type, null, [], 0);
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

            const eventsService = new EventsService(this.http, this.authService);

            eventsService.getEvent(eventId).pipe(take(1)).subscribe(event => {
              event.followerIds.forEach(f => {
                this.usersService.generateNotification(f, 'There is a new post in an event you follow', eventId, 'event').subscribe();
              })
            });
          }));
    }));
  }

  /**
   * Only called if fetchPosts has been called at least once already
   *
   * @readonly
   * @memberof PostsService
   */
  get getPosts() {
    return this.posts.asObservable();
  }

  /**
   * Fetches a single post from the database
   *
   * @param {string} id
   * @returns
   * @memberof PostsService
   */
  getPost(id: string) {
    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.get<PostData>(`https://mmnt-io.firebaseio.com/posts/${id}.json?auth=${token}`)
        .pipe(map(resData => {
          if (resData !== null) {
            return new Post(id, resData.userId, resData.eventId, resData.caption, resData.content, resData.type, resData.comments, resData.likers, resData.shares);
          }
        }));
    }));
  }

  /**
   * Upload an image to Firebase storage
   *
   * @param {File} image
   * @returns
   * @memberof PostsService
   */
  uploadImage(image: File) {
    const uploadData = new FormData();

    uploadData.append('image', image);

    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.http.post<{ imageUrl: string, imagePath: string }>('https://us-central1-mmnt-io.cloudfunctions.net/storeImage', uploadData, { headers: { Authorization: 'Bearer ' + token } });
    }));
  }

  /**
   * Remove a post from the database 
   *
   * @param {string} postId
   * @returns
   * @memberof PostsService
   */
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

  /**
   * Add a comment to a post and save it in the database
   *
   * @param {string} postId Post to be commented on
   * @param {{ [userId: string]: string }} comment Comment object 
   * @returns
   * @memberof PostsService
   */
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
        ).subscribe(() => {
          this.getPost(postId).subscribe(post => {
            this.usersService.generateNotification(post.userId, 'Someone commented on your post', postId, 'post').subscribe();
          })
        });
      }));
    });
  }

  likePost(postId: string) {
    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.authService.getUserId.pipe(take(1), switchMap(userId => {

        return this.http.get<string[]>(`https://mmnt-io.firebaseio.com/posts/${postId}/likers.json?auth=${token}`).pipe(take(1), switchMap(likers => {

          let key;
          if (likers !== null) {
            key = likers.length;
          } else {
            key = 0;
          }


          return this.http.patch(`https://mmnt-io.firebaseio.com/posts/${postId}/likers.json?auth=${token}`, { [key]: userId }).pipe(take(1), map(() => {

            this.getPost(postId).pipe(take(1)).subscribe(post => {
              this.usersService.generateNotification(post.userId, 'Someone liked your post', postId, 'post').subscribe();
            });
          }));
        }));
      }));
    }));
  }

  unLikePost(postId: string) {
    return this.authService.getToken.pipe(take(1), switchMap(token => {
      return this.authService.getUserId.pipe(take(1), switchMap(userId => {
        return this.http.get<string[]>(`https://mmnt-io.firebaseio.com/posts/${postId}/likers.json?auth=${token}`).pipe(take(1), switchMap(likers => {
          const key = likers.findIndex(l => l === userId);
          return this.http.delete(`https://mmnt-io.firebaseio.com/posts/${postId}/likers/${key}.json?auth=${token}`);
        }))
      }));
    }));
  }
}
