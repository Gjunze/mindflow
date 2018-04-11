import { NgModule} from "@angular/core";
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { TagModule } from '../tag';
import { UtilService } from '../_helpers/util'
import { DiagramActionComponent } from "./diagram-action/diagram-action.component";
import { DiagramEditComponent } from "./diagram-edit/diagram-edit.component";
import { DiagramPageComponent } from "./diagram-page/diagram-page.component";
import { DiagramComponent } from "./diagram/diagram.component";
import { DiagramMenuComponent } from "./diagram-menu/diagram-menu.component";
import { DiagramSideComponent } from "./diagram-side/diagram-side.component";
import { PageModule } from "../page/page.module";
import { DiagramState } from "./diagram/diagram.state";
import { MatModules } from '../core/mat-modules';
import { MatInputModule } from "@angular/material/input";

const routes = [
  {path:'', component:DiagramPageComponent},
];
const routing = RouterModule.forChild(routes);

@NgModule({
    imports:[
        routing,
        CommonModule , 
        FormsModule, 
        TooltipModule,  
        TagModule,
        ReactiveFormsModule,
        PageModule,
        RouterModule,
        MatModules,
        MatInputModule
        ],
    declarations:[
        DiagramComponent, 
        DiagramMenuComponent, 
        DiagramSideComponent, 
        DiagramActionComponent,
        DiagramEditComponent,
        DiagramPageComponent,
    ],
    exports:[DiagramComponent, DiagramMenuComponent, DiagramSideComponent],
    providers:[UtilService, DiagramState],
    entryComponents:[DiagramActionComponent,
    DiagramEditComponent,
    DiagramComponent,
    DiagramMenuComponent,
    DiagramSideComponent
  ]
})
export class DiagramModule {};

