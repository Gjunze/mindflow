import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from "@angular/forms";
import { LoginComponent } from './login.component';

import { ToastModule } from 'ng2-toastr';
const routes = [
  {path: '', component: LoginComponent},
]
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ LoginComponent ]
})
export class LoginModule { }
