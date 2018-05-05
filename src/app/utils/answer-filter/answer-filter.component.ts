import {ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
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

  constructor(private chRef: ChangeDetectorRef) { }

  ngOnChanges(changes) {
    if (changes.selectedExam.currentValue) {
      this.selectedSchool = _.first(changes.selectedExam.currentValue.schools);
      this.selectedGrade = _.first(this.selectedSchool.GradeSubs);
      this.onGradeChange()
    }
  }

  returnResult() {
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

  onGradeChange() {
    this.selectedGradeSubs = this.getSubs();
    this.selectedSubject = _.first(this.selectedGradeSubs);
    this.classOptions = this.getClassOptions();
    this.selectedClass = _.first(this.classOptions)
  }
}
