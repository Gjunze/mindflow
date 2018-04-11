import { Injectable, EventEmitter } from '@angular/core';
import { UserService, StoreService, Socket, TagService } from '../_services';
import { UtilService} from '../_helpers/util';
@Injectable()
export class PageState  {
  constructor(private user:UserService,
    private storeService:StoreService,
    private socket: Socket,
    private util: UtilService,
    private tagService:TagService
  ) {
    this.util.fromBBEvent(this.socket, 'doc').subscribe(doc => this.docUpdated.emit(doc));    
  }
  get inPreview() {
    return false;
  }
  fetchDoc(docId:string) {
    this.user.fetchDoc(docId)
      .mergeMap(doc => {
        this.doc = doc;
        this.docUpdated.emit(doc);
        this.updateTags();
        return this.storeService.fetch(doc.storeId);
      }).subscribe(store => {
        this.store = store;
        this.storeChanged.emit(store);
      });
    

  }
  updateDocTitle(docId:string, title:string)  {
    this.user.updateDocTitle(docId, title).subscribe(() => this.fetchDoc(docId));
  }
  docUpdated = new EventEmitter();
  storeChanged = new EventEmitter();
  menuEvent = new EventEmitter();
  showPanel = false;
  currentTag:string = null;
  store;
  doc;
  tags;
  updateTags() {
    this.tagService
      .find(this.doc.id)
      .subscribe(data => {
        this.tags = data['tags'];
      })
  }
  createTag(name) {
    this.tagService.create({name, docId: this.doc.id, storeId: this.store.id})
      .subscribe(()=>this.updateTags());
  }
  removeTag(tag) {
    this.tagService.delete(tag.id).subscribe(()=>this.updateTags());
  }
  
  selectTag(tag) {
    let storeId;
    if(tag){ 
      storeId = tag.storeId;
    } else {
      storeId = this.doc.storeId;
    }
    this.storeService.fetch(storeId).subscribe(store => {
      this.store = store;
      this.storeChanged.emit(store);
      this.currentTag = tag;
    });
  }
  
}
