import { Component, OnInit , OnDestroy, ViewChild,
   ElementRef, Input, Output, 
   EventEmitter,
  } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { Subscriber } from 'rxjs/Subscriber';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/buffer';
import find from 'lodash/find';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import difference from 'lodash/difference';
import property from 'lodash/property';
import { Graph } from 'graphlib';
import {select, selectAll, event} from 'd3-selection';
import {zoom, zoomIdentity} from 'd3-zoom';
import {transition as d3Transition} from 'd3-transition';
import {easeLinear} from 'd3-ease';
import {drag} from 'd3-drag';
import * as uuidv4 from 'uuid/v4';
import  dot from 'graphlib-dot';
import {graphviz} from 'd3-graphviz';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import {MAT_DIALOG_DATA, MatDialog ,MatDialogRef, DialogPosition, MatDialogConfig } from '@angular/material/dialog';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';

import { PageState } from '../../state';
import { DiagramState } from './diagram.state';
import { DiagramActionComponent } from '../diagram-action/diagram-action.component';
import { DiagramEditComponent } from '../diagram-edit/diagram-edit.component';
import { AlertModalComponent } from '../../modals';
const MAX_CHANGE_DELAY = 1000;
const DEFAULT_CELL_WIDTH = 80, DEFAULT_CELL_HEIGHT = 50;
const shapeMap = {
  'StartState': 'circle',
  'Decision': 'diamond',
  'Process': 'box',
  'EndState': 'circle'
}
const shapeColor = {
  'StartState': '#77CB00',
  'Decision': '#00A9CB',
  'Process': '#00A9CB',
  'EndState': '#DE3A00'  
}
function getShape(type) {
  return shapeMap[type];
}

function getColor(type) {
  return shapeColor[type];
}
function convertToSVG(x, y, svg) {
  let pt = svg.createSVGPoint(), svgP;
  pt.x = x;
  pt.y = y;
  svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
  return svgP;
}

@Component({
  selector:'app-diagram',
  templateUrl: './diagram.component.html',
  styleUrls: ['./diagram.component.scss'],
  host: {class: 'diagram'},
  animations: [
    trigger('fsAnimate', [
      transition('true => false', animate(100)),
      transition('false => true', animate(100))
    ]),
  ]
})

export class DiagramComponent implements OnInit, OnDestroy {

  isModified = false;
  changeEventSubscriber:Subscription;

  @Input() modifiedChange;
  @ViewChild('svg') svg:ElementRef;
  @ViewChild('group') svgGroup:ElementRef;
  @ViewChild('container') container:ElementRef;
  @ViewChild('toolbar') toolbar:ElementRef;

  @Input("diagramEvent") diagramEvent:Subject<any>;

  subs: Subscription[] = [];
  z;
  svgSize = null;
  graphviz;
  clickEvent = new EventEmitter<any>();
  nodeClickEvent = new EventEmitter<any>();
  nodeDblClickEvent = new EventEmitter();
  _edgeClickEvent = new EventEmitter<any>();
  edgeClickEvent = new EventEmitter();
  edgeDblClickEvent = new EventEmitter();

  connecting = false;
  constructor(private diaglog: MatDialog, 
    private pageState: PageState,
    private state: DiagramState
  ) {}
  ngOnInit() {
    this.initGraphviz();
    this.registerStoreHandler();    
    this.graphviz.on('renderEnd', ()=> {
      this.addEventHandler();
    });
    this.graphviz.on('transitionEnd', () => {
      this.addClickPath();  
    })
    
    this.disableZoomForDblclick();
    this.renderEvent.subscribe(()=>{
      this.removeClickPath();
      this.graphviz.renderDot(dot.write(this.state.graph));
    });
    
    this.registerClickEvent();
    this.registerClickEventHandler();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
  }

  registerClickEvent() {
    let sub = this.clickEvent
    .buffer(this.clickEvent.debounceTime(250))
    .subscribe(l => {
        if(l.length === 2) {
          this.nodeDblClickEvent.emit(l[0]);
        } else if(l.length ===1)  {
          this.nodeClickEvent.emit(l[0]);
        }
    });
    this.subs.push(sub);

    sub = this._edgeClickEvent
      .buffer(this._edgeClickEvent.debounceTime(250))
      .subscribe(l => {
        if(l.length === 2) {
          this.edgeDblClickEvent.emit(l[0]);
        } else if(l.length ===1)  {
          this.edgeClickEvent.emit(l[0]);
        } 
      });
    this.subs.push(sub);
  }

