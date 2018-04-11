import { Component, ViewChild, ElementRef, OnInit, OnDestroy,
   ViewContainerRef, ComponentFactoryResolver,
   EventEmitter, 
   ReflectiveInjector, TemplateRef,
   HostListener,
   Input, Output,
   ChangeDetectionStrategy,
   ChangeDetectorRef,
   ViewChildren,
   QueryList,
   Injectable,
   NgZone,
   OnChanges,
   AfterViewChecked
} from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition
} from '@angular/animations';

import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import 'rxjs/add/operator/pairwise';
import at from 'lodash/at'
import forEach from 'lodash/forEach'

import { PageComponent } from '../page';
import { MAX_DIAGRAM_HEIGHT, MAX_DIAGRAM_WIDTH } from './consts';
const defaultText = ''

import { DragHandler } from '../_helpers/drag-handler';
import { ZoomHandler } from '../_helpers/zoom-handler';
import { createDiagram, loadData, toggleCollapse , 
  appendChild, setContent, centerRoot, removeChild,
  appendChildToNodeId, deleteNodeId, appendSiblingToNodeId
} from './mind-tree';
import { Editable } from './editable.component';
const MAX_CHANGE_DELAY = 1000;


const modifyTypes = ['parent', 'reorder', 'edit', 'add', 'remove']

const tbAnimate1 = [
        style({width: '0', opacity: 0}),
        animate(200, style({width: '*', opacity: 1}))
      ]
const tbAnimate2 = [
  style({transform: 'translateY(-20px)'}),
  animate(200, style({transform:'translateY(0)'}))
]
const flipOut = [
  style({transform: 'rotateY(0deg)', opacity: 1}),
  animate(200, style({transform: 'rotateY(180deg)', opacity: 0}))
]
@Component({
  selector: 'app-mind-diagram',
  templateUrl: './mind-diagram.component.html',
  styleUrls: ['./mind-diagram.component.scss'],
  animations: [
    trigger('fsAnimate', [
      transition('true => false', animate(100)),
      transition('false => true', animate(100))
    ]),
    trigger('tbAnimate', [
      transition('false => true', tbAnimate2)
    ]),
    trigger('helpAnimate', [
      state('false', style({display: 'none'})),
      transition('true => false', flipOut),
    ])
  ]
})
export class MDComponent implements OnInit, OnDestroy {
  @ViewChild('wrapper')  wrapper:ElementRef;
  @ViewChild('menu') contextMenu:ElementRef;
  @ViewChild('toolbar') toolbar:ElementRef;
  @ViewChild(Editable) editable:Editable;
  element:ElementRef;
  constructor(private resolver:ComponentFactoryResolver,
    private vcContainer:ViewContainerRef,
    private cd:ChangeDetectorRef,
    element:ElementRef,
    private zone:NgZone
  ) {
    this.element = element;
  }

