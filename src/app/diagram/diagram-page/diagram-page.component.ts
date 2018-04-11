import { Component, ViewChild, OnInit, ComponentFactoryResolver, ViewContainerRef } from "@angular/core";
import { PageComponent } from "../../page";
import { DiagramComponent } from '../diagram/diagram.component';
import { DiagramMenuComponent } from '../diagram-menu/diagram-menu.component';
import { DiagramSideComponent } from '../diagram-side/diagram-side.component';
@Component({
  host: {class: 'diagram-page'},
  template:"<page> </page>"
})
export class DiagramPageComponent implements OnInit{
  @ViewChild(PageComponent) page: PageComponent;
  constructor(private resolver: ComponentFactoryResolver) {
  }
  ngOnInit() {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    let diagramFactory = this.resolver.resolveComponentFactory(DiagramComponent);
    let menuFactory = this.resolver.resolveComponentFactory(DiagramMenuComponent);
    let panelFactory = this.resolver.resolveComponentFactory(DiagramSideComponent);
    this.page.setContainerComps({diagram: diagramFactory, panel:panelFactory, menu: menuFactory});
  }
}