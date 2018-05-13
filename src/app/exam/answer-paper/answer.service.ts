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
  getPapers(egsId, questionId) {
    console.log(`getPapers: `, egsId, questionId);
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', `/api/${egsId}/${questionId}/papers`, '').then((data: any) => {
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
