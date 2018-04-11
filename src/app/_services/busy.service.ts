import { Injectable } from '@angular/core';

function _set_prm(el, n, v)
{
  if (( v == undefined ) || ( v == null ))
    throw("busy_indicator: " + n + " is not supplied");
  el[n] = v;
}

@Injectable()
export class BusyService {
  private el:any;
  private cb:any;
  private pos:any;
  private show_class:any;
  private cnt:any;
  constructor() {
    console.log('busy created');
    let cntr_el = document.getElementById("busybox");
    let img_el = document.querySelector("#busybox div");
    this.el = {};
    this.cb = {show: null, hide: null};
    this.pos = {x: 0, y: 0};
    this.show_class = "show";


    _set_prm(this.el, "cntr", cntr_el);
    this.el.img = img_el;
    this.cnt = 0;
  }
  show() {
    var top, left;
    var img_el;


    this.cnt++;
    if ( this.cnt > 1 )
      return;

    this.el.cntr.classList.add(this.show_class);

    this.align();  
  }
  align() {
    if (this.el.img == null)
      return;
    
    this.pos = this.calc_pos();

    this.el.img.style.top = this.pos.y + "px";
    this.el.img.style.left = this.pos.x + "px";
  }
  calc_pos() {
    var x, y;


    x = this.el.cntr.clientWidth/2 - this.el.img.offsetWidth/2;
    y = this.el.cntr.clientHeight/2 - this.el.img.offsetHeight/2;
    
    return {x: x, y: y};
  }
  
  hide() {
    console.log('busy hide');
    if ( this.cnt > 0 )
      this.cnt--;
    else
      return;

    if ( this.cnt )
      return;

    this.el.cntr.classList.remove(this.show_class);    
  }
}

