import { Component, Input, OnInit, OnDestroy, AfterViewChecked, ChangeDetectorRef, ViewChild } from '@angular/core';
import { DownloadService, FTService } from "../../_services";
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import {isEqual, sortBy, forEach, chain} from 'lodash'
import 'rxjs/add/operator/mergeMap'
import { PageState } from '../../state';
import { DiagramState } from './../diagram/diagram.state';
import { Graph, json } from 'graphlib';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
@Component({
    selector:'[diagram-side]',
    templateUrl: './diagram-side.component.html',
    styleUrls: ['./diagram-side.component.scss'],
    host: {
      class:'right-panel',
      '[class.show]': 'showPanel'
    },
    
})
export class DiagramSideComponent implements OnInit, OnDestroy {
  constructor(private downloadService:DownloadService,
    private ftService:FTService,
    private pageState: PageState,
    private diagramState: DiagramState
  ) {}

  @Input("diagramEvent") diagramEvent:Subject<any>;
  paths:string[][];
  csvUrl:any = null;
  displayedColumns = ['path', 'step', 'pre', 'action', 'post'];
  subs = [];
  
  ngOnInit() {
    this.subs.push(this.pageState.menuEvent.subscribe(event => this.handleMenuEvent(event)));
  }
  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  handleMenuEvent({name}) {
    if(name === 'gen:table') {
      this.genTable(this.diagramState.graph);
    }
  }
  get showPanel ()  {
    return this.pageState.showPanel;
  }
  hidePanel() {
    this.pageState.showPanel = false;
  }
  groupPaths:any;
  groupPath(paths) {
      this.groupPaths = chain(paths).groupBy(p=>p[4]).map((v, k)=>[k, v]).sortBy(g=>g[0]).value();
  }
  sortPaths(paths:string[][][]) {
      //let sorted = chain(paths).sortBy('length').value();
      let sorted = sortBy(paths, 'length');
      let p1 = sorted[sorted.length - 1];
      return chain(sorted).map((p, i)=> {
      let n = 0;
      let w = 0.0;
      forEach(p, (_p)=> {
          if(isEqual(_p, p1[n])) 
          w += Math.pow(0.5, n);
          n += 1;
      });
      return {w, p};
      }).sortBy(w=> {
      return 1.0 / (1.0 + w.w);
      }).value();
  
  }
  updateTable(graph) {
    let paths = this.sortPaths(this.ftService.genPath(graph));
    let path_no = 0;
    let _paths = [];
    forEach(paths, (_p)=> {
      let p = _p.p;
      let step_no = 0;
        forEach(p, (p1) => {
          _paths.push([path_no, step_no, p1[0], p1[1], p1[2], ]);
          step_no += 1;
        })
      path_no += 1;
    });
    this.paths = _paths;
    this.groupPath(_paths);
  }
  dataSource = new MatTableDataSource();
  genTable(graph: Graph) {
      let data = json.write(graph);
      let _graph = this.ftService.buildFromGL(data);
      this.updateTable(_graph);
      this.dataSource = new MatTableDataSource(this.paths);
      this.pageState.showPanel = true;
      //console.log('showpanel');
      /*
      if(this.storeId)
          this.user.updateDoc(this.docId, JSON.stringify(this.paths)).subscribe(data=>{}, error=> {
          console.log("update store error", error);
          });
          */
  }
  onExportCSV(){
    /*
    if(this.paths) 
      return this.ftService.saveXLSData(['步骤', '路径', '前置', '动作', '期待结果'], this.paths);
    else 
      return Observable.throw('no path');
      */
    return Observable.if(()=>this.paths && this.paths.length > 0, 
      this.ftService.saveXLSData(['步骤', '路径', '前置', '动作', '期待结果'], this.paths),
      Observable.throw('NO_PATHS')
    ).do(data=>console.log("save data", data)).mergeMap(data=>this.downloadService.genFileLink(data, 'application/octet-stream', true, 'xlsx'));
  }  
}
  