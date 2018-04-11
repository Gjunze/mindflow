import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from '@angular/forms';
import { MergeUserComponent } from './mergeUser.component';
import { MomentModule } from 'angular2-moment';
import { ToastModule } from 'ng2-toastr';

const routes = [
    {path:'', component:MergeUserComponent}
];

@NgModule({
    imports:[
      RouterModule.forChild(routes),
      CommonModule,
      FormsModule,
      MomentModule,
      ToastModule
    ],
    declarations:[MergeUserComponent]
})
export class MergeUserModule {};
