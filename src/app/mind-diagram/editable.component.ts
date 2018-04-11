import { Component, 
  ElementRef, 
  EventEmitter, 
  Output, 
  ViewChild, 
  HostListener, 
  OnInit,
  OnDestroy,
  NgZone,
  HostBinding
} from '@angular/core'
import { Observable } from 'rxjs/Observable'
import map from 'lodash/map'
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal'
import { take } from 'rxjs/operators/take';
import { ContenteditableModel } from './contenteditable-model'
import { environment } from '../../environments/environment'
import { ToastsManager} from 'ng2-toastr';
const uploadUrl = `${environment.apiroot}/api/exo`
const padding = 3
const toolbarHeight = 18
@Component({
  styleUrls: ['./editable.component.scss'],
  templateUrl: './editable.component.html',
  selector: 'editable',
})
export class Editable implements OnInit, OnDestroy{
  @Output('done') done = new EventEmitter<any>();
  @ViewChild('edit') edit:ElementRef;
  @ViewChild('container') container:ElementRef;
  @ViewChild('addLinkDiv') addLinkDiv:ElementRef;
  @HostBinding('class.active') get isActive () {
    return this.layerStack.length > 0 
  }
  _left = '0'
  _top = '0'
  _minWidth
  _minHeight
  content = {
    text: '',
    link: '',
    highlight: false
  }
  _link: string
  modalRef:BsModalRef;
  set left (v) {
    this._left = `${v - padding}px`
  }
  set top (v) {
    this._top = `${v - toolbarHeight - padding}px`
  }

  set width (v) {
    this._minWidth = `${v + padding * 2}px`
  }
  set height (v) {
    this._minHeight = `${v + padding * 2}px`
  }
  node:any;
  subs = []
  constructor(private element:ElementRef,
    private zone: NgZone,
    private modalService: BsModalService,
    private toastr: ToastsManager,
    ) {

  }
  ngOnInit () {
  }
  onEditNewLine(event: KeyboardEvent) {
    event.preventDefault()
    let s = window.getSelection()
    
    let r = window.getSelection().getRangeAt(0)
    r.deleteContents()
    let n = document.createTextNode('\r\n')
    
    r.insertNode(n)
    r.setStart(n, 2)
    return false
  }
  submitContent() {
    this.done.next({
      content:this.content,
      node: this.node
    })
    return false
  }

  ngOnDestroy () {
  }

  show (e?) {
    this.zone.run(()=> {
      if(!e) {
        e = this.container.nativeElement
      }
      this.hide()
      this.layerStack.push(e)
      this.activate()
    })    
  }
  hide(e?) {
    if(!e) {
      if(this.layerStack.length)
        e = this.layerStack[this.layerStack.length - 1]
    }
    if(e) {
      $(e).find('.input').blur()
      $(e).removeClass('isActive')
    }
  }
  layerStack = []
  activate(e?) {
    if(!e) {
      if(this.layerStack.length === 0)
        return
      e = this.layerStack[this.layerStack.length - 1]
    }
    $(e).addClass('isActive')
    requestAnimationFrame(()=> {
      $(e).find('.input').focus()
    })
  }

  @HostListener('click', ['$event'])
  onBlankClick(event?) {
    let l = this.layerStack.pop()
    if(l) {
      this.hide(l)
      if(this.layerStack.length === 0) {
        this.submitContent()
      }
      this.activate()
    }
    return false
  }
  @HostListener('mousewheel')
  onBlankWheel(event) {
    return false
  }
  onEditClick(event) {
    event.stopPropagation();
  }
  onContainerClick(event) {
    event.stopPropagation()
  }
  modal:any;
  openModal(template) {
    this.modal = this.modalService.show(template, {class: 'context'})
  }
  hideModal() {
    if(this.modal) 
      this.modal.hide()
  }
  addLink(event:MouseEvent, template) {
    event.stopPropagation()
    this._link = this.content.link;
    this.modalRef = this.modalService.show(template)
    return false
  }
  toggleHighlight(event:MouseEvent) {
    event.stopPropagation()
    this.content.highlight = !this.content.highlight
    this.submitContent()
    return false
  }
  noevent(event: Event) {
    event.stopPropagation()
  }
}