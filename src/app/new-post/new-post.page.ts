import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PostsService } from '../posts.service';
import { AuthService } from '../auth/auth.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.page.html',
  styleUrls: ['./new-post.page.scss'],
})
export class NewPostPage implements OnInit {
  form: FormGroup;

  constructor(private postsService: PostsService, private authService: AuthService, private navController: NavController) { }

  ngOnInit() {
    this.form = new FormGroup({
      caption: new FormControl(null, {
        updateOn: 'blur',
        validators: [Validators.required, Validators.maxLength(255)]
      })
    });
  }

  onPost() {
    const caption = this.form.value.caption;

    if (!this.form.valid) {
      return;
    }

    this.postsService.newPost(this.authService.getUserId, '', caption, '').subscribe();
    this.navController.navigateBack('/tabs/feed');
  }

}