  registerClickEventHandler() {
    let sub = this.nodeDblClickEvent.subscribe(n => {
      if(!this.connecting) {
        this.handleEditNode(n);
      }
    })
    this.subs.push(sub);
    sub = this.nodeClickEvent.subscribe(n => {
      if(!this.connecting) {
        this.showNodeMenu(n);
      }
    });
    this.subs.push(sub);

    this.edgeDblClickEvent.subscribe(e => {
      if(!this.connecting) {
        this.handleEdgeEdit(e);
      }
    });
    this.subs.push(sub);

    this.edgeClickEvent.subscribe(e => {
      this.showEdgeMenu(e);
    })
  }
  registerStoreHandler() {
    this.subs.push(this.pageState.storeChanged.subscribe(({title, data, format})=>{
      if(!data) { //empty doc add start
        let graph = this.state.graph = new Graph({directed: true});
        let type = 'StartState';
        graph.setNode(uuidv4(), {class: type, shape: getShape(type), color: getColor(type), label: 'Start', style: 'filled'});
        return this.renderEvent.emit();
      }
      if(format === 'jointjs') 
        this.setModel(data);
      else if(format === 'dot')
        this.setDotData(data);
    }));
    
  }
  initGraphviz() {
    this.graphviz = graphviz(this.container.nativeElement, true);

    this.graphviz
      .transition(function () {
        return d3Transition("main")
            .ease(easeLinear)
            .delay(500)
            .duration(500);
    });    
  }
  disableZoomForDblclick() {
    this.graphviz.on('end', ()=> {
      select(this.graphviz._selection.node().querySelector("svg")).on('dblclick.zoom', null);
    })
  }

  setModel(data) {
    if(!data) return;
    let obj = JSON.parse(data);
    let graph = this.state.graph = new Graph({directed: true});
    let getLabel = property('attrs.text.text');
    let cells = obj['cells'];
    cells.forEach(cell => {
      let [p1, p2] = cell.type.split('.');
      if(p1 === 'flowtest') {
        handleNode(cell, p2);
      } else if(p1 === 'fsa') {
        handleLink(cell);
      }
    })
    this.renderEvent.emit();
    this.svgSize = null;
    function handleLink(l) {
      let {source, target, labels} = l;
      let label = '';
      if(labels && labels.length > 0) {
        label = getLabel(labels[0]);
      }
      graph.setEdge(source.id, target.id, {label})
    }
    function handleNode(n, type) {
      let shape = getShape(type);
      if(!shape)
      shape = 'box';
      //let label = n && n.attrs && n.attrs.text && n.attrs.text.text;
      let label = getLabel(n);
      graph.setNode(n.id, {label, class: type, shape, style:'filled', color: getColor(type)});
    }
  }
  setDotData(data) {
    if(!data) return;
    this.state.graph = dot.read(data);
    this.svgSize = null;
    this.renderEvent.emit();
  }
  
  showNodeMenu({$element, $node}) {
    console.log('show node menu', $node);
    let {top, left, width, height} = $element.getBoundingClientRect();
    let x = left + width / 2;
    let y = top+ height /2 ;
    let ref = this.diaglog.open(DiagramActionComponent, {panelClass: 'test-class'});
    ref.updatePosition({
      left:`${x-175}px`,
      top: `${y}px`
    }).updateSize("350px");
    
    ref.afterClosed().subscribe(reason=> {
      switch(reason) {
        case 'Process':
        case 'EndState':
        case 'Decision':
          this.handleNewNode({$element, $node, type: reason});
          break;
        case 'delete':
          this.handleDelete({$element, $node});
          break;
        case 'connect':
          this.handleConnect({$element, $node});
          break;
      }
    })
  }
  showEdgeMenu({$node, $element}) {
    //console.log('show edge menu', $node,  $element);
    let {top, left, width, height} = $element.getBoundingClientRect();   
    let x = left + width / 2;
    let y = top+ height /2 ;
 
    this.diaglog.open(DiagramActionComponent, {data: {simpleMode: true}, panelClass: 'test-class'})
    .updatePosition({
      left:`${x-60}px`,
      top: `${y}px`
    })
    .updateSize("120px")
    .afterClosed()
    .subscribe(reason => {
      if(reason === 'delete') {
        let [v, w] = $node.key.split('->');
        this.state.graph.removeEdge(v, w);
        this.renderEvent.emit();
      }
    });
  }

  addEventHandler() {
    let sel = select(this.container.nativeElement);
    let nodes = sel.selectAll('.node')
    .on('click', (d, i, elements)=> {
      event.stopPropagation();
      this.clickEvent.emit({$node:d, $element:elements[i]});
    })
    sel.selectAll('.edge text')
    .on('click', (d, i, elements) => {
      event.stopPropagation();
      this._edgeClickEvent.emit({$node:d.parent, $element: elements[i]})
    });
  }

