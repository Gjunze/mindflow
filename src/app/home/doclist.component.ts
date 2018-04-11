import { Component, ViewChild, OnInit, OnDestroy, ViewContainerRef, EventEmitter} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Response} from "@angular/http";

import {DomSanitizer} from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/takeUntil';
import filter from 'lodash/filter'
import findIndex from 'lodash/findIndex'
import forEach from 'lodash/forEach'
import find from 'lodash/find'
import clone from 'lodash/clone'
import difference from 'lodash/difference'
import map from 'lodash/map'

import {  
  StoreService, 
  WxService, 
  UserService,
  Socket  
} from '../_services/index';
import {Observer} from 'rxjs/Observer';
import { HomeState, Config } from '../state';;
import { MatDialog } from '@angular/material/dialog';
import { InputModalComponent, AlertModalComponent } from '../modals';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TvModalComponent } from './tvmodal/tvmodal.component';


@Component({
  templateUrl: './doclist.component.html',
  styleUrls: ['./doclist.component.scss'
  ],
  host: {
    class: 'doclist-page'
  }
})
export class DocListComponent implements OnInit, OnDestroy{
  constructor(user:UserService,
    private router:Router,
    private route:ActivatedRoute,
    private state: HomeState,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private config: Config
  ){
    this.user = user;
  }
  @ViewChild(MatSort) sort: MatSort;
  user:UserService;
  sortBy = 'updatedAt';
  sortOrder = 'desc';
  get docs() {
    return this.state.docs;
  }
  get curDir() {
    return this.state.curDir;
  }
  get curDocs() {
    return this.state.curDocs;
  }

  updateCurDocs() {
    this.state.updateCurDocs();
  }

  subs:Subscription[] = [];
  //dataSource = new MatTableDataSource();
  displayedColumns = ['type', 'title', 'action', 'createdAt', 'updatedAt'];
  dataSource = new MatTableDataSource();
  ngOnInit() {
    this.route.queryParams.subscribe(params=>{
      this.state.setCurDir(params['curDir'])
    });
    this.state.fetchUserDocs();
    this.dataSource.sort = this.sort;
    this.state.docsEvent.subscribe((event)=> {
      if(event && event.eventType === 'newDoc') { //need fix
        let doc = event.eventTarget;
        this.router.navigate([doc.type, doc.id]);
        return;
      }
      this.dataSource.data = this.curDocs;  
    })
  }

  importFile($event, type, format) {
    let handleUpload = (f)=> {
      let reader = new FileReader();
      //reader.onload = ()=> reader.readAsText(f);
      reader.readAsText(f);
      reader.onloadend = ()=>this.user.importAs({data:reader.result, type, format, parent:this.curDir})
        .subscribe(()=>this.snackBar.open("上传成功", "", this.config.snackBarConfig), error=>this.snackBar.open("上传失败", "", this.config.snackBarConfig))
      reader.onerror = (err)=>console.log("loadf file error", err)
    }    
    let f = $event.srcElement.files[0];
    if(f) {
      handleUpload(f)
    }
  }
  onNewDoc(type:string) {
    //this.user.newDoc('test').subscribe();
    this.dialog.open(InputModalComponent, {data: {title: "输入文件名"}})
      .afterClosed()
      .subscribe(data => {
        if(data && data.input) {
          this.state.newDoc(data.input, type);
        }
      })
  }
  onNewFolder () {
    this.dialog.open(InputModalComponent, {data: {title: "输入文件夹名称"}})
    .afterClosed()
    .subscribe(data => {
      if(data && data.input) {
        this.state.newDoc(data.input, 'folder');
      }
    })
    
  }
  onLevelUp() {
     if(!this.curDir)
      return;
      let curDirDoc = find(this.docs, d=>d['id'] === this.curDir);
      if(!curDirDoc)
        return;
      this.router.navigate(['/docs'], {queryParams: {curDir:curDirDoc['parent']}});

  }
  onDelDoc(docId, title) {
    this.dialog.open(AlertModalComponent, {data: {title: `删除 ${title} ?`}})
      .afterClosed()
      .subscribe(reason=> {
        if(reason === 'confirm')
        this.state.deleteDoc(docId);
      })
  }
  
  onMoveDoc(docId) {
    this.dialog.open(TvModalComponent, {data: {docId}})
      .afterClosed()
      .subscribe(reason => {
      })

  }
  onLogout() {
    this.user.logout();

  }
  showFocus(event) {
    console.log("onFocus", event.node.id);
  }
  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
}
