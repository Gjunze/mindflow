import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { DocListComponent } from "./doclist.component";
import { TreeModule } from 'angular-tree-component';
import { TvModalComponent } from './tvmodal/tvmodal.component';
import { FolderPathComponent } from './folderpath/folderpath.component';
import { AlertModalComponent, InputModalComponent, ModalsModule } from "../modals";
import { DocTypeNamePipe, DocTypeIconPipe } from './doc-type/doc-type.pipe';
import { MatModules } from '../core/mat-modules';
const routes = [
    {path:'', component: DocListComponent}
]
@NgModule({
    imports: [
        RouterModule.forChild(routes),
        CommonModule,
        FormsModule,
        TreeModule,
        ModalsModule,        
        MatModules
    ],
    declarations: [ DocListComponent,  TvModalComponent, FolderPathComponent, DocTypeNamePipe, DocTypeIconPipe ],
    entryComponents: [TvModalComponent, AlertModalComponent, InputModalComponent],
    providers: []
})
export class DocListModule {};
