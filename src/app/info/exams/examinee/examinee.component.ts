import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ExamService} from '../../../exam/exam.service';
import * as _ from 'lodash';
import {SharedService} from '../../../shared.service';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';
import { Subscription } from 'rxjs/Subscription';
import {AddExamineeBatchComponent} from '../../../utils/modals/add-examinee-batch/add-examinee-batch.component';

@Component({
  selector: 'app-examinee',
  templateUrl: './examinee.component.html',
  styleUrls: ['./examinee.component.css']
})
export class ExamineeComponent implements OnInit {
  @ViewChild('examineeTable') table: any;
  bsModalRef: BsModalRef;
  subscription: Subscription;
  examId: any;
  gradeId: any;
  text: string;
  selectedClass: any;

  grades: any;
  grade: any;

  temp = [];
  examinees = [];
  classes: any[];
  columns = [
    { prop: 'studentName', name: '考生' },
    { prop: 'examCode', name: '考号' },
    // { prop: 'className', name: '班级' },
    { name: '操作' },
  ];

  // for new examinee
  stuName: string;
  stuId: string;
  examCode: string;
  examineeClass: any;
  examineeId: any;
  examineeSubs = [];



  constructor(private route: ActivatedRoute, private _examService: ExamService, public fb: FormBuilder, private _sharedService: SharedService,
              private modalService: BsModalService) {
  }

  ngOnInit() {
    if (!this._sharedService.checkPermAndRedirect('考试信息')) {
      return
    }
    this.examId = this.route.snapshot.params.examId;
    this.gradeId = this.route.snapshot.params.gradeId;
    this.reload();
  }

  reload() {
    const params = Object.create({});
    if (this.text) {
      params.text = this.text
    }
    if (this.selectedClass) {
      params.classId = this.selectedClass.id
    }
    this._examService.getExaminees(this.examId, this.gradeId, params).then((data: any) => {
      const examinees = data;
      this.temp = [...examinees];
      this.examinees = examinees;
    });
    this._examService.getClasses(this.gradeId).then((data: any) => {
      this.classes = data;
    });
    this._examService.getGradeSub().then((data: any) => {
      this.grades = data;
      for(let grade of this.grades) {
        if (grade.id === Number(this.gradeId)) {
          this.grade = grade;
          break;
        }
      }
    });
  }

  addOrUpdateExaminee(modal) {
    if (!this.stuName || !this.examCode || !this.examineeClass || !this.examineeSubs) {
      alert('请输入必填内容');
      return
    }
    this._examService.addOrUpdateExaminee([{stuName: this.stuName, stuId: this.stuId, examCode: this.examCode, classId: this.examineeClass.id,
      examId: this.examId, gradeId: this.gradeId, subs: this.examineeSubs}]).then((data) => {
      alert(`${this.examineeId ? '更新' : '新建'}考生成功`);
      // if (this.examineeId) {
      //   const examinee = _.find(this.examinees, {studentId: this.examineeId});
      //   examinee.studentName = this.name;
      //   examinee.stuId = this.stuId;
      //   examinee.examCode = this.examCode;
      //   examinee.className = this.examineeClass.name;
      //   examinee.classId = this.examineeClass.id;
      //   examinee.subs = this.examineeSubs;
      // }
      this.reload();
      modal.hide()
    });
  }

  deleteExaminee(examinee) {
    this._examService.deleteExaminee(examinee.id).then((data) => {
      alert('删除考生成功');
      _.remove(this.examinees, examinee)
    });
  }

  editExaminee(modal, examinee) {
    this.stuName = examinee.stuName;
    this.examCode = examinee.examCode;
    this.examineeClass = _.find(this.classes, {id: examinee.classId});
    this.examineeId = examinee.studentId;
    this.examineeSubs = examinee.subs;
    modal.show()
  }

  addExamineeBatch() {
    this.subscription = this.modalService.onHide.subscribe((reason:string) => {
      console.log("modal is hidden!!");
      this.reload();
      this.unsubscribe();
    });
    this.bsModalRef = this.modalService.show(AddExamineeBatchComponent);
    this.bsModalRef.content.gradeId = this.gradeId;
    this.bsModalRef.content.examId = this.examId;
    this.bsModalRef.content.grade = this.grade;
  }

  trigger(subject) {
    console.log('subject: ' + JSON.stringify(subject));
    if (_.includes(this.examineeSubs, subject.id)) {
      this.examineeSubs = _.without(this.examineeSubs, subject.id)
    } else {
      this.examineeSubs.push(subject.id)
    }
    console.log('examinee subs: ', this.examineeSubs)
  }

  getClass(subject) {
    const selected =  _.includes(this.examineeSubs, subject.id);
    if (selected) {
      return 'btn-primary'
    } else {
      return 'btn-default'
    }
  }

  unsubscribe() {
    this.subscription.unsubscribe();
  }
}
