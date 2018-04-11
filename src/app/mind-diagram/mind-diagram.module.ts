import { NgModule } from "@angular/core";
import { MDComponent, MDMenuComponent } from "./mind-diagram.component";
import { MDSideComponent } from './mind-diagram-side.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagModule } from '../tag';
import { Editable } from './editable.component'
import { ContenteditableModel } from './contenteditable-model';
import { MatModules } from '../core/mat-modules';

@NgModule({
    imports:[ CommonModule , 
        FormsModule, 
        TagModule,
        CommonModule,
        MatModules
        ],
    declarations:[MDComponent, MDMenuComponent, MDSideComponent, Editable, ContenteditableModel],
    exports:[MDComponent, MDMenuComponent, MDSideComponent],
})
export class MDModule {};
