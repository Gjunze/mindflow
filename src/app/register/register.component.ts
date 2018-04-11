import { Component, OnInit, ViewContainerRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { UserService, Socket } from "../_services";
import { User } from "../_models";
import { ToastsManager } from 'ng2-toastr';

@Component({
  selector: 'register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit{
  model: User = new User();
  loading = false;
  ngOnInit () {
    this.toastr.setRootViewContainerRef(this.vc);
    
  }
  constructor(private toastr: ToastsManager, 
    private router:Router, 
    private user: UserService,
    private vc:ViewContainerRef,
    private socket:Socket,
    private zone: NgZone
  ) {}
  register() {
    this.loading = true;
    this.user.create(this.model)
        .finally(()=> {
          this.loading = false;
        })
        .subscribe(
            data => {
                this.toastr.success('Registration successful');
                this.router.navigate(['/login'], {skipLocationChange:true});
            },
            error => {
                console.log('register error', error.error);
                this.toastr.error(error.error); //ligang
            });
}

}