import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from '../data.service';
import { sprintf } from 'sprintf-js';
import * as _ from 'lodash';

@Component({
  templateUrl: './mark-details.component.html',
  styleUrls: ['./mark-details.component.css']
})
export class MarkDetailsComponent implements OnInit {
  questionList = [];
  tab: boolean = true;
  teachers = [{
    teacName: '',
    quesList: [],
    subName: '',
    markProgress: '',
    styleList: [],
    questions: []
  }];

  constructor(private _dataService: DataService, public route: ActivatedRoute) { }

  ngOnInit() {
    console.log("metrics is "+ this.route.snapshot.params.metrics);
    console.log("egsId is "+ this.route.snapshot.params.egsId);
    this.questionList = JSON.parse(this.route.snapshot.params.metrics);
    this.reload(this.route.snapshot.params.egsId);
  }

  reload(egsId): void {
    this._dataService.getTeachers(egsId).then((data: any) => {
      this.teachers = data;
      for (const teacher of this.teachers) {
        let res = [];
        res = _.keys(_.groupBy(_.map(_.orderBy(teacher.questions, 'quesName'), 'quesName')));
        teacher.quesList = res;
        res = _.keys(_.groupBy(_.map(_.orderBy(teacher.questions, 'markStyle'), 'markStyle')));
        teacher.styleList = res;
      }
    }).catch((error: any) => {
      console.log(error.status);
      console.log(error.statusText);
    });
  }

  // getQuestionNames(mark: any) {
  //   return mark.summary.map((s) => {
  //     return s.questionName
  //   }).join(',');
  // }

  // getQuestionProgress(question: any) {
  //   return sprintf('%.2f%%', question.markedNum / question.mark.total * 100)
  // }

  // getTeacherProgress(mark) {
  //   const progresses = mark.summary.map((question) => {
  //     return question.markedNum / question.mark.total
  //   });
  //   if (progresses.length === 0) {
  //     return '0%'
  //   }
  //   return sprintf('%.2f%%', _.sum(progresses) / progresses.length * 100)
  // }
}