  addClickPath() {
    let sel = select(this.container.nativeElement);
    sel.selectAll('.edge').each((d, i, elements) => {
      let parent = elements[i];
      let e = parent.querySelector('path');
      
      let newNode:HTMLElement = e.cloneNode(true);
      newNode.setAttribute('class', 'click-path');
      newNode.setAttribute('style', "0");
      parent.insertBefore(newNode, e);
      newNode.addEventListener('click', ($event) => {
        $event.stopPropagation();
        this._edgeClickEvent.emit({$node: d, $element: elements[i]});
      });
      
    })
  }
  removeClickPath () {
    let sel = select(this.container.nativeElement);
    sel.selectAll('.edge').each((d, i, elements) => {
      let parent = elements[i];
      let e = parent.querySelector('path.click-path');
      if(e)
      e.remove();
    })
  }
  _fullscreen = new BehaviorSubject(false);
  get fullscreen() {
    return this._fullscreen.getValue();
  }
  toggleFullscreen() {
    this._fullscreen.next(!this._fullscreen.getValue());
  }
  handleNewNode({$element, $node, type}) {
    let fields = [
      {controlType:'area', value: null, placeholder:'输入新节点内容',  required: true, key: 'state'},
      {controlType:'area', value: null, placeholder:'输入连线内容',  required: false, key: 'action'}
    ]
    let dialogRef = this.diaglog.open(DiagramEditComponent, {data: {fields}});
    dialogRef.afterClosed().subscribe(value=> {
      if(value) {
        addNode(value);
      }
    })
    let addNode = ({state, action}) => {
      let newId = uuidv4();
      let {graph} = this.state;
      graph.setNode(newId, {label:state, shape: getShape(type), color: getColor(type), class: type, style: 'filled'});
      graph.setEdge($node.key, newId, {label: action ? action: ""});
      this.renderEvent.emit();
    }    
  }
  handleDelete({$element, $node}) {
    let {graph} = this.state;
    graph.removeNode($node.key);
    this.renderEvent.emit();
  }

  handleEditNode({$element, $node}) {
    let {key} = $node;
    let {graph} = this.state;
    let n = graph.node(key);
    let fields = [
      {value: n.label, 'placehoder':'编辑节点内容', key:'state', controlType: 'area'}
    ];
    console.log('edit node', fields);
    let dialogRef = this.diaglog.open(DiagramEditComponent,{data: {fields}});
    dialogRef.afterClosed().subscribe(value=> {
      if(value) {
        let label = Object.assign({}, n, {label: value.state})
        graph.setNode(key, label);
        this.renderEvent.emit();  
      }
    })
  }
  handleEdgeEdit({$node, $element}) {
    let d = $node;
    let [v, w] = d.key.split('->');
    console.log("v", v, w);
    let edge = this.state.graph.edge(v, w);
    let fields = [
      {controlType: 'area', value: edge.label, placehoder: '请输入连线内容',key:'link'}
    ];
    let diagRef = this.diaglog.open(DiagramEditComponent, {data: {fields}})
      .afterClosed()
      .subscribe(value => {
        if(value && value.link) {
          this.state.graph.setEdge(v, w, {label: value.link});
          this.renderEvent.emit();
        }
      })
  }

  connectNodes(from, to) {
    let fields = [
      {controlType: 'text', value: null, placehoder: '输入连接标签', key: 'link'},
    ]
    this.diaglog.open(DiagramEditComponent, {data: {title: '连接', fields}})
    .afterClosed()
    .subscribe(value => {
      if(value && value.link) {
        this.connecting = false;
        this.state.graph.setEdge(from, to, {label: value.link});
        this.renderEvent.emit();
      }
    })
  }
  handleConnect({$element, $node}) {
    let {key} = $node;
    let {graph} =this.state;
    let succ = graph.successors(key);
    if(!succ) return;
    let connectable:string[] = difference(graph.nodes(), succ);
    
    if(connectable.length) {
      this.connecting = true;
      select(this.container.nativeElement)
      .selectAll('.node')
      .filter(({key}) => connectable.indexOf(key) !== -1)
      .classed('connectable', true)
      this.nodeClickEvent
        .take(1)
        .subscribe(({$node}) => {
          if(connectable.indexOf($node.key) !== -1) {
            this.connectNodes(key, $node.key)
          }
      })
      Observable.fromEvent(this.container.nativeElement, 'click')
        .take(1)
        .subscribe(()=> {
          select(this.container.nativeElement)
          .selectAll('.node')
          .filter(({key}) => connectable.indexOf(key) !== -1)          
          .classed('connectable', false)
          this.connecting = false;
        })
    }
  }
  renderEvent = new EventEmitter();
}
