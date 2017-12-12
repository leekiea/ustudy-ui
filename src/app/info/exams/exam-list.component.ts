import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { SharedService } from '../../shared.service';
import { ExamService } from '../../exam/exam.service';
import { IntToDatePipe } from '../../utils/int-to-date.pipe';
import { DatePipe } from '@angular/common';

@Component({
  templateUrl: 'exam-list.component.html',
})

export class ExamListComponent implements OnInit {

  public searchForm = this.fb.group({
    examName: [''],
    grade: [''],
    subject: [''],
    startDate: [''],
    endDate: ['']
  });

  isFinished: boolean;

  selected: any;

  errorMessage: string;

  rows = [];

  temp = [];

  columns = [
    { prop: 'examName', name: '考试名称' },
    { prop: 'startDate', name: '开考时间' },
    { prop: 'grades', name: '考试年级' },
    { prop: 'subjects', name: '考试科目' },
    { prop: 'examineeNum', name: '考生人数' }
  ];

  IntToDate = new IntToDatePipe();
  examOptions: any;

  // filter keys:
  grade: any;
  subject: any;
  name = '';
  startDate: Date;
  endDate: Date;
  unfinishedExams: any;

  constructor(private _sharedService: SharedService, public fb: FormBuilder, private _examService: ExamService) { }

  ngOnInit(): void {
    this.reload();
    this._examService.filterExams(this.getFilterParams(false)).then((data: any) => {
      this.unfinishedExams = data
    });
    this._examService.getExamOptions().then((data) => {
      this.examOptions = data
    });
  }

  reload() {
    // req.open('GET', 'assets/api/teachers/teachers.json');

    this._examService.filterExams(this.getFilterParams(true)).then((data: any) => {
      // cache the list
      console.log('data: ' + JSON.stringify(data));
      for (const t of data) {
        // 科目
        if (t.subjects && t.subjects.length > 0) {
          let str = '';
          for (const s of t.subjects) {
            str += s.n + ' ';
          }
          t.subjects = str;
        } else {
          t.subjects = '';
        }
        // 年级
        if (t.grades && t.grades.length > 0) {
          let str = '';
          for (const g of t.grades) {
            str += g.n + ' ';
          }
          t.grades = str;
        } else {
          t.grades = '';
        }
      }
      this.temp = [...data];
      this.rows = data;
    }).catch((error: any) => {
      console.log(error.status);
      console.log(error.statusText);
    });
  }

  test1() {
    console.log(1)
  }

  private getFilterParams(finished): Object {
    const params = Object.create({});
    params.finished = finished;
    const datePipe = new DatePipe('en-US');
    if (this.grade) {
      params.gradeId = this.grade.id
    }
    if (this.subject) {
      params.subjectId = this.subject.id
    }
    if (this.startDate) {
      params.startDate = datePipe.transform(this.startDate, 'yyyy-MM-dd');
    }
    if (this.endDate) {
      params.endDate = datePipe.transform(this.endDate, 'yyyy-MM-dd');
    }
    if (this.name) {
      params.name = this.name
    }
    return params
  }
}
