import { Injectable, EventEmitter } from "@angular/core";
import filter from 'lodash/filter'
import findIndex from 'lodash/findIndex'
import { UserService, Socket } from "../_services";
import { UtilService } from '../_helpers/util';


@Injectable()
export class HomeState {
    docs = [];
    curDir;
    curDocs;
    docsEvent = new EventEmitter();
    constructor(private user:UserService, private utilService: UtilService, private socket:Socket) {}
    updateCurDocs() {
        if(!this.curDir) {
           this.curDocs = filter(this.docs, d=>!d['parent']);
        }else {
           this.curDocs = filter(this.docs, d=> d['parent'] === this.curDir);
        }
     }
    updateParent({doc, parent})  {
        let i = findIndex(this.docs, d=>d.id === doc);
        if(i >= 0) {
         this.docs[i].parent = parent; 
         this.updateCurDocs();
        }
    }
    subs = [];
    unsub() {
        this.subs.forEach(s => s.unsubscribe());
        this.subs = [];
    }
    fetchUserDocs() {
        this.unsub();
        this.curDir = null;
        let sub = this.user.register().subscribe(data => {
            this.docs = data['docs'];
            this.updateCurDocs();                  
            this.docsEvent.emit();
        });
        this.subs.push(sub);      
        sub = this.utilService.fromBBEvent(this.socket, 'user').subscribe(data => this.handleUserEvent(data))
        this.subs.push(sub);
        
    }
    handleUserEvent([data]) {
      if(data.id !== this.user.userId())
          return;
      if(data.verb === 'addedTo') {
          this.subs.push(this.user.fetchDoc(data.addedId).subscribe(doc=>{
              this.docs.push(doc);
              this.updateCurDocs();
              this.docsEvent.emit({eventType: 'newDoc', eventTarget: doc});
          }));
      }else if(data.verb === 'removedFrom') {
          let i = findIndex(this.docs, (doc)=>doc['id'] === data.removedId);
          this.docs.splice(i, 1);
          this.updateCurDocs();
          this.docsEvent.emit();
      }
    }
    setCurDir(d){
        this.curDir = d;
        this.updateCurDocs();        
    }
    newDoc(name, type) {
        this.user.newDoc(name, this.curDir, type)
            .subscribe(data => {
                this.docs = data['docs'];
            })
    }
    deleteDoc(docId) {
        this.user.delDoc(docId).subscribe();
    }
}