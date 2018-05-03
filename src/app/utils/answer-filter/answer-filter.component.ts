import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'answer-filter',
  templateUrl: './answer-filter.component.html',
  styleUrls: ['./answer-filter.component.css']
})
export class AnswerFilterComponent implements OnChanges {
  @Input() selectedExam: any;
  @Output() selectResult = new EventEmitter();
  selectedGrade: any;
  selectedSubject: any;
  selectedGradeSubs: any[];
  classOptions: any[];
  selectedSchool: any;
  selectedClass: any;

  constructor() { }

  ngOnChanges(changes) {
  }

  returnResult() {
    // const mockData = {
    //   total: 600,
    //   highest: 709,
    //   lowest: 250,
    //   average: 444,
    //   median: 451,
    //   passNum: 501,
    //   hardness: 0.45,
    //   discrimination: 0.6,
    //   sd: 3.7,
    //   scores: [650, 651, 450, 250]
    // };
    // this.selectResult.emit(mockData)
    if (!this.selectedSchool) {
      alert('请选择学校');
      return
    }
    if (!this.selectedGrade) {
      alert('请选择年级');
      return
    }
    if (!this.selectedSubject) {
      alert('请选择科目');
      return
    }
    if (!this.selectedClass) {
      alert('请选择班级');
      return
    }
    const result = Object({});
    result.school = this.selectedSchool;
    result.grade = this.selectedGrade;
    result.subject = this.selectedSubject;
    result.class = this.selectedClass;
    this.selectResult.emit(result)
  }

  getSubs() {
    if (!this.selectedGrade) {
      return []
    } else {
      console.log(1);
      return _.map(_.toPairs(this.selectedGrade.subs), (a) => {
        return {id: a[0], name: a[1]}
      })
    }
  }

  getClassOptions() {
    return _.times(this.selectedGrade.clsNum, (i) => i + 1)
  }
}
