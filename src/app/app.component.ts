import { Component , ViewContainerRef, OnInit,} from '@angular/core';
import { UserService } from  './_services';
import { ToastsManager } from 'ng2-toastr';
@Component({
    selector: 'app',
    templateUrl: 'app.component.html',
    styleUrls: ['.//app.component.css']
})

export class AppComponent implements OnInit { 
    version:String = "0.8";
    constructor(private user:UserService, private toastr:ToastsManager, private vcr:ViewContainerRef) {
        this.toastr.setRootViewContainerRef(vcr);
    }
    onLogout() {
    	this.user.logout();
    }
    ngOnInit() {
    }
}