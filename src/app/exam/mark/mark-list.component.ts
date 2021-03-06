import { Component, OnInit } from '@angular/core';

import { SharedService } from '../../shared.service';
import { MarkService } from './mark.service';

@Component({
  templateUrl: 'mark-list.component.html'
})

export class MarkListComponent implements OnInit {

  marks: any;

  constructor(private _sharedService: SharedService, private _markService: MarkService) {

  }

  ngOnInit(): void {
    this.reload();
  }

  stringify(j) {
    return JSON.stringify(j);
  }

  reload(): void {
    //this._sharedService.makeRequest('GET', 'assets/api/exams/marklist.json', '').then((data: any) => {
    this._markService.getMarkList().then((data: any) => {
      //cache the list
      console.log('data: ' + JSON.stringify(data));
      this.marks = data.sort(this._markService.sortQuesName);
      let isFinished = true;
      for (let mark of this.marks) {
        if (this._markService.getProgress(mark.progress) !== '100%') {
          isFinished = false;
          break;
        }
      }
      if (isFinished === true) {
        alert("恭喜你，您在本次考试阅卷任务已全部结束");
      }
    }).catch((error: any) => {
      console.log(error.status);
      console.log(error.statusText);
    });
  }

  getProgress(rawData): string {
    return this._markService.getProgress(rawData);
  }

  getTotal(rawData): string {
    return this._markService.getTotal(rawData);
  }

  getQuestion(questionId, questionName): string {
    return this._markService.getQuestion(questionId, questionName);
  }

  getQuestionList(subject): string {
    return this._markService.getQuestionList(subject, this.marks);
  }
}
