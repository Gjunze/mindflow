import { Component, OnInit, ViewContainerRef, ChangeDetectorRef, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { UserService, Socket } from "../_services";
import { User } from "../_models";
import { ToastsManager } from 'ng2-toastr';
import * as $ from 'jquery';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  
  constructor(  ) { }

  ngOnInit() {
    // this.socket.on(`wx:${this.wxState}`, this.router.navigateByUrl(this.returnUrl))
  }
}
