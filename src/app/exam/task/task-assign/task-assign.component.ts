import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { TaskService } from '../task.service';
import { ActivatedRoute, Router } from '@angular/router';
import { trigger, state, style, animate, transition } from '@angular/animations';
import * as _ from 'lodash';

declare var jQuery: any;

@Component({
  selector: 'app-task-assign',
  templateUrl: './task-assign.component.html',
  styleUrls: ['./task-assign.component.css'],
  animations: [
    trigger('flyInOut', [
      state('done', style({
        backgroundColor: 'white',
        transform: 'scale(1)'
      })),
      state('switching', style({
        backgroundColor: '#cfd8dc',
        transform: 'scale(0.9)'
      })),
      transition('switching => done', animate('300ms ease-in')),
      transition('done => switching', animate('300ms ease-out'))
    ])
  ]
})
export class TaskAssignComponent implements OnInit {
  examId: string;
  gradeId: string;
  subjectId: string;
  subject: string;
  questionId: string;
  questions: any;
  assignType = '平均';
  markMode = '单评';
  // teacherType = '全体';
  grade: any;
  selectedQuestion: any;
  selectedTeacherIds: any;
  selectedFinalTeacherIds = [];
  withTeachersIds = [];
  withFinalTeachersIds = [];
  timeLimit: Number;
  workingTeachersIds = [];
  finalTeachersWithoutIds = [];
  teachersWithoutIds = [];
  animationState = 'done';
  gradeTeachers = [];
  subjectTeachers = [];
  ownerId: any;
  scoreDiff = 5;

  constructor(private _taskService: TaskService, private route: ActivatedRoute, private router: Router, private _location: Location) { }

  ngOnInit() {
    this.examId = this.route.snapshot.params.examId;
    this.gradeId = this.route.snapshot.params.gradeId;
    this.subjectId = this.route.snapshot.params.subjectId;
    this.subject = this.route.snapshot.params.subject;
    this.questionId = this.route.snapshot.params.questionId;
    this._taskService.getTeachers().then((data: any) => {
      this.gradeTeachers = data;
      this.toggleGrade(null)
      // this._taskService.getNoWorkingTeachers(this.gradeId).then((data: any) => {
        // this.workingTeachersIds = _.reject(this.grade.teachers, (teacher) => _.includes(data, {teacid: teacher.id}));
        // this.updateWithoutTeachersIds();
        // this.updateFinalWithoutTeachersIds()
      // });
    });
    this._taskService.getQuestions(this.examId, null, this.gradeId, this.subjectId).then((data) => {
      if (this.questionId) {
        this.questions = _.filter(data, { id: Number(this.questionId) });
        this.selectedQuestion = this.questions[0]
      } else {
        this.questions = data
      }
      this._taskService.getMarkTasks(this.examId, this.gradeId, this .subjectId).then( (tasks: any) => {
        const ids = _.map(tasks, 'questionId');
        _.remove(this.questions, (q: any) => _.includes(ids, String(_.get(q, 'id'))) && q.id !== Number(this.questionId));
        if (_.isEmpty(this.questions)) {
          alert('没有设置问题或者所有问题已经设置阅卷任务，请设置问题，或者删除阅卷任务');
          this._location.back();
          return
        }
      })
    }).then(() => {
      if (this.questionId) {
        this._taskService.getTask(this.examId, this.gradeId, this.subjectId, this.questionId).then((data: any) => {
          if (_.includes(['平均', '动态'], data.type)) {
            this.assignType = data.type;
          }
          this.markMode = _.isEmpty(data.finalMarkTeachersIds) ? '单评' : '双评';
          this.withTeachersIds = data.teachersIds;
          this.selectedTeacherIds = _.clone(this.withTeachersIds);
          this.withFinalTeachersIds = data.finalMarkTeachersIds;
          this.timeLimit = Number(data.timeLimit);
          this.scoreDiff = Number(data.scorediff);
          this.ownerId = data.ownerId;
        })
      }
    });
  }

  onSelectedQuestion($event: Event) {

  }

  submit() {
    const method = this.questionId ? this._taskService.updateMarkTask : this._taskService.createMarkTask;
    method.call(this._taskService, {
      examId: this.examId, questionId: String(this.selectedQuestion.id), teachersIds: this.selectedTeacherIds, type: this.assignType,
      gradeId: this.gradeId, subjectId: this.subjectId,
      // XXX: owner
      // ownerId: _.get(_.find(this.grade.groups, (group) => _.includes(group.name, this.subject)), 'owner'),
      ownerId: this.ownerId,
      finalMarkTeachersIds: _.without(this.selectedFinalTeacherIds, this.selectedTeacherIds),
      timeLimit: this.timeLimit,
      markMode: this.markMode,
      scorediff: this.scoreDiff
    }).then((data) => {
      console.log(data);
      if (_.get(data, 'success')) {
        this.selectedQuestion.created = true;
        const index = _.findIndex(this.questions, this.selectedQuestion);
        if (index + 1 < this.questions.length) {
          this.selectedQuestion = this.questions[index + 1];
          jQuery('html,body').animate({ scrollTop: jQuery('#selectQuestion').offset().top }, 300);
          setTimeout(() => {
            this.animationState = 'switching';
            setTimeout(() => {
              this.animationState = 'done';
            }, 300);
          }, 300);
          // alert('题目设置成功，自动跳到题目：' + this.selectedQuestion.questionName);
        } else {
          alert('所有题目设置完成，可以点击完成返回');
        }
        console.log('done');
      } else {
        // warning
      }
    });
  }

  finish() {
    if (_.every(this.questions, { created: true })) {
      alert('科目任务分配完成');
      this._location.back()
    } else {
      alert('还有未完成科目')
    }
  }

  onTeachersSelect($event: any) {
    this.selectedTeacherIds = $event;
    console.log('selectedTeachers: ', this.selectedTeacherIds);
    this.updateFinalWithoutTeachersIds()
  }

  onSelectTeacherType(type: string) {
    // this.teacherType = type;
    this.updateWithoutTeachersIds();
    this.updateFinalWithoutTeachersIds()
  }

  toggleGrade(event) {
    this.subjectTeachers = this._taskService.toggleGrade(this.gradeTeachers, event)
  }

  updateWithoutTeachersIds() {
    // if (!this.teacherType) {
    //   return
    // }
    // if (this.teacherType === '全体') {
      // this.teachersWithoutIds = new Array;
      // return
    // }
    this.teachersWithoutIds = _.clone(this.workingTeachersIds);
  }

  updateFinalWithoutTeachersIds() {
    // if (!this.teacherType) {
    //   return
    // }
    // if (this.teacherType === '全体') {
    //   this.finalTeachersWithoutIds = [].concat(this.selectedTeacherIds);
    //   return
    // }
    this.finalTeachersWithoutIds = this.selectedTeacherIds.concat(this.workingTeachersIds)
  }

  test() {
    console.log(1)
  }

  setSelectedFinalTeacherIds($event) {
    this.selectedFinalTeacherIds = $event
  }
}
