import { Component, EventEmitter, ViewChild, Input, Output, OnInit, 
  ChangeDetectionStrategy,
  ElementRef,
  ChangeDetectorRef,
  NgZone,
  OnDestroy,
  AfterViewChecked
 } from '@angular/core';
 import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';
import { MDComponent } from './mind-diagram.component';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import {select} from 'd3-selection'
import at from 'lodash/at'
import sortBy from 'lodash/sortBy'
import {hierarchy} from 'd3-hierarchy'
function rget(obj, keys) {
  for(let k of keys) {
    obj = obj[k];
    if(!obj) break;
  }
  return obj;
}
let did = d => d.id
const duration = 300
const barHeight = 25

function rfind(children, id) {
  if(!children) children = []
  let len = children.length
  for(let i = 0; i< len; i++) {
    let n = children[i]
    if(n.id === id) return n
    else {
      let n1 = rfind(n.children, id)
      if(n1) return n1
    }
  }
}

class ListNode {
  get expandable () {
    return this.children && this.children.length && this.hide
  }
  get foldable () {
    let v =  this.children && this.children.length && !this.hide
    return v
  }
  name
  id
  children
  hide = false
  constructor({name, id, children}) {
    this.name = name
    this.id = id
    this.children = children
  }
}
@Component({
  selector:'[mind-diagram-side]',
  templateUrl:'mind-diagram-side.component.html',
  styleUrls:['mind-diagram-side.component.scss'],
  animations: [
    trigger('children', [
      state('show', style({
        opacity: 1,
      })),
      state('hide', style({
        opacity:0,
        height:'0px'
      })),
      transition('show => hide', animate('300ms ease-out')),
      transition('hide => show', animate('300ms ease-in'))      
    ])
  ]
})
export class MDSideComponent implements OnInit, OnDestroy {
  @Input() diagramEvent:Observable<any>;
  @Input() storeChange:Observable<any>
  @Input() syncEvents:Observable<any>;
  @ViewChild('container') container:ElementRef
  constructor() {}
  diagram:MDComponent;
  subs = []
  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe())
  }
  ngOnInit() {
    const events = ['parent', 'reorder', 'edit', 'add']
    this.subs.push(
      this.diagramEvent.subscribe(({diagram, type}) => {
        switch(type) {
          case 'attach':
            this.diagram = diagram
        }
        
      }))
    this.subs.push(
      this.storeChange.subscribe(store => {
        this.setModel(store['data'])
      })
    )
    this.subs.push(
      this.syncEvents
        .filter(m => m.from === 'diagram')
        .subscribe(e => this.handleSync(e))
    )
  }
  root = {name: ''}
  children = []
  setModel(data) {
    if(!data) return;
    if(typeof(data) === 'string')
      data = JSON.parse(data);
    this.children = [this.convert(data)]
  }

  handleSync({source}) {
    let {type, node, parent} = source
    switch(type) {
      case 'edit':
        //console.log('children', this.children)
        let n = rfind(this.children, node.id)
        if(n)
          n.name = node.content.text
        break
      case 'reorder': {
        let p = rfind(this.children, parent.id)
        let rank = {}
        parent.children.forEach((c, i) => rank[c.id] = i)
        let children = sortBy(p.children, (o) => rank[o.id])
        p.children = children
        break
      }
      case 'add': {
        let children
        if(parent) {
          let p = rfind(this.children, parent.id)
          if(!p.children) p.children = []
          children = p.children
        } else {
          children = this.children
        }
        children.push(new ListNode({id: node.id, name: node.name, children: []}))
        break
      }
      case 'remove': {
        if(parent) {
          let p = rfind(this.children, parent.id)
          p.children = p.children.filter(c => c.id !== node.id)
        }
        break
      }
      case 'parent': {
        let p = rfind(this.children, parent.id)
        let op = rfind(this.children, source.oparent.id)
        let ni = op.children.findIndex(c => c.id === node.id)
        let n = op.children[ni]
        op.children.splice(ni, 1)
        if(!p.children) p.children = []
        p.children.push(n)
        break
      }
    }
  }
  toggleCollapse(node){
    node.hide = ! node.hide
    // if(node.children) {
    //   node._children = node.children
    //   node.children = null
    // } else if(node._children) {
    //   node.children = node._children
    //   node._children = null
    // }
  }
  childrenState(node) {
    if(node.hide) return 'hide'
    else return 'show'
  }
  
  convert (r) {
    function convertNode (p, ckeys) {
      let childrens = ckeys.map(k => p[k] || [])
      let children = Array.prototype.concat.apply([], childrens)
        .map(c => convertNode(c, ['left-children', 'right-children', 'children']))
      if (children.length === 0) children = null
      let [name, id] = at(p, ['content.text', 'id'])
      if(!name) name = '双击编辑'
      return new ListNode({
        name,
        id,
        children
      })
    }
    let left = convertNode(r, ['left-children'])
    let right = convertNode(r, ['right-children'])
    let [name] = at(r, ['content.text'])
    let children = Array.prototype.concat.apply([], [left, right].map(s => s.children || []))
    return {
      name,
      id: r.id,
      children
    }
  }

}
