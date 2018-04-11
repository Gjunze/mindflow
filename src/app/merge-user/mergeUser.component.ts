import { Component, OnInit, OnDestroy, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { ToastsManager } from 'ng2-toastr';
import { UserService } from '../_services';
@Component({
    selector:'app-merge-user',
    templateUrl: './mergeUser.component.html'
})
export class  MergeUserComponent implements OnInit, OnDestroy {
    email:string;
    password:string;
    constructor(private toastr:ToastsManager, vc:ViewContainerRef,
         private user:UserService, private router:Router) {
        this.toastr.setRootViewContainerRef(vc);
    }
    ngOnInit() {

    }
    ngOnDestroy() {

    }
    onSubmit(form) {
        //console.log("form", form.value, form.valid);
        if(!form.valid) {
            this.toastr.error("请检查邮箱和密码的格式");
        } else {
            this.user.mergeUser(form.value).subscribe(()=> {
                console.log('merge user succ');
                this.toastr.success("绑定用户成功");
                this.router.navigateByUrl('/docs');
            }, (err)=> {
                console.log('merge user error',err);
                this.toastr.error("绑定用户出错");
                return false;
            });
        }
        
    }
    onCancel() {

    }
    onNoCheck() {
    }
}
