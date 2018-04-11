import { Component, OnInit, OnDestroy, ViewChild,
   ElementRef, EventEmitter, ViewContainerRef, ComponentFactory, ComponentFactoryResolver,
   Input, Output, ViewChildren
} from '@angular/core';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/takeLast';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/mergeMap'

import { ActivatedRoute } from '@angular/router';

import {  StoreService, DownloadService, 
  UserService, Socket, TagService} from '../_services/index';
import * as qrcode from 'qrcode-generator';
import { Observer } from 'rxjs/Observer';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BusyService } from '../_services/busy.service';
import { UtilService } from '../_helpers/util';
//let Clipboard = require('clipboard');
import * as Clipboard from 'clipboard';
import { ToastsManager} from 'ng2-toastr';
import { PageState } from '../state';
import { concat } from 'rxjs/operator/concat';
import forEach from 'lodash/forEach';
import { environment } from '../../environments/environment'
import { MatDialog } from '@angular/material/dialog';
import { InputModalComponent, AlertModalComponent } from '../modals';
import { View } from 'backbone';
import { Title } from '@angular/platform-browser';
const apiroot = environment.apiroot || ''

@Component({
  selector: 'page',
  templateUrl: './page.component.html',
  styleUrls: [ './page.component.scss' ],
})
export class PageComponent implements OnInit, OnDestroy{
  @ViewChild('diagram', {read: ViewContainerRef}) diagramContainer: ViewContainerRef;
  @ViewChild('panel', {read: ViewContainerRef}) panelContainer: ViewContainerRef;
  @ViewChild('menu', {read: ViewContainerRef}) menuContainer: ViewContainerRef;

  constructor(private route: ActivatedRoute,
    private title: Title,
    private user: UserService,
    private storeService: StoreService,
    private resolver: ComponentFactoryResolver,
    private vc:ViewContainerRef,
    private state: PageState,
    private dialog: MatDialog,
  ) {}

  setContainerComps({diagram, panel, menu}) {
    this.diagramContainer.createComponent(diagram);
    this.menuContainer.createComponent(menu);
    this.panelContainer.createComponent(panel);
  }
  backParams;
  docUpdated(doc) {
    if(doc['parent']) {
      this.backParams = {curDir:doc['parent']}
    }
    this.title.setTitle(`MindFlow-${doc['title']}`);
  }
  subs = [];
  ngOnInit() {
    this.subs.push(this.state.docUpdated.subscribe( doc => this.docUpdated(doc)));
    this.subs.push(this.state.menuEvent.subscribe(event => this.handleMenuEvent(event)))
    this.route.params.map(p=>p['id'])
      .subscribe(docId => this.state.fetchDoc(docId));
  }
  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }
  handleMenuEvent(event) {

  }
  get showPanel() {
    return this.state.showPanel;
  }
  get doc() {
    return this.state.doc;
  }
  get store() {
    return this.state.store;
  }
  editTitle() {
    
    this.dialog.open(InputModalComponent, {data: {input: this.doc.title}})
      .afterClosed()
      .subscribe(value => {
        if(value && value.input) {
          this.state.updateDocTitle(this.doc.id, value.input);
        }
      })

  }
}