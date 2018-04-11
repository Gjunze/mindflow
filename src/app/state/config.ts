import { MatSnackBarConfig } from "@angular/material/snack-bar";
import { Injectable } from "@angular/core";
import {MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from '@angular/material/snack-bar';

@Injectable()
export class Config {
  snackBarConfig = {
    horizontalPosition : <MatSnackBarHorizontalPosition>'center',
    verticalPosition : <MatSnackBarVerticalPosition> 'top',
    duration: 500
  }
}