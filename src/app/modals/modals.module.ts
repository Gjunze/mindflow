import { NgModule } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { AlertModalComponent } from "./alert-modal.component";
import { InputModalComponent } from "./input-modal.component";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { MatInputModule } from "@angular/material/input";

@NgModule({
    imports: [
        MatDialogModule,
        CommonModule,
        FormsModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule
    ],
    exports:[
        AlertModalComponent,
        InputModalComponent,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule
    ],
    declarations: [
        AlertModalComponent,
        InputModalComponent
    ],
    entryComponents: [
        InputModalComponent,
        AlertModalComponent
    ]
})
export class ModalsModule {};