  @Input() storeChange:Observable<any>;
  @Input() modifiedChange;
  @Output() onInit = new EventEmitter();
  @Output() onDestroy = new EventEmitter();
  inPreview = false;
  enableScroll = true;
  diagram:any;
  hover:any;
  hoverElement:any;
  editTextStyle = {
    top: '0',
    left: '0'
  }
  toolbarClass = {
    show: false
  }
  get tbState () {
    return this.toolbarClass.show === true
  }
  helpState = true
  toolbarMouseEnter(event) {
    this.clearToolbarTimer()
  }
  toolbarMouseLeave(event) {
    this.resetToolbarTimer()
  }
  showToolbar (e:HTMLElement) {
    let te:HTMLElement = this.toolbar.nativeElement
    let appendToParent = ()=> {
      let [nodeRect, toRect] = [e.getBoundingClientRect(), this.wrapper.nativeElement.getBoundingClientRect()]
      let teRect = te.getBoundingClientRect()
      let offset = [nodeRect.left - toRect.left, nodeRect.top - toRect.top]
      //te.style.left = `${offset[0] - teRect.width / 2 + nodeRect.width / 2}px`
      //te.style.top = `${offset[1] - teRect.height - 5}px`
      te.style.left = `${offset[0] + nodeRect.width}px`
      te.style.top = `${offset[1] - teRect.height / 2 + nodeRect.height / 2}px`
    }
    function appendToNode () {
      e.appendChild(te)
      let nodeRect = e.getBoundingClientRect()
      let teRect = te.getBoundingClientRect()
      te.style.top = `-${(120 - nodeRect.height)/2}px`
      te.style.left = `${nodeRect.width}px`
    }
    appendToParent()
    let teRect = te.getBoundingClientRect()
    this.toolbarClass.show = true
  }
  hideToolbar () {
    this.clearToolbarTimer()
    this.toolbarClass.show = false
  }
  onCollapse(event:Event) {
    if(this.hover)
    toggleCollapse(this.diagram, this.hover)
    event.stopPropagation()
  }
  onAdd(event) {
    if(this.hover)
      appendChild(this.diagram, this.hover, defaultText)
    event.stopPropagation()    
  }
  onDelete (event) {
    if(this.hover) {
      removeChild(this.diagram, this.hover)
      this.hover = null
      this.hoverElement = null
    }
    event.stopPropagation()
  }
  onToolbarMouse (event:MouseEvent) {
  }
  toolbarTimer
  resetToolbarTimer() {
    this.clearToolbarTimer()
    this.toolbarTimer = setTimeout(() => {
      this.hideToolbar()
    }, 1000);
  }
  clearToolbarTimer() {
    if(this.toolbarTimer) {
      clearTimeout(this.toolbarTimer)
      this.toolbarTimer = null
    }
  }
  ngOnInit() {
    this.onInit.emit();
    this.diagram = createDiagram(this.wrapper.nativeElement)
    this.subs.push(this.storeChange.subscribe(store=>{
      let data = store['data'];
      if(data) {
        this.setModel(data)
      } else {
        let title = store['title']
        appendChild(this.diagram, null, title ? title : defaultText)
      }
    }));
    let dragOverNode = null
    this.subs.push(this.diagram.events.do(e => {
      switch(e.type) {
        case 'click': {
          // toggleCollapse(e.state, e.node)
          console.log('click event', e)
          let {element} = e
          element.tabIndex = "-1"
          $(element).focus()
          break
        }
        case 'dblclick': {
          this.handleTextEdit(e)
          break
        }
        case 'mouseenter': {
          let element = e['element']
          let node = e['node']
          this.clearToolbarTimer()
          this.showToolbar(element)
          this.hover = node
          this.hoverElement = element
          break
        }
        case 'zoom.start':
          this.hideToolbar()
          break
        case 'mouseleave': {
          let {element} = e
          if(this.tbState) {
            this.resetToolbarTimer()
          }
          break
        }
        case 'dragstart': {
          let {element} = e
          $(element).addClass('dragging')
          break
        }
        case 'drag': {
          if(dragOverNode) {
            $(dragOverNode).removeClass('drop-target')
            dragOverNode = null
          }
          break
        }
        case 'dragover': {
          let {overElement} = e 
          if(!dragOverNode) {
            dragOverNode = overElement
            $(dragOverNode).addClass('drop-target')
          }
          break
        }
        case 'dragend': {
          if(dragOverNode) {
            $(dragOverNode).removeClass('drop-target')
          }
          let {element} = e
          $(element).removeClass('dragging')
          break
        }
      }
    })
    .filter(e => modifyTypes.find(v => v === e.type))
    .subscribe(e => {
      let {type, node} = e
      if(type === 'add') {
        let element = $(`#mind-tree [data-id=${node.id}]`)[0]
        if(node.parent === null) {
          // root node
          setTimeout(() => {
            this.showToolbar(element)            
          }, 500);
        } else  {
          setTimeout(()=> {
            this.handleTextEdit({node, element})
          }, 200)
        }
      }
      this.emitChange(e)
    }))

    this.subs.push(Observable
      .fromEvent(this.wrapper.nativeElement, 'keydown')
      .subscribe((e:KeyboardEvent) => {
        let target:HTMLElement = <HTMLElement>e.target;
        let nodeId = target.dataset.id
        if(!nodeId) {
          return
        }
        let handled = true
        switch(e.key) {
          case 'Delete':
          case 'Backspace':
            deleteNodeId(this.diagram, nodeId)
            break
          case 'Tab':
            appendChildToNodeId(this.diagram, nodeId, defaultText)
            break
          case 'Enter':
            appendSiblingToNodeId(this.diagram, nodeId, defaultText)
            break
          default:
            handled = false
        }
        if(handled) {
          e.preventDefault()
          e.stopPropagation()
        }
      }))
      this.subs.push(Observable.fromEvent(document, 'keyup')
                      .filter((e:KeyboardEvent) => e.key === 'Escape')
                      .subscribe((e:KeyboardEvent) => {
                        if(this.fullscreen) {
                          this._fullscreen.next(false)
                          e.preventDefault()

                        }
                      }))
  }
  ngOnDestroy() {
    forEach(this.subs, sub=>sub.unsubscribe());
    this.onDestroy.emit();
  }

