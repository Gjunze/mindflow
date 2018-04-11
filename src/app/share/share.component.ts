import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { Title } from "@angular/platform-browser";
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { FTService , 
  StoreService,  DownloadService, 
  UserService, Socket} from '../_services/index';
import {Observer} from 'rxjs/Observer';
import {Subscriber} from 'rxjs/Subscriber';
import 'rxjs/add/operator/mergeMap'
import { ToastsManager } from 'ng2-toastr';
@Component({
  templateUrl: './share.component.html',
  styleUrls: [ './share.component.css' ]
})
export class ShareComponent implements OnInit, OnDestroy{
  paths:string[][];
  storeId:string = null;
  unsub:Function;
  doc:any = {};
  storeSubscriber:Subscriber<any>;
  loginInfo = {username:"", password:""};
  title:string;
  showTable:boolean;
  storeChange = new ReplaySubject();
  storeType:string;
  constructor (
    private ftService:FTService, 
    private storeService:StoreService,
    private downloadService:DownloadService,
    private route:ActivatedRoute,
    private user:UserService,
    private router:Router,
    private toastr:ToastsManager,
    private titleService:Title,
    private cd:ChangeDetectorRef
    ) {
    }

  onSaveShare() {
      this.router.navigate(['/save'], {queryParams:{storeId:this.storeId}});
  }
  runShareMode() {
    let share_url = location.toString();
    this.route.queryParams.map(d=>d['storeId'])
      .mergeMap(storeId=>this.storeService.fetch(storeId))
      .subscribe(this.storeSubscriber);
  }
  ngOnInit() {
    if(this.route.snapshot.data['action'] === 'save') {
      
      let storeId = this.route.snapshot.queryParams['storeId'];
      this.user.copyStore(storeId).subscribe(()=>{
        this.toastr.success('成功保存分享文件');
        this.router.navigateByUrl('/docs');
      }, error=>{
        console.log('copy store error', error);
      });
    }
    this.storeSubscriber = Subscriber.create(store=>{
      console.log('store subscriber', store);
      if(!store)
        return;
      if(store['table']) {
        this.paths = JSON.parse(store['table']);
      }
      if(this.paths && this.paths.length > 0)
        this.showTable = true;
      else
        this.showTable = false;
      this.title = store['title'];
      this.titleService.setTitle(`MindFlow 分享-${this.title}`);
      this.storeId = store['id'];
      let format = store['format'];
      if(format === 'mf-1.0') 
        this.storeType = 'mind';
      else
        this.storeType = 'flow';
      this.cd.detectChanges(); //need fix      
      this.storeChange.next(store);
    }, error=>{console.log('store sub error', error)});
    this.runShareMode();
  };
  ngOnDestroy() {
    if(this.unsub)
      this.unsub();
  }
  
  diagramInit() {
  }
}

