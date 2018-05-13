import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DataComponent } from './data.component';
import { MarkDataComponent } from './mark/mark.component';
import { MarkStatisticsComponent } from './mark-statistics/mark-statistics.component';
import { MarkQualityComponent } from './mark-quality/mark-quality.component';
import { MarkSearchComponent } from './mark-search/mark-search.component';
import { MarkDetailsComponent } from './mark-details/mark-details.component';
import { QuestionsAnalysisComponent } from './questions-analysis/questions-analysis.component';
import { ReportComponent } from './report/report.component';
import {FormsModule} from '@angular/forms';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import { UtilsModule } from '../utils/utils.module';
import { TreeviewModule } from 'ngx-treeview';
import { ChartsModule } from 'ng2-charts';
import { DataService } from './data.service';
import {ResultStatisticsComponent} from './result-statistics/result-statistics.component';
import {ExamineeResultComponent} from './result-statistics/examinee-result/examinee-result.component';
import {ClassesResultComponent} from './result-statistics/classes-result/classes-result.component';
import {ModalModule} from 'ngx-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    NgxDatatableModule,
    UtilsModule,
    TreeviewModule.forRoot(),
    ModalModule.forRoot(),
    FormsModule,
    RouterModule.forChild([
      {
        path: 'data', component: DataComponent, children: [
          {
            path: 'mark', component: MarkDataComponent, children: [
              { path: 'markStatistics', component: MarkStatisticsComponent },
              { path: 'markQuality', component: MarkQualityComponent },
              { path: 'markSearch', component: MarkSearchComponent },
              { path: 'markDetails', component: MarkDetailsComponent }
            ]
          },
          { path: 'questionsAnalysis', component: QuestionsAnalysisComponent },
          { path: 'report', component: ReportComponent },
          {
            path: 'result', component: ResultStatisticsComponent, children: [
              { path: 'examinees', component: ExamineeResultComponent },
              { path: 'classes', component: ClassesResultComponent },
            ]
          },
        ]
      }
    ]),
    ChartsModule,
  ],
  declarations: [
    DataComponent,
    MarkDataComponent,
    MarkStatisticsComponent,
    MarkQualityComponent,
    MarkSearchComponent,
    MarkDetailsComponent,
    QuestionsAnalysisComponent,
    ReportComponent,
    ResultStatisticsComponent,
    ExamineeResultComponent,
    ClassesResultComponent
  ],
  providers: [
    DataService,
  ]
})
export class DataModule { }
