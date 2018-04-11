import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    template:`
        <h1 mat-dialog-title> {{data.title}} </h1>
        <div mat-dialog-actions>
            <button mat-button (click)="close()">取消</button>
            <button mat-button [mat-dialog-close]=confirm> 确认 </button>
        </div>
    `
})
export class AlertModalComponent {
    constructor(private  dialog: MatDialogRef<AlertModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}
    confirm = 'confirm'
    close(result?) {
        this.dialog.close(result);
    }
}
