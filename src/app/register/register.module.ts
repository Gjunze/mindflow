import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from "@angular/forms";
import { RegisterComponent } from './register.component';

import { ToastModule } from 'ng2-toastr';
const routes = [
  {path: '', component: RegisterComponent},
]
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ RegisterComponent ]
})
export class RegisterModule { }
