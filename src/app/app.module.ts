import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule} from '@angular/http';
import { AppComponent } from './app.component';
import { routing }        from './app.routing';
import { CarouselModule } from 'ngx-bootstrap/carousel'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { AuthGuard, AdminGuard, LandingGuard } from './_guards/index';
import { HttpClientModule } from '@angular/common/http';
import { UserService , FTService, StoreService, DownloadService, WxService, Socket,  TagService, AuthService,  AuthInterceptor} from './_services';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppStateModule } from './state';

import { ToastModule } from 'ng2-toastr';
import {ToastOptions} from 'ng2-toastr';
import { UtilService } from './_helpers/util';
import { MatIconModule } from '@angular/material/icon';
export class CustomOption extends ToastOptions {
  animate = 'flyRight'; // you can override any options available
  newestOnTop = false;
  showCloseButton = true;
  positionClass = 'toast-top-center';
}
@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    HttpModule,
    routing,
    BrowserAnimationsModule,
    ToastModule.forRoot(),
    CarouselModule.forRoot(),
    AppStateModule,
    HttpClientModule,
    MatIconModule,
    
  ],
  providers: [ 
      AuthGuard,
      AdminGuard,
      LandingGuard,
      UserService,
      FTService,
      StoreService,
      DownloadService,
      WxService,
      TagService,
      Socket,
      AuthService,
      UtilService,
      {provide: ToastOptions, useClass: CustomOption},
      {
        provide: HTTP_INTERCEPTORS,
        useClass: AuthInterceptor,
        multi: true
      }
    ],
  entryComponents: [
  ], 
  bootstrap: [AppComponent]
})
export class AppModule { }
