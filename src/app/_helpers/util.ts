import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { NgZone, Injectable } from '@angular/core'

@Injectable()
export class UtilService {
  constructor(private zone: NgZone) {}
  fromBBEvent(target, type):Observable<any> {
    return Observable.create((observer:Subscriber<any>)=>{
      let listener = (...args) => {
        this.zone.run(()=> {
          observer.next(args);
        })
      };
      target.on(type, listener);
      return ()=>target.off(type, listener);
   });
  
  }
}
