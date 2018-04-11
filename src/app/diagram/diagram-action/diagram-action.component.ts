import { Component, OnInit , Inject} from '@angular/core';
import {MatDialogRef, MatDialog, MAT_DIALOG_DATA} from '@angular/material/dialog';
@Component({
  selector: 'diagram-action',
  templateUrl: './diagram-action.component.html',
  styleUrls: ['./diagram-action.component.scss']
})
export class DiagramActionComponent implements OnInit {

  constructor(private dialog: MatDialogRef<DiagramActionComponent>, @Inject(MAT_DIALOG_DATA) public data: any) { }

  simpleMode = false;
  ngOnInit() {
    if(this.data && this.data.simpleMode)
      this.simpleMode = true;
  }
  close(reason) {
    this.dialog.close(reason);
  }
}
