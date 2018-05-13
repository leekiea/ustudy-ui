import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { StudentService } from '../../info/students/student.service';
import * as _ from 'lodash';

@Component({
  selector: 'mark-select',
  templateUrl: './mark-select.component.html',
  styleUrls: ['./mark-select.component.css']
})
export class MarkSelectComponent implements OnChanges {
  @Input() marks: any;
  // @Input() showQuestions = false;
  @Input() selectAll = false;
  @Output() selectResult = new EventEmitter();
  schools: any
  selectedSchool: any;
  grades: any;
  subjects: any;
  exams: any;
  selectedExam: any;
  selectedGrade: any;
  selectedSubject: any;
  // selectedQuestion: any;
  // questions: any;


  constructor(private _studentService: StudentService) { }

  ngOnChanges(changes) {
    if (_.get(changes, 'marks.currentValue')) {
      this.reload();
    }
  }

  returnResult() {
    let res;
    res = this.filterQuestion();
    this.selectResult.emit({
      marks: res, examName: this.selectedExam,
      selectedSchool: this.selectedSchool, selectedGrade: this.selectedGrade, selectedSubject: this.selectedSubject
    })
  }

  filterQuestion() {
    const temp = JSON.parse(this.marks);
    let res = _.filter(temp, { schoolName: this.selectedSchool, examName: this.selectedExam });
    for(let mark of res) {
      if (this.selectedGrade !== '全部') {
        mark.egs = _.filter(mark.egs, { gradeName: this.selectedGrade })
      }
      if (this.selectedSubject !== '全部') {
        mark.egs = _.filter(mark.egs, { subName: this.selectedSubject })
      }
      console.log("!!!!!!");
      console.dir(mark);
    }
    console.log(`marks after filter: `, this.marks);
    return res;
  }

  // getQuestions() {
  //   let res;
  //   if (!this.showQuestions) { return; }
  //   res = this.filterQuestion();
  //   res = _.reduce(_.map(res, 'summary'), (r, i) => {
  //     return r.concat(i);
  //   }, []);
  //   this.questions = _.keys(_.groupBy(_.map(res, 'questionName')));
  //   this.selectedQuestion = _.first(this.questions);
  //   return []
  // }

  reload() {
    let marks = JSON.parse(this.marks);
    this.schools = _.keys(_.groupBy(_.map(marks, 'schoolName')));
    this.selectedSchool = _.first(this.schools);
    let res;
    let egs = [];
    _.forEach(_.map(marks, 'egs'), (value)=>{
      egs = _.concat(egs, value);
    });
    res = _.keys(_.groupBy(_.map(egs, 'gradeName')));
    if (this.selectAll) {
      res = ['全部'].concat(res)
    }
    this.grades = res;
    this.selectedGrade = _.first(this.grades);

    res = _.keys(_.groupBy(_.map(egs, 'subName')));
    if (this.selectAll) {
      res = ['全部'].concat(res)
    }
    this.subjects = res;
    this.selectedSubject = _.first(this.subjects);
    this.exams = _.keys(_.groupBy(_.map(marks, 'examName')));
    this.selectedExam = _.first(this.exams);
    // this.getQuestions();
  }
}
