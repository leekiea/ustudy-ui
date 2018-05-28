import {ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import * as _ from 'lodash';
import { ExamService } from '../../exam/exam.service';
import { SharedService } from '../../shared.service';

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
  selectedGradeCls: any[];
  selectedSchool: any;
  selectedClass: any;
  props: any;

  constructor(private chRef: ChangeDetectorRef, private _sharedService: SharedService, private _examService: ExamService) { }

  ngOnChanges(changes) {
    if (changes.selectedExam.currentValue) {
      this._examService.getTeacherProps().then((data) => {
        this.props = data;
        let that = this;
        this.selectedSchool = _.first(changes.selectedExam.currentValue.schools);
        let perms = this._sharedService.checkViewPerm('analysis');
        if (perms.grade == 'NONE' || perms.subject == 'NONE') {
          this.selectedSchool.GradeDetails = [];
        } else if (perms.grade == 'ALL_GRADE') {
          if (perms.subject == 'SELF_SUBJECT') {
            for(let grade of this.selectedSchool.GradeDetails) {
              for (let sub in grade.subs) { // subs is a JSON Object
                for(let propSub of this.props.subjects) {
                  if (propSub.id != sub) {
                    delete grade.subs[sub]; 
                  }
                }
              }
            }
          }
        } else if (perms.grade == 'SELF_GRADE') {
          this.selectedSchool.GradeDetails = this.selectedSchool.GradeDetails.filter(function(grade){
            let match = false;
            for(let propGrade of that.props.grades) {
              if (propGrade.name == grade.gradeName) {
                match = true;
                break;
              }
            }
            return match;
          });
          if (perms.subject == 'SELF_SUBJECT') {
            for(let grade of this.selectedSchool.GradeDetails) {
              for (let sub in grade.subs) {
                for(let propSub of this.props.subjects) {
                  if (propSub.id != sub) {
                    delete grade.subs[sub]; 
                  }
                }
              }
            }
          }
        }
        this.selectedGrade = _.first(this.selectedSchool.GradeDetails);
        this.onGradeChange();
        this.returnResult();
      });
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
      return _.map(_.toPairs(this.selectedGrade.subs), (a) => {
        return {id: a[0], name: a[1]}
      })
    }
  }

  getClasses() {
    if (!this.selectedGrade) {
      return []
    } else {
      let map = _.map(_.toPairs(this.selectedGrade.clsinfo), (a) => {
        return {id: a[0], name: a[1]}
      });
      let resultMap = [];
      resultMap.push({id: '-1', name: '全部'});
      resultMap = resultMap.concat(map);
      return resultMap;
    }
  }

  getClassOptions() {
    return _.times(this.selectedGrade.clsNum, (i) => i + 1)
  }

  onGradeChange() {
    this.selectedGradeSubs = this.getSubs();
    this.selectedSubject = _.first(this.selectedGradeSubs);
    this.selectedGradeCls = this.getClasses();
    this.selectedClass = _.first(this.selectedGradeCls);
  }
}
