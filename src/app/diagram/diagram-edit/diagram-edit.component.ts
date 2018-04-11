import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

@Component({
    selector: 'diagram-edit',
    styleUrls: ['./diagram-edit.component.scss'],
    templateUrl: './diagram-edit.component.html'
})
export class DiagramEditComponent implements OnInit{
    form: FormGroup;
    constructor(private dialog: MatDialogRef<DiagramEditComponent>, @Inject(MAT_DIALOG_DATA) public data: any){}
    ngOnInit() {
        let {fields}  = this.data;
        this.form = this.toFormGroup(fields);
    }
    toFormGroup(fields:[any]) {
        let group = {};
        fields.forEach(({controlType, key, value, required})=> {
            group[key] = required ? new FormControl(value, Validators.required) 
                : new FormControl(value);
        });
        
        return new FormGroup(group);
    }
    confirm() {
        this.dialog.close(this.form.value);;
    }
    cancel() {
        this.dialog.close();
    }
}