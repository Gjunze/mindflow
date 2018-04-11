import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/do';
import forEach from 'lodash/forEach'

export class DragHandler{
    startX:number;
    startY:number;
    transX = 0.0;
    transY = 0.0;
    _transX:number;
    _transY:number;
    dragging = false;
    blankClickEvent = new Subject();
    private subs:Subscription[] = [];
    constructor( private transLayer, 
      private container:HTMLElement, private size, eventSource?:Observable<any>) {
        if(!eventSource)
          eventSource = Observable.fromEvent(this.container, 'mousedown');
        let sub = eventSource.do(e=>this.pointerdown(e)).subscribe(()=>{
          Observable.fromEvent(document, 'mousemove')
          .takeUntil(Observable.fromEvent(document, 'mouseup'))
          .subscribe(e=>this.pointermove(<MouseEvent>e), ()=>{}, ()=>this.pointerup());           
        });
        this.subs.push(sub);
    }
    destroy() {
      forEach(this.subs, sub=>sub.unsubscribe());
    }
    moves:number;
    event:MouseEvent;
    pointerdown (event:MouseEvent) {
      this.startX = event.clientX;
      this.startY = event.clientY;
      this._transX = this.transX;
      this._transY = this.transY;
      this.dragging = true;
      this.moves = 0;
      this.event = event;
    }
    pointermove (event:MouseEvent) {
      if(!this.dragging) return;
      let offsetX = event.clientX - this.startX,
          offsetY = event.clientY - this.startY;
      let x= this._transX + offsetX;
      let y = this._transY + offsetY;
      //if(x> -this.size.width && y > -this.size.height && x<=0 && y <=0)  {
      this.onTranslate({x, y});
      //}
      this.moves += 1;
    }
    pointerup() {
      this.dragging = false;
      if(this.moves < 2)
        this.blankClickEvent.next(this.event);
    }
    setTrans(x, y) {
      this.transX = x;
      this.transY = y;
      this.onTranslate({x:this.transX, y:this.transY});
    }
    onTranslate(trans, offset?) {
      let e = $(this.transLayer);
      let x, y;
      let p = e.position();
      let pp = $(this.container);
      let width =pp.width(), height  = pp.height();
      x = trans.x, y = trans.y;
      if(offset)  {
        x += p.left;
        y += p.top;
      } 
      this.transX = x;
      this.transY = y;
      $(e).css('transform', `translate(${x}px, ${y}px)`);
    }
}
