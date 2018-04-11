import { UserService } from "./user.service";
import { TestBed, inject } from '@angular/core/testing';
import { Socket } from './socket.service';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router'
import { Observable } from "rxjs";
import { AuthInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

describe('user service test', () => {
  let service: UserService;
  let socket;
  let authService: AuthService;
  let router = {
    navigate(url) {

    }
  }
  let httpMock: HttpTestingController;
  socket = {
    on() {},
    post(url):Observable<any> {
      return Observable.from([{
        id: '1',
        token: 'user-token'
      }])
    },
    get(url):Observable<any> {
      return Observable.from([
        {}
      ])
    }
  }
  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [UserService,
        AuthService,
        {
          provide: Socket,
          useValue: socket
        },
        {
          provide: Router,
          useValue: router
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: AuthInterceptor,
          multi: true
        }
      ]
    })
  })

  beforeAll(inject([UserService, HttpTestingController, AuthService], 
    (userService: UserService,
      httpTestingController: HttpTestingController,
      _authService: AuthService
    ) => {
    service = userService;
    httpMock = httpTestingController;
    authService = _authService;
  }))

  it('userid should be null after logout', () => {
    service.logout()
    expect(service.userId()).toBeNull()
  })
    
  it('user should be 1 after login', (done: DoneFn) => {
    service.login('ligang@me.com', '111').subscribe(user => {
      expect(service.userId()).toBe('1')
      done()
    })
  })
  
  it('user new doc url should be ', (done) => {
    service.newDoc('test title', 'parent').subscribe(r => {
      expect(r).toBe('fake user')
      done()
    })
    let req = httpMock.expectOne('/api/user/1/docs');
    req.flush('fake user')
    expect(req.request.headers.get('Authorization')).toBe(authService.token)
    console.log('header is', req.request.headers.get('Authorization'))
  })
})