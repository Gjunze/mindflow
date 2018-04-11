import { Injectable, NgZone} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import { environment } from '../../environments/environment'

declare var io:any;
@Injectable()
export class Socket{
    socket:any;
    constructor(private zone:NgZone){
      if(environment.apiroot)
        io.sails.url = environment.apiroot
    this.socket = io.sails.connect();
    }
    post(url:string, body) {
        return Observable.create((subject) => {
          this.socket.post(url, body, (data, res)=>this.handleResp(data, res, subject));
        })
    }
    get(url, opts?) {
      return Observable.create((subject)=> {
          this.socket.get(url, (data, res)=>this.handleResp(data, res, subject));
        })
    }
    on(event, cb) {
      this.socket.on(event, cb);
    }
    off(event, cb) {
      this.socket.off(event, cb);
    }
    isConnected() {
      return this.socket.isConnected();
    }
    handleResp(data, res, subject) {
        this.zone.run(()=> {
          if(res.statusCode > 299 || res.statusCode < 200)
          subject.error(res);
        else
          subject.next(data);

        })
    }
}
