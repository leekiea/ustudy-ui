import { Injectable } from '@angular/core';
import { SharedService } from '../shared.service';
import * as _ from 'lodash';

@Injectable()
export class ExamService {
  private examOptions: Promise<any>;

  constructor(private _sharedService: SharedService) {
    this.initexamOptions()
  }

  initexamOptions() {
    this.examOptions = new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', `/info/school/gsr/`, '').then((data: any) => {
        if (data.success) {
          resolve(data.data)
        } else {
          reject(data.success)
        }
      })
    })
  }

  filterExams(params) {
    return new Promise((resolve, reject) => {
      // XXX: should use /exams/{examStatus}
      this._sharedService.makeRequest('GET', '/api/exams', params).then((data: any) => {
        if (!data.data) {
          reject('no data');
        }
        resolve(data.data)
      })
    })
  }

  getAllExams() {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', '/api/allexams', '').then((data: any) => {
        if (!data.data) {
          reject('no data');
        }
        resolve(data.data)
      })
    })
  }

  anaExams(params) {
    return new Promise((resolve, reject) => {
      // XXX: should use /exams/{examStatus}
      this._sharedService.makeRequest('GET', '/exam/analysis/examlist/', params).then((data: any) => {

        if (!data.data) {
          reject('no data');
        }
        resolve(data.data)
      })
    })
  }

  filterExgr(params) {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', '/api/exam/exgr/', params).then((data: any) => {
        if (!data.data) {
          reject('no data');
        }
        resolve(data.data)
      })
    })
  }

  getExamOptions() {
    return this.examOptions
  }

  createOrUpdateExam(params, examId) {
    console.log('createExam: ', params);
    if (examId) {
      params.id = examId
    }
    return new Promise((resolve, reject) => {
      // resolve()
      this._sharedService.makeRequest('POST', `/api/info/exam/${examId ? 'update' : 'create'}/`, params).then((data: any) => {
        if (data.success) {
          resolve(data.data)
        } else {
          reject()
        }
      })
    })
  }

  deleteExam(examId) {
    return new Promise((resolve, reject) => {
      // resolve()
      this._sharedService.makeRequest('DELETE', `/api/info/exam/delete/${examId}/`, '').then((data: any) => {
        if (data.success) {
          resolve(data.data)
        } else {
          reject()
        }
      })
    })
  }

  filterExamSubjects(conditions): any {
    const urlParams = _.map(conditions, (v, k) => `${k}=${v}`).join('&');
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', `/api/examsubjects?${urlParams}`, '').then((data: any) => {
        if (data.success) {
          resolve(data.data)
        }
      })
    })
  }

  // getLastExamSubjects() {
  //   return new Promise((resolve, reject) => {
  //     this._sharedService.makeRequest('GET', `/api/last/examsubjects`, '').then((data: any) => {
  //       if (data.success) {
  //         resolve(data.data)
  //       } else {
  //         reject()
  //       }
  //     })
  //   })
  // }

  getTeacherExams() {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', `/exam/answersheet/summary`, '').then((data: any) => {
        if (data.success) {
          resolve(data.data)
        } else {
          reject()
        }
      })
    })
  }

  getExamDetails(examId) {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', `/api/exam/summary/${examId}`, '').then((data: any) => {
        if (data.success) {
          resolve(data.data)
        } else {
          reject()
        }
      })
    })
  }

  getExam(examId) {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', `/api/exam/${examId}`, '').then((data: any) => {
        if (data.success) {
          resolve(data.data)
        } else {
          reject()
        }
      })
    })
  }

  getExaminees(examId: any, gradeId: any, params: any) {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', `/api/info/examinee/${examId}/${gradeId}`, params).then((data: any) => {
        if (data.success) {
          resolve(data.data)
        } else {
          reject()
        }
      })
    })
  }

  getClasses(gradeId) {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', `/api/info/school/grade/${gradeId}/clslist/`, '').then((data: any) => {
        if (data.success) {
          resolve(data.data)
        } else {
          reject()
        }
      })
    })
  }

  addOrUpdateExaminee(params: any) {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('POST', `/api/info/examinee/update/`, params).then((data: any) => {
        if (data.success) {
          resolve(data.data)
        } else {
          reject()
        }
      })
    })
  }

  deleteExaminee(examineeId: any) {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('DELETE', `/api/info/examinee/delete/${examineeId}` + '/', '').then((data: any) => {
        if (data.success) {
          resolve(data.data)
        } else {
          reject()
        }
      })
    })
  }

  release(egsId, release) {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('POST', `/api/examsubject/status/${egsId}/${release}`, '').then((data: any) => {
        if (data.success) {
          resolve(data.data)
        } else {
          reject()
        }
      })
    })
  }

  publishMark(egsId) {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('POST', `/api/examsubject/papers/${egsId}`, '').then((data: any) => {
        if (data.success) {
          resolve(data.data)
        } else {
          reject()
        }
      })
    })
  }

  updateMarkSwitch(egsId, markSwitch) {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('POST', `/api/examsubject/markswitch/${egsId}/${markSwitch}`, '').then((data: any) => {
        if (data.success) {
          resolve(data.data)
        } else {
          reject()
        }
      })
    })
  }

  cancelPublish(examId: any) {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('POST', `/api/score/publish/${examId}/${false}`, '').then((data: any) => {
        if (data.success) {
          resolve(data.data)
        } else {
          reject()
        }
      })
    })
  }

  calScore(examId: any) {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('POST', `/api/score/publish/${examId}/${true}`, '').then((data: any) => {
        if (data.success) {
          resolve(data.data)
        } else {
          reject()
        }
      })
    })
  }

  getMissingExaminees(egsId, gradeId) {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', `/info/examinee/absent/${egsId}`, '').then((data: any) => {
        if (data.success) {
          resolve(data.data)
        } else {
          reject()
        }
      })
    })
  }

  getGrade(gradeId) {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', '/info/school/grade/' + gradeId, '').then((data: any) => {
        resolve(data)
      })
    })
  }

  getGradeSub() {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', '/info/school/gs/', '').then((data: any) => {
        if (data.success) {
          resolve(data.data);
        } else {
          reject();
        }
      })
    })    
  }

  getTeacherProps() {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', `/info/teacher/prop/`, '').then((data: any) => {
        if (data.success) {
          resolve(data.data)
        } else {
          reject()
        }
      })
    })
  }
}
