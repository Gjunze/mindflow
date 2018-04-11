import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../_services';
@Injectable()
export class AuthGuard implements CanActivate {

    constructor(private router: Router, private user:UserService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if(this.user.userId()) {
            // logged in so return true
            return true;
        }

        // not logged in so redirect to login page with the return url
        this.router.navigate(['/login', { returnUrl: state.url}]);
        return false;
    }
}

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(private user:UserService){}
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        console.log('can active ', this.user.isAdmin());
        if(this.user.isAdmin()) 
            return true;
        else
            return true;
    }
}

@Injectable()
export class LandingGuard implements CanActivate {
  constructor(private router: Router, private user: UserService) {}
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if(!this.user.userId()) {
      return true;
    }
    this.router.navigateByUrl('/docs')
  }  
}