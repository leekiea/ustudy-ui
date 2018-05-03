import {ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {DataService} from '../../data.service';
import {ExamService} from '../../../exam/exam.service';
import { SharedService } from '../../../shared.service';
import { sprintf } from 'sprintf-js';
import * as _ from 'lodash';
import {ActivatedRoute} from '@angular/router';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';

@Component({
  selector: 'app-examinee-result',
  templateUrl: './examinee-result.component.html',
  styleUrls: ['./examinee-result.component.css']
})
export class ExamineeResultComponent implements OnInit {
  @ViewChild('examineeTable') table: any;
  tab = 'examinee';
  exams: Promise<any>;
  exgrs: Promise<any>;
  selectedExam: any;
  selectedExgr: any;
  selectedGrade: any;
  selectedSubject: any;
  selectedClass: any;
  results = [];
  text = '';
  selectedImgUrls: Array<string>;

  columns = [
    { prop: 'name', name: '姓名' },
  ];
  resultHdr: any;
  temp: any;
  subjectWidth: any;
  subjectWidth2: any;
  examOptions: any;
  selectedBranch = '全部';
  selectedExamineeDetails: any;
  examId: number;
  paperModalRef: BsModalRef;
  subjectDetailModalRef: BsModalRef;

  constructor(private _dataService: DataService, private _examService: ExamService, private route: ActivatedRoute,
              private modalService: BsModalService, private _sharedService: SharedService) { }

  ngOnInit() {
    this.examId = Number(this.route.snapshot.params.examId);
    this.exams = this._examService.getAllExams();

    this.exgrs = this._examService.filterExgr({});
    this._examService.getExamOptions().then((data) => {
      this.examOptions = data;
    });
    this.exams.then((data) => {
      if (this.examId) {
        this.selectedExam = _.find(data, {id: this.examId});
      }
      if (!this.selectedExam) {
        this.selectedExam = _.first(data);
        if (this.examId) {
          alert('考试未找到')
        }
      }
      this.reload()
    });
    this.exgrs.then((data) => {
      if (this.examId) {
        this.selectedExgr = _.find(data, {examId: this.examId});
      }
      if (!this.selectedExgr) {
        this.selectedExgr = _.first(data);
      }
    })
  }

  private reload() {
    const params = Object.create({});
    if (_.isObject(this.selectedGrade)) {
      params.gradeId = this.selectedGrade.id
    } else {
      this.selectedGrade = ''
    }
    if (_.isObject(this.selectedSubject)) {
      params.subjectId = this.selectedSubject.id
    } else {
      this.selectedSubject = ''
    }
    if (_.isObject(this.selectedClass)) {
      params.classId = this.selectedClass.id
    } else {
      this.selectedClass = ''
    }
    if (this.text) {
      params.text = this.text
    }
    if (this.selectedBranch !== '全部') {
      params.branch = this.selectedBranch
    }

    if (this.selectedExam === undefined) {return; } // no exam is finished.

    this._dataService.getStudentResultList(this.selectedExam.id, params).then((data: any) => {
      this.temp = [...data];
      this.results = data;
      this.resultHdr = data[0];
      if (!this.resultHdr) {
        this.subjectWidth = sprintf('%.2f%%', 100);
        this.subjectWidth2 = sprintf('%.2f%%', 50);
        return;
      }
      this.subjectWidth = sprintf('%.2f%%', 1 / (this.resultHdr.scores.length + 1) * 100);
      this.subjectWidth2 = sprintf('%.2f%%', 0.5 / (this.resultHdr.scores.length + 1) * 100);
    })
  }

  onClick(event, modal) {
    if (event.type === 'click') {
      this._dataService.getExamineeDetails(event.row.examId, event.row.exameeId).then((data: any) => {
        this.selectedExamineeDetails = data;
        data.examId = event.row.examId;
        modal.show()
      });
    }
  }

  parseObjectives(subject) {
    return _.map(_.filter(subject.objQuesScore, (obj) => obj.score > 0), 'quesno').join('、 ')
  }

  parseSubjectives(subject) {
    return _.map(subject.subQuesScore, (question: any) => `${question.quesno}题：${question.score}分`).join('; ')
  }

  viewPaper(template: TemplateRef<any>, url) {
    console.log(url);
    if (url && url !== 'NULL') {
      let imgs = url.split(';');
      let urls = [];
      for (let img of imgs) {
        urls.push(this._sharedService.getImgUrl(img, ''));
      }
      this.selectedImgUrls = urls;
      console.log(this.selectedImgUrls);
      this.paperModalRef = this.modalService.show(template, {class: 'gray modal-lg'});
    } else {
      return;
    }
  }

  viewSubjectDetail(template: TemplateRef<any>, subject) {
    this.selectedSubject = subject;
    this.subjectDetailModalRef = this.modalService.show(template, {class: 'gray modal-lg'});
  }
}
