import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ShareComponent } from "./share.component";
import { TooltipModule } from 'ngx-bootstrap/tooltip'
import { ModalModule } from 'ngx-bootstrap/modal'
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DiagramModule } from '../diagram/diagram.module';
import { MDModule } from '../mind-diagram/mind-diagram.module';
import { SaveComponent } from './save.component';
import { AuthGuard } from '../_guards'
import { DataTableModule } from 'angular2-datatable';
import { ToastModule } from 'ng2-toastr';
const routes = [
    {path:'', component:ShareComponent},
];
const routing = RouterModule.forChild(routes);

@NgModule({
    imports:[routing,
        CommonModule,
        FormsModule,
        TooltipModule,
        ModalModule,
        DiagramModule,
        MDModule,
        DataTableModule,
        ToastModule
    ],
    declarations: [ ShareComponent ],
})
export class ShareModule {}
