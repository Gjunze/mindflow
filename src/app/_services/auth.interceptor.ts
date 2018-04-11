import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent } from 
'@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
const apiroot = environment.apiroot || '';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}
  intercept(req: HttpRequest<any>, next: HttpHandler):Observable<HttpEvent<any>> {
    const authHeader = `Bearer ${this.auth.token}`
    
    const authReq = req.clone({
      setHeaders: {Authorization: authHeader},
      url: `${apiroot}${req.url}`
    });
    
    return next.handle(authReq);
  }
}