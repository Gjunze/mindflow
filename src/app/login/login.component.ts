import { Component, OnInit, ViewContainerRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { UserService, Socket } from "../_services";
import { User } from "../_models";
import { ToastsManager } from 'ng2-toastr';

function randomString() {
  let b = new Uint8Array(3);
  crypto.getRandomValues(b);
  return b.join("");
}

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  model: User = new User();
  returnUrl:string;
  loading = false;
  wxState = randomString();  
  wxRedirectUrl = encodeURIComponent(`https://gw.mindflow.pro/goAuth?state=${this.wxState}`)
  wxQrUrl = `https://gw.mindflow.pro/qrcode?url=${this.wxRedirectUrl}`;
  ngOnInit () {
    console.log('login init')
    this.returnUrl = this.route.snapshot.params['returnUrl'] || '/docs';
    let subscriber = d=> {
      if(d['user']) {
        let u = JSON.parse(d['user']);
        let user = new User();
        user.id = u.id;
        user.username = u.username;
        user.docs = u.docs;
        user.role = u.role;
        user['token'] = u.token;
        this.user.saveUser(user);
        if(u['wxUid'] && !u['email'] && !u['noCheck']) {
          this.router.navigateByUrl('/mergeUser');
          return;
        } else {
          this.router.navigateByUrl('/docs');
        }
      }
    } ;
    
    this.route.queryParams.subscribe(subscriber);
    this.socket.post('/api/loginToken', {state:this.wxState}).subscribe(data=>console.log('post succ'), error=>console.log('post error', error));
    this.socket.on('logintoken', token=>this.zone.run(()=>subscriber(token.data)));
    this.toastr.setRootViewContainerRef(this.vc);
  }
  constructor(private toastr: ToastsManager, 
    private router:Router, 
    private user: UserService,
    private route: ActivatedRoute,
    private vc:ViewContainerRef,
    private socket:Socket,
    private zone: NgZone
  ) {}
  login() {
    this.loading = true;
    this.user.login(this.model.email, this.model.password)
      .finally(()=> {
        this.loading = false;
      })
      .subscribe(
          data => {
            console.log("login succ", this.returnUrl);
              this.toastr.success('登录成功');
              this.router.navigateByUrl(this.returnUrl);
          },
          error => {
              console.log("error", error);
              this.toastr.error(error.error);
          });
  }

}