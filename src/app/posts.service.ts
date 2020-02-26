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
  type: 'image' | 'video';
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
              resData[key].content,
              resData[key].type));
          }
        }
        return posts;
      }), tap(posts => {
        this.posts.next(posts);
      })
      );
  }

  newPost(userId: string, eventId: string, caption: string, content: string, type: 'image' | 'video') {
    const newPost = new Post('', '', eventId, caption, content, type);
    // const newPost = new Post('', userId, eventId, caption, content, type);
    let postId: string;

    console.log(newPost);

    return this.http.post<{ name: string }>('https://mmnt-io.firebaseio.com/posts.json', { ...newPost, id: null })
      .pipe(take(1), switchMap(resData => {
        console.log('connection to database successful');

        postId = resData.name;
        return this.posts;
      }), take(1),
        tap(posts => {
          console.log('newPostSuccessful');

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
        const newPost = new Post(id, resData.userId, resData.eventId, resData.caption, resData.content, resData.type);
        return newPost;
      }));
  }

  uploadImage(image: File) {

    const uploadData = new FormData();

    uploadData.append('image', image);

    return this.http.post<{ imageUrl: string, imagePath: string }>('https://us-central1-mmnt-io.cloudfunctions.net/storeImage', uploadData);
  }

  // public generateThumbnail(videoFile: Blob) {
  //   let video: HTMLVideoElement;
  //   let canvas: HTMLCanvasElement;
  //   let context: CanvasRenderingContext2D;
  //   new Promise<string>((resolve, reject) => {
  //     canvas.addEventListener('error',  reject);
  //     video.addEventListener('error',  reject);
  //     video.addEventListener('canplay', event => {
  //       canvas.width = video.videoWidth;
  //       canvas.height = video.videoHeight;
  //       context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  //       resolve(canvas.toDataURL());
  //     });
  //     if (videoFile.type) {
  //       video.setAttribute('type', videoFile.type);
  //     }
  //     video.preload = 'auto';
  //     video.src = window.URL.createObjectURL(videoFile);
  //     video.load();
  //   }).then(thumbnailData => {
  //     return thumbnailData;
  //   });
  // }

  constructor(private http: HttpClient) { }
}
