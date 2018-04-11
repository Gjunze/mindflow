import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

@Component({
    template: `
       <h1 mat-dialog-title> {{data.title}} </h1>
       <div mat-dialog-content>
          <form (ngSubmit)="close(data)">
            <mat-form-field>
                <input matInput [(ngModel)]="data.input" name="input">
            </mat-form-field>
            <button type="submit" style="display:none">hidden submit</button>    
          </form>
        </div>
        <div mat-dialog-actions>
            <button mat-button (click)="close()">否</button>
            <button mat-button [mat-dialog-close]=data> 是 </button>
        </div>
    `
})
export class InputModalComponent {
    constructor(private dialog: MatDialogRef<InputModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}
    close(result?) {
        this.dialog.close(result)
    }
}