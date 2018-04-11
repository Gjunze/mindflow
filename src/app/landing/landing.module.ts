import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from "@angular/forms";
import { LandingComponent } from './landing.component';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { ToastModule } from 'ng2-toastr';
import {MatCardModule, MatGridListModule} from '@angular/material';
const routes = [
  {path:'', component: LandingComponent},
]
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    CarouselModule,
    MatCardModule,
    MatGridListModule
  ],
  declarations: [ LandingComponent ]
})
export class LandingModule { }
