import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'tabs/feed', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthPageModule)
  },
  {
    path: 'tabs',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'post-detail',
    children: [
      {
        path: '',
        loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
      },
      {
        path: ':postId',
        loadChildren: () => import('./post-detail/post-detail.module').then(m => m.PostDetailPageModule)
      }
    ],
    canLoad: [AuthGuard]
  },
  {
    path: 'event-detail',
    children: [
      {
        path: '',
        loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
      },
      {
        path: ':eventId',
        loadChildren: () => import('./event-detail/event-detail.module').then(m => m.EventDetailPageModule)
      }
    ],
    canLoad: [AuthGuard]
  },
  {
    path: 'new-post',
    loadChildren: () => import('./new-post/new-post.module').then( m => m.NewPostPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'new-event',
    loadChildren: () => import('./new-event/new-event.module').then( m => m.NewEventPageModule),
    canLoad: [AuthGuard]
  },
  {
    path: 'event-detail',
    loadChildren: () => import('./event-detail/event-detail.module').then( m => m.EventDetailPageModule),
    canLoad: [AuthGuard]
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