  centerTree(event) {
    centerRoot(this.diagram)
  }
  private subs:Subscription[] = [];
  registerEvents() {
  }

  isModified:boolean = false;
  emitChange(source) {
    this.isModified = true
    this.modifiedChange.next({format: 'mf-1.0', diagram: this, source, from: 'diagram'})
  }

  inputText:string = ''
  editNode:any;
  handleTextEdit({node, element}) {
    console.log('handle text edit', node)
    element.tabIndex = "-1"
    $(element).focus()
    let {container} = this.diagram;
    container.scrollLeft = container.scrollLeft
    container.scrollTop = container.scrollTop
    let rect = element.getBoundingClientRect()
    this.editable.left = rect.left
    this.editable.top = rect.top
    this.editable.height = rect.height
    this.editable.width = rect.width
    this.editable.content = node.content
    this.editable.node = node
    this.editable.show()
    this.hideToolbar()
    this.editable.done.take(1).subscribe(e => {
      $(element).focus()
      this.submitTextArea(e)})
  }

  onZoom(event) {
    // console.log("on zoom", event)
  }
  submitTextArea({node, content}) {
    setContent(this.diagram, node, content)
  }
  dropdownStyle = {
    left:"100px",
    top:"100px",
    display:"none",
    position:'fixed'
  }
  data:any

  _fullscreen = new BehaviorSubject(false)
  toggleFullscreen() {
    this._fullscreen.next(!this._fullscreen.getValue())
  }
  get fullscreen() {
    return this._fullscreen.getValue()
  }
  toJSON() {
    let {root} = this.diagram
    function convertToJson(children) {
      if(!children || children.length === 0)
        return
      let newChildren = children.map(c => {
        return {id: c.id, 'node-type': `${c.type}-node`, content:c.content, children: convertToJson(c.children)}
      })
      return newChildren
    }
    let data = {
      id: root.id,
      content: root.content,
      ['left-children']: convertToJson(root['children'].filter(c => c.type === 'left')),
      ['right-children']: convertToJson(root['children'].filter(c => c.type === 'right'))
    }
    return data
  }

  convert (r) {
    function convertNode (p, ckeys) {
      let childrens = ckeys.map(k => p[k] || [])
      // let children = Array.map(lc.concat(rc, c), convertNode)
      let children = Array.prototype.concat.apply([], childrens)
        .map(c => convertNode(c, ['left-children', 'right-children', 'children']))
      if (children.length === 0) children = null
      let [content, id] = at(p, ['content', 'id'])
      if(!content) content = {}
      return {
        content,
        id,
        children
      }
    }
    let left = convertNode(r, ['left-children'])
    let right = convertNode(r, ['right-children'])
    return {
      content: left['content'],
      id: left.id,
      left: left.children,
      right: right.children
    }
  }

  loading:boolean = false;
  setModel(data) {
    if(!data) return;
    if(typeof(data) === 'string')
      this.data = data = JSON.parse(data);
    loadData(this.diagram, this.convert(data))
    this.loading = true;
  }
 imageInfo() {
  /*
    let getCellsBBox =  (cells, opt?) => {
        return _.reduce(cells, (memo, cell:joint.dia.Cell)=> {
            let view:joint.dia.CellView;
            let bbox;
            if (cell.isLink()) {
              bbox = this.paper.findViewByModel(cell).getBBox(opt);
            } else 
              bbox = (<joint.dia.Element>cell).getBBox();
            if (memo) {
                return memo.union(bbox);
            } else {
                return bbox;
            }
        }, null);
    }
        
    let srcBBox = getCellsBBox(this.graph.getCells());
    srcBBox.height += 100;
    srcBBox.width += 100;
    srcBBox.x -= 50;
    srcBBox.y -= 50;
    return {
      
      bbox: srcBBox
    }
    */
  }  
}

@Component({
  selector:'[mind-diagram-menu]',
  templateUrl:'mind-diagram-menu.component.html'
})
export class MDMenuComponent {
  @Input() diagram:MDComponent;
  @Input() page:PageComponent;
  @Output('events') events = new EventEmitter();
}

