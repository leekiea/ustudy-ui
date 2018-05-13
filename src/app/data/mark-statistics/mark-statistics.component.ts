import { Component, OnInit } from '@angular/core';
import { DataService } from 'app/data/data.service';
import * as _ from 'lodash';
import { sprintf } from 'sprintf-js';

@Component({
  selector: 'app-mark-statistics',
  templateUrl: './mark-statistics.component.html',
  styleUrls: ['./mark-statistics.component.css']
})
export class MarkStatisticsComponent implements OnInit {
  marks: any;
  selectedResult: any;
  filteredMarks = [];

  get selected() {
    return this.selectedResult
  }

  constructor(private _dataService: DataService) { }

  ngOnInit(): void {
    this._dataService.getMarks().then((data: any) => {
      this.marks = data;
      this.filteredMarks = JSON.parse(JSON.stringify(data));
      console.log("got marks: " + JSON.stringify(this.marks));
    })
  }

  selectResult(result) {
    this.filteredMarks = result.marks;
    this.selectedResult = result;
    console.log("filtered marks: " + JSON.stringify(this.filteredMarks));
  }

  stringify(data) {
    return JSON.stringify(data);
  }
  // getHours(subject) {
  //   const questions = _.reduce(_.map(subject.marks, 'summary'), (r, i) => r.concat(i), []);
  //   return _.sum(_.map(questions, 'costHours'));
  // }

  // getProgress(subject) {
  //   const questions = _.reduce(_.map(subject.marks, 'summary'), (r, i) => r.concat(i), []);
  //   const names = _.uniq(_.map(questions, 'questionName')).sort();
  //   const progresses = _.map(names, (name) => {
  //     let total = 0, markedNum = 0;
  //     for (const question of _.filter(questions, { questionName: name })) {
  //       total = total + question.mark.total;
  //       markedNum = markedNum + question.details.length
  //     }
  //     return markedNum / total;
  //   });
  //   const finalProgress = progresses.length === 0 ? 0 : _.sum(progresses) / progresses.length;
  //   return sprintf('%.2f%%', finalProgress * 100)
  // }
}
