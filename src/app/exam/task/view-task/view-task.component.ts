import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TaskService} from '../task.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-view-task',
  templateUrl: './view-task.component.html',
  styleUrls: ['./view-task.component.css']
})
export class ViewTaskComponent implements OnInit {
  examId: string;
  gradeId: string;
  subjectId: string;
  seted: boolean;

  markTasks: any;
  gradesubjects: any;
  subjects: any;
  exam: any;
  selectedSubject: any;
  questions: any;
  tasks: any[];
  grade: any;

  constructor(private _taskService: TaskService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    this.examId = this.route.snapshot.params.examId;
    this.gradeId = this.route.snapshot.params.gradeId;
    this.subjectId = this.route.snapshot.params.subjectId;
    this.seted = this.route.snapshot.params.seted;
    this.exam = this.route.snapshot.params.exam;
    this._taskService.getGrade(this.gradeId).then((data) => {
      this.grade = data
    });
    this._taskService.getMarkTasks(this.examId).then((data) => {
      this.markTasks = data;
      this._taskService.getExamSubjects(this.examId).then((data) => {
        const gradesubjects = data;
        this.gradesubjects = _.reduce(_.map(gradesubjects, 'subjects'), (res, i) => res.concat(i), [])
      })
    });
    this._taskService.getQuestions(this.examId, null, this.gradeId, this.subjectId).then((data) => {
      this.questions = data
    })
  }

  setFiltetedTasks() {
    this.tasks = _.filter(this.markTasks, {gradeId: this.selectedSubject.gradeId, subjectId: this.selectedSubject.id});
    this.tasks.forEach((task) => {
      task.question = _.find(this.questions, {id: task.questionId});
      task.group = _.find(this.grade.groups, (group) => _.includes(group.name, this.selectedSubject.subName))
    })
  }

  getTeachers(task: any) {
    return task.teachersIds.map( teacherId => _.find(this.grade.teachers, {id: teacherId}).name)
  }

  getGroupMember(group) {
    return _.filter(this.grade.teachers, {group: group.id})
  }

  setOwner(task: any, $event: any) {
    this._taskService.updateMarkTask({ownerId: $event.target.value}).then((res: any) => {
        if (res.success) {
          alert('任务：负责人更新成功')
        } else {
          alert('任务：负责人更新失败')
        }
      }
    )
  }
}