import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { PageComponent } from "./page.component";
import { InlineEditorModule } from '@qontu/ngx-inline-editor';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TagModule } from '../tag';
import { ToastModule } from 'ng2-toastr';
import { UtilService } from '../_helpers/util'
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule} from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatToolbarModule} from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from "@angular/material/icon";
import { ModalsModule } from "../modals";

@NgModule({
  imports:[
           RouterModule,
           CommonModule,
           FormsModule,
           TagModule,
           ToastModule,
           MatDialogModule,
           MatInputModule,
           MatButtonModule,
           MatFormFieldModule,
           MatToolbarModule,
           MatTooltipModule,
           MatIconModule,
           ModalsModule
	  ],
  declarations: [ PageComponent ],
  entryComponents:[],
  exports: [PageComponent],
  providers: [UtilService]
})
export class PageModule {}
