import { Component, Output, EventEmitter, Injectable } from '@angular/core';
import { PageState } from '../../state';
@Component({
    selector:'[diagram-menu]',
    templateUrl: './diagram-menu.component.html'
})
export class DiagramMenuComponent{
    events:EventEmitter<any>;
    constructor(pageState: PageState) {
        this.events = pageState.menuEvent;
    }
}


