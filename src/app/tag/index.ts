import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagComponent } from './tag.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
@NgModule({
  imports: [CommonModule, FormsModule, MatMenuModule, 
    MatDividerModule, MatButtonModule, MatDialogModule],
  declarations: [TagComponent],
  exports: [TagComponent]
})
export class TagModule {}