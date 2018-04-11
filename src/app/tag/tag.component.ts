import { Component, OnInit, OnDestroy, Input, EventEmitter, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import forEach from 'lodash/forEach'
import { PageState } from '../state';
import { MatDialog } from '@angular/material/dialog';
import { InputModalComponent } from '../modals';
@Component({
  selector:'tags',
  styleUrls:['./tag.component.scss'],
  templateUrl:'./tag.component.html'
})
export class TagComponent implements OnInit, OnDestroy {
  constructor(private pageState: PageState, private diaglog: MatDialog) {}

  subs:Subscription[] = [];
  get currentTag() {
    return this.pageState.currentTag
  }
  get tags() {
    return this.pageState.tags;
  }
  ngOnInit() {
    //this.subs.push(this.pub.filter(({type})=>type === 'tags').subscribe(event=>this.tags = event['data']))
  }
  ngOnDestroy() {
    forEach(this.subs, sub=>sub.unsubscribe());
  }
  create() {
    this.diaglog.open(InputModalComponent, {data: {}})
    .afterClosed()
    .subscribe(value => {
      if(value && value.input)  {
        this.pageState.createTag(value.input);
      }
    })
  }
  select(tag) {
      this.pageState.selectTag(tag);
  }
  delete(tag) {
    this.pageState.removeTag(tag);
  }
}