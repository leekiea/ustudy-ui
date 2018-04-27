import { Injectable } from '@angular/core';
import { SharedService } from '../../shared.service';

@Injectable()
export class MarkService {

  constructor(private _sharedService: SharedService) { }

  getProgress(rawData): string {
    let progress = '';
    let index = rawData.indexOf('/');
    let num = rawData.substring(0, index);
    let total = rawData.substring(index + 1);
    return Math.floor(Number(num)/Number(total)*100) + '%';
  }

  getNum(rawData): string {
    let index = rawData.indexOf('/');
    return rawData.substring(0, index);
  }

  getTotal(rawData): string {
    let index = rawData.indexOf('/');
    return rawData.substring(index + 1);
  }

  getMarkList() {
    return this._sharedService.makeRequest('GET', '/exam/marktask/list/', '');
  }

  sortQuesName(a, b) {
    let q1 = a.summary[0].questionName;
    let q2 = b.summary[0].questionName;
    if (q1 < q2) {
      return -1;
    } else { 
      return 1;
    }
  }

  getQuestion(questionId, questionName) {
    let questionList = [];
    let question = {'id': '', 'n': ''};
    question.id = questionId;
    question.n = questionName;
    questionList.push(question);
    return JSON.stringify(questionList);
  }

  getQuestionList(subject, marks) {
    let questionList = [];
    for (let mark of marks) {
      if (mark.markType === '标准' && mark.summary[0].composable === true && mark.subject === subject) {
        let question = { 'id': '', 'n': '' };
        question.id = mark.summary[0].quesid;
        question.n = mark.summary[0].questionName;
        questionList.push(question);
      }
    }
    return JSON.stringify(questionList);
  }

  toNum(data){
    return parseFloat(data);
  }

}