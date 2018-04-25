import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ExamService } from '../../../exam/exam.service';
import { sprintf } from 'sprintf-js';
import * as _ from 'lodash';
import {SharedService} from '../../../shared.service';

@Component({
  selector: 'app-unfinished-exam-details',
  templateUrl: './unfinished-exam-details.component.html',
  styleUrls: ['./unfinished-exam-details.component.css']
})
export class UnfinishedExamDetailsComponent implements OnInit {
  @ViewChild('examTable') table: any;
  @ViewChild('missingExaminees') table1: any;
  examId: any;
  subjects = [];
  temp = [];

  columns = [
    {prop: 'subjectName', name: '科目'},
    {name: '试卷'},
    {name: '答案'},
    {name: '答题卡'},
    {name: '模板制作'},
    {name: '客观题'},
    {name: '主观题'},
    {name: '任务分配'},
    {name: '阅卷'},
  ];
  selectedRow: any;

  constructor(private route: ActivatedRoute, private _examService: ExamService, private _sharedService: SharedService) {
  }

  ngOnInit() {
    if (!this._sharedService.checkPermAndRedirect('考试信息')) {
      return
    }
    this.examId = this.route.snapshot.params.examId;
    this.reload();
  }

  reload() {
    this._examService.getExamDetails(this.examId).then((data: any) => {
      for (const grade of data) {
        grade.subjects.forEach((subject) => {
          subject.gradeId = grade.gradeId;
          subject.gradeName = grade.gradeName;
        })
      }
      const subjects = _.concat.apply(this, _.map(data, 'subjects'));
      this.temp = [...subjects];
      this.subjects = subjects;
    })
  }

  getExamProgress(subject) {
    return sprintf('%.2f%%', subject.paperCount / subject.studentCount * 100)
  }

  toggleExpandGroup(group) {
    console.log('Toggled Expand Group!', group);
    this.table.groupHeader.toggleExpandGroup(group);
  }

  onDetailToggle(event) {
    console.log('Detail Toggled', event);
  }

  publish(row, publish) {
    this._examService.release(row.egsId, publish).then((data) => {
      alert(`${publish ? '发布成绩' : '取消发布'}成功`);
      row.status = publish ? '2' : '1';
      this.reload();
    })
  }

  publishMark(egsId) {
    this._examService.publishMark(egsId).then((data) => {
      alert('发布批注成功');
      this.reload();
    })
  }

  updateMarkSwitch(row, markSwitch) {
    this._examService.updateMarkSwitch(row.egsId, markSwitch).then((data) => {
      alert(`${markSwitch ? '启动阅卷' : '暂停阅卷'}成功`);
      row.markSwitch = markSwitch;
      this.reload();
    })
  }

  getAnswerPaperPercentage(row) {
    return Math.floor(row.paperCount / row.studentCount * 10000) / 100 + '%'
  }

  getMissingExaminees(row) {
    if (row.missingExaminees) {
      return
    }
    this._examService.getMissingExaminees(row.egsId, row.gradeId).then((data: any) => {
      this.temp = [...data.students];
      row.missingExaminees = data
    })
  }
}
