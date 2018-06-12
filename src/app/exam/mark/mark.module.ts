import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AngularDraggableModule } from 'angular2-draggable';
import { BusyModule } from 'angular2-busy';

import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import {MarkService} from 'app/exam/mark/mark.service';

import { MarkComponent } from './mark.component';
import { MarkListComponent } from './mark-list.component';
import { CanvasComponent } from './canvas.component';

@NgModule({
  imports: [
    CommonModule,
    NgxDatatableModule,
    RouterModule.forChild([
      { path: 'mark', component: MarkComponent },
      { path: 'markList', component: MarkListComponent }
    ]),
    ReactiveFormsModule,
    FormsModule,
    HttpModule,
    AngularDraggableModule,
    BusyModule
  ],
  declarations: [
    MarkComponent,
    MarkListComponent,
    CanvasComponent
  ],
  providers: [MarkService]
})
export class MarkModule { }
