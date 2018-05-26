import { Injectable } from '@angular/core';
import { SharedService } from '../../shared.service';

@Injectable()
export class AnswerService {

  constructor(private _sharedService: SharedService) { }

  getEGS(examId, gradeId, subjectId) {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', `/api/examsubject/${examId}/${gradeId}/${subjectId}`,
        '').then((data: any) => {
          if (!data.data) {
            reject('no data');
          }
          resolve(data.data)
        })
    })
  }

  getAnswerPapers(params: any) {
    console.log(`getAnswerPapers: `, JSON.stringify(params));
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', `/api/answer/papers`, params).then((data: any) => {
        if (!data.data) {
          reject('no data');
        }
        resolve(data.data)
      })
    })
  }
  getPapers(type, questionId) {
    let typeUrl:string = type;
    if (type=='class') {
      typeUrl='NONE';
    }
    console.log(`getPapers: `, type, questionId);
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', `/exam/answersheet/papers/${questionId}/${typeUrl}`, '').then((data: any) => {
      //this._sharedService.makeRequest('GET', `assets/api/exams/papers.json`, '').then((data: any) => {
        if (!data.data) {
          reject('no data');
        }
        resolve(data.data)
      })
    })
  }
  setProblemPapers(paperIds) {
    console.log(`setProblemPapers: `, paperIds);
    let ids = {ids: paperIds};
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('POST', `/api/exam/exception/paper/update/1`, JSON.stringify(ids)).then((data: any) => {
        if (!data.success) {
          reject('failed to set problem papers!');
        }
        resolve();
      })
    })
  }
}
