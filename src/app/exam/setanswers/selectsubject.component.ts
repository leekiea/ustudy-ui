import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../../shared.service';

@Component({
  templateUrl: 'selectsubject.component.html'
})

export class SelectSubjectComponent implements OnInit {

  errorMessage: string;
  examId: string;
  type = 'answers';

  isCreated = false;

  exams = [
    { id: '1', examName: '铜川一中16-17学年上学期期末考试1' },
    { id: '2', examName: '铜川一中16-17学年上学期期末考试2' },
    { id: '3', examName: '铜川一中16-17学年上学期期末考试3' },
    { id: '4', examName: '铜川一中16-17学年上学期期末考试4' },
    { id: '5', examName: '铜川一中16-17学年上学期期末考试5' },
    { id: '6', examName: '铜川一中16-17学年上学期期末考试6' }
  ];

  gradesubjects = [
    {
      id: '10', grade: '高一', subjects: [
        { id: '1', subName: '语文', answerSeted: true },
        { id: '2', subName: '数学', answerSeted: false },
        { id: '3', subName: '英语', answerSeted: true },
        { id: '4', subName: '物理', answerSeted: false },
        { id: '5', subName: '化学', answerSeted: true },
        { id: '6', subName: '生物', answerSeted: false },
        { id: '7', subName: '政治', answerSeted: true },
        { id: '8', subName: '历史', answerSeted: false },
        { id: '9', subName: '地理', answerSeted: true }
      ]
    },
    {
      id: '11', grade: '高二', subjects: [
        { id: '1', subName: '语文', answerSeted: true },
        { id: '2', subName: '数学', answerSeted: false },
        { id: '3', subName: '英语', answerSeted: true },
        { id: '4', subName: '物理', answerSeted: false },
        { id: '5', subName: '化学', answerSeted: false },
        { id: '6', subName: '生物', answerSeted: false },
        { id: '7', subName: '政治', answerSeted: true },
        { id: '8', subName: '历史', answerSeted: false },
        { id: '9', subName: '地理', answerSeted: true },
        { id: '10', subName: '文综', answerSeted: false },
        { id: '11', subName: '理综', answerSeted: true }
      ]
    },
    {
      id: '12', grade: '高三', subjects: [
        { id: '1', subName: '语文', answerSeted: true },
        { id: '2', subName: '数学', answerSeted: false },
        { id: '3', subName: '英语', answerSeted: true },
        { id: '4', subName: '物理', answerSeted: false },
        { id: '5', subName: '化学', answerSeted: true },
        { id: '6', subName: '生物', answerSeted: false },
        { id: '7', subName: '政治', answerSeted: false },
        { id: '8', subName: '历史', answerSeted: false },
        { id: '9', subName: '地理', answerSeted: false },
        { id: '10', subName: '文综', answerSeted: true },
        { id: '11', subName: '理综', answerSeted: false }
      ]
    }
  ];
  private examSelected: boolean;

  constructor(private _sharedService: SharedService, public fb: FormBuilder, private elementRef: ElementRef, private route: ActivatedRoute, private router: Router) {

  }

  ngOnInit(): void {
    this.type = this.route.snapshot.params.type;
    this.loadExams();
  }

  loadExams() {
    this._sharedService.makeRequest('GET', '/api/exam/getExams/0', '').then((data: any) => {
      console.log("data: " + JSON.stringify(data));
      if (data.success) {
        this.exams = data.data;
      }
    }).catch((error: any) => {
      console.log(error.status);
      console.log(error.statusText);
    });
  }

  loadExamSubjects(examId) {
    this._sharedService.makeRequest('GET', '/api/examsubject/getExamSubjects/' + examId, '').then((data: any) => {
      console.log("data: " + JSON.stringify(data));
      if (data.success) {
        this.gradesubjects = data.data;
      }
    }).catch((error: any) => {
      console.log(error.status);
      console.log(error.statusText);
    });
  }

  getExam(evt) {
    const examId = evt.target.value;
    this.examId = examId;
    if (examId !== "0") {
      this.loadExamSubjects(examId);
      this.examSelected = true;
    } else {
      this.examSelected = false;
    }
  }

  setAnswers(gradeId, subjectId, seted) {
    this.router.navigate(['setanswers', { examId: this.examId, gradeId: gradeId, subjectId: subjectId, seted: seted }]);
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
}
