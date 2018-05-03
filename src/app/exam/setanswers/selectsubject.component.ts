import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import { SharedService } from '../../shared.service';

@Component({
  templateUrl: 'selectsubject.component.html'
})

export class SelectSubjectComponent implements OnInit {

  errorMessage: string;
  examId: string;
  type = 'answers';
  isCreated = false;
  exams = [];
  gradesubjects = [];
  public examSelected: boolean;

  constructor(private _sharedService: SharedService, public fb: FormBuilder, private elementRef: ElementRef,
              private route: ActivatedRoute, private router: Router) {
    router.events.subscribe((val) => {
      if ( val instanceof NavigationEnd) {
        this.type = this.route.snapshot.params.type;
      }
    });
  }

  ngOnInit(): void {
    this.type = this.route.snapshot.params.type;
    this.loadExams();
  }

  loadExams() {
    this._sharedService.makeRequest('GET', '/api/allexams', '').then((data: any) => {
      if (data.success) {
        for (let exam of data.data) {
          //only show the unfinished exams
          if (exam.status != '2') {
            this.exams.push(exam);
          }
        }
        this.exams = data.data;
        if(this.exams.length > 0) {
          this.examId = this.exams[0].id;
          this.loadExamSubjects(this.examId);
          this.examSelected = true;
        }
      }
    }).catch((error: any) => {
      console.error(error.status);
      console.error(error.statusText);
    });
  }

  loadExamSubjects(examId) {
    this._sharedService.makeRequest('GET', '/api/examsubjects/' + examId, '').then((data: any) => {
      if (data.success) {
        this.gradesubjects = data.data;
      }
    }).catch((error: any) => {
      console.error(error.status);
      console.error(error.statusText);
    });
  }

  getExam(evt) {
    const examId = evt.target.value;
    this.examId = examId;
    this.loadExamSubjects(examId);
    this.examSelected = true;
  }

  setAnswers(egsId, gradeId, subjectId) {
    this.router.navigate(['setanswers', { egsId: egsId, examId: this.examId, gradeId: gradeId, subjectId: subjectId }]);
  }

  setTasks(gradeId, subjectId, seted, subName) {
    // XXX: skip this step for now
    // if (this.isCreated) {
    //   this.router.navigate(['taskallocation', { examId: this.examId, gradeId: gradeId, subjectId: subjectId, seted: seted }]);
    // } else {
    //   this.router.navigate(['setobjectivesno', { examId: this.examId, gradeId: gradeId, subjectId: subjectId, seted: seted }]);
    // }
    this.router.navigate(['/taskassign', { examId: this.examId, gradeId: gradeId, subjectId: subjectId, seted: seted, subject: subName }]);
  }

  viewTasks(gradeId, subjectId, seted) {
    this.router.navigate(['/taskassign', { examId: this.examId, gradeId: gradeId, subjectId: subjectId, seted: seted }]);
  }
}
