import { BehaviorSubject } from 'rxjs/BehaviorSubject';
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 2.0;

export class ZoomHandler {
  constructor(private zoomLayer:HTMLElement, private container:HTMLElement, fsContainer?:string) {
    if(fsContainer) 
      this.fsContainer = fsContainer;
    else
      this.fsContainer = container;
  }
  fsContainer:string | HTMLElement;
  scale = new BehaviorSubject(1.0);
  fullscreen = new BehaviorSubject(false);
  handle(event) {
    switch(event) {
      case 'zoomin': {
          let new_scale = this.scale.value - 0.05;
          if(new_scale < MIN_ZOOM) new_scale  = MIN_ZOOM;
          this.onZoom(new_scale);
        }
        break;
      case 'zoomout': {
          let new_scale = this.scale.value + 0.05;
          if(new_scale > MAX_ZOOM) new_scale  = MAX_ZOOM;
          this.onZoom(new_scale);
        }
        break;
      case 'fullscreen': {
        console.log('handler fullscreen', !this.fullscreen.value);
        this.onFullScreen(!this.fullscreen.value);
        break;
      }
    }
  }
  onZoom(scale) {
    if(Math.abs(scale - this.scale.value) < Number.EPSILON)
      return;
    let cp = this.container.getBoundingClientRect();
    let p = this.zoomLayer.getBoundingClientRect();
    let top = ((cp.top - p.top) + cp.height/2) / this.scale.value,
      left = ((cp.left - p.left) + cp.width/2) / this.scale.value;

    $(this.zoomLayer).css(
      {
        'transform': `scale(${scale})`,
        'transform-origin': `${left}px ${top}px`,
      }
    );
    this.scale.next(scale);
  }
  
  onFullScreen(enable:boolean) {
    if(this.fullscreen.value === enable) return;
    if(enable)
      $(this.fsContainer).addClass('fullscreen');
    else
      $(this.fsContainer).removeClass('fullscreen');
    this.fullscreen.next(enable);
  }
}