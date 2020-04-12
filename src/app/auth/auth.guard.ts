import { Injectable } from '@angular/core';
import { CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { take, tap, switchMap } from 'rxjs/operators';

/**
 * Check a user is logged in before they can visit certain routes
 *
 * @export
 * @class AuthGuard
 * @implements {CanLoad}
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {
  constructor(private authService: AuthService, private router: Router) { }

  /**
   * Check the user's authentication status using the AuthService
   * Navigate to login page if not
   *
   * @param {Route} route
   * @param {UrlSegment[]} segments
   * @returns {(Observable<boolean> | Promise<boolean> | boolean)} Authentication status
   * @memberof AuthGuard
   */
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.isAuthenticated.pipe(take(1), switchMap(isAuthenticated => {
      if (!isAuthenticated) {
        return this.authService.autoLogin();
      } else {
        return of(isAuthenticated);
      }
    }), tap(isAuthenticated => {
      if (!isAuthenticated) {
        this.router.navigateByUrl('/auth/login');
      }
    }));
  }
}
