import { Injectable } from '@angular/core';
import { User } from './user';
import { PostComment } from './post-comment';
import { BehaviorSubject } from 'rxjs';
import { take, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PostCommentService {
  private comments = new BehaviorSubject<PostComment[]>([
    new PostComment('c1', 'u2', 'p1', 'Lorem Ipsum is simply dummy text of the printing and typesetting industry'),
    new PostComment('c2', 'u1', 'p2', 'Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book'),
    new PostComment('c3', 'u2', 'p3', 'It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged'),
    new PostComment('c4', 'u3', 'p1', 'It was popularised in the 1960s'),
    new PostComment('c5', 'u3', 'p3', 'Lorem ipsum dolor sit amet'),
    new PostComment('c6', 'u3', 'p2', 'consectetur adipiscing elit'),
    new PostComment('c7', 'u2', 'p2', 'I\'m a random comment'),
    new PostComment('c8', 'u1', 'p3', 'Sick tats bro'),
    new PostComment('c9', 'u2', 'p1', 'Lets av it'),
  ]);

  getComments() {
    return this.comments.asObservable();
  }

  constructor() { }
}
