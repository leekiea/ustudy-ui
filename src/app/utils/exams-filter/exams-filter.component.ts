import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ExamService } from '../../exam/exam.service';
import { SharedService } from '../../shared.service';

import * as _ from 'lodash';

@Component({
  selector: 'exams-filter',
  templateUrl: './exams-filter.component.html',
  styleUrls: ['./exams-filter.component.css']
})
export class ExamsFilterComponent implements OnInit {
  examOptions: any;
  bsRangeValue = [null, null];
  name: '';
  @Output() result = new EventEmitter();
  selectedGrade: any;
  selectedSubject: any;
  exams: any;
  props: any;

  constructor(private _examService: ExamService, private _sharedService: SharedService) { }

  ngOnInit() {
    Promise.all([
    this._examService.getExamOptions().then((data) => {
      this.examOptions = data
    }),
    this._examService.getTeacherExams().then((data) => {
      this.exams = data;
    }),
    this._examService.getTeacherProps().then((data) => {
      this.props = data;
    })
    ]).then(() => {
      let that = this;
      let perms = this._sharedService.checkViewPerm('paper');
      if (perms.grade == 'NONE' || perms.subject == 'NONE') {
        this.exams = [];
      } else if (perms.grade == 'ALL_GRADE') {
        if (perms.subject == 'SELF_SUBJECT') { 
          this.exams.forEach( (exam, i) => {
            exam.GrSubDetails=exam.GrSubDetails.filter(function(grSubDetail) {
              let match = false;
              for(let subject of that.props.subjects) {
                if (subject.id === grSubDetail.subId) {
                  match = true;
                  break;
                }
              }
              return match;
            });
            if (exam.GrSubDetails.length===0) {
              delete this.exams[i];
            }
          });
        }
      } else {
        if (perms.subject == 'ALL_SUBJECT') { 
          this.exams = this.exams.filter(function(exam) {
            let match = false;
            for(let grade of that.props.grades) {
              if (grade.id === exam.gradeId) {
                match = true;
                break;
              }
            }
            return match;
          });
        } else if (perms.subject == 'SELF_SUBJECT') { 
          this.exams = this.exams.filter(function(exam) {
            let match = false;
            for(let grade of that.props.grades) {
              if (grade.id === exam.gradeId) {
                match = true;
                break;
              }
            }
            return match;
          });
          this.exams.forEach( (exam, i) => {
            exam.GrSubDetails=exam.GrSubDetails.filter(function(grSubDetail) {
              let match = false;
              for(let subject of that.props.subjects) {
                if (subject.id === grSubDetail.subId) {
                  match = true;
                  break;
                }
              }
              return match;
            });
            if (exam.GrSubDetails.length===0) {
              delete this.exams[i];
            }
          });
        }
      }
      this.result.emit(this.exams);
    });
  }

  onSelected($event: Event) {
    return null
  }

  returnResult() {
    const options = Object.create(
      {
        subjectName: '',
        gradeName: '',
        examName: '',
        start: '',
        end: ''
    });

    if (this.selectedSubject) {
      options.subjectName = this.selectedSubject.name
    }
    if (this.selectedGrade) {
      options.gradeName = this.selectedGrade.name
    }
    if (this.name) {
      options.examName = this.name
    }
    const start = _.first(this.bsRangeValue);
    const end = _.last(this.bsRangeValue);
    if (start != null) {
      options.start = `${start!.getFullYear()}-${start!.getMonth() + 1}-${start!.getDate()}`
    }
    if (end != null) {
      options.end = `${end!.getFullYear()}-${end!.getMonth() + 1}-${end!.getDate()}`
    }

    console.log("before filter " + JSON.stringify(this.exams));

    console.log("gradeName " + options.gradeName);
    console.log("subjectName " + options.subjectName);
    console.log("examName " + options.examName);

    // filter our data
    const temp = this.exams.filter(function(d) {
      return d.gradeName.indexOf(options.gradeName) !== -1
        && d.examName.indexOf(options.examName) !== -1;
    });
    temp.forEach( (exam, i) => {
      exam.GrSubDetails=exam.GrSubDetails.filter(function(d) {
        return d.subName.indexOf(options.subjectName) !== -1;
      });
      if (exam.GrSubDetails.length===0) {
        delete temp[i];
      }
    });
    console.log("after filter " + JSON.stringify(temp));
    this.result.emit(temp);
  }
}
