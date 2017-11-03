import { Injectable } from '@angular/core';
import { SharedService } from "../../shared.service";

@Injectable()
export class TaskService {

  constructor(private _sharedService: SharedService) { }

  getExams() {
    return new Promise((resolve, reject) => {
      // XXX: should use /getExams/{examStatus}
      this._sharedService.makeRequest('GET', '/exam/getAllExams', '').then((data: any) => {
        if (!data.data) {
          reject('no data');
        }
        resolve(data.data)
      })
    })
  }

  getExam(examId) {
    return new Promise((resolve, reject) => {
      // XXX: should use /getExams/{examStatus}
      this._sharedService.makeRequest('GET', '/exam/getExam/' + examId, '').then((data: any) => {
        if (!data.data) {
          reject('no data');
        }
        resolve(data.data)
      })
    })
  }

  getQuestions(examId, schoolId, gradeId, subjectId) {
    return new Promise((resolve, reject) => {
      // XXX: should use exam/{examId}/questions
      this._sharedService.makeRequest('GET', 'assets/api/exams/questions.json', '').then((data: any) => {
        // if (!data.data) {
        //   reject('no data');
        // }
        // resolve(data.data)
        resolve(data)
      })
    })
  }

  getSchool(schoolId: number) {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', 'assets/api/schools/school.json', '').then((data: any) => {
        resolve(data.data)
      })
    })
  }

  getGrade(gradeId:any) {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', 'assets/api/schools/grade.json', '').then((data: any) => {
        // resolve(data.data)
        resolve(data)
      })
    })
  }

  updateMarkTask(json) {
    return new Promise((resolve, reject) => {
      console.log('update task:', JSON.stringify(json));
      resolve({success: true});
      // this._sharedService.makeRequest('POST', 'marktask/update/', '').then((data: any) => {
      // }
    })
  }

  creatMarkTask(json) {
    console.log('create task:', JSON.stringify(json));
    return new Promise((resolve, reject) => {
      resolve({success: true});
      // this._sharedService.makeRequest('POST', 'marktask/create/', JSON.stringify(json)).then((res) => {
      //   resolve(res)
      // })
    })
  }

  getMarkTasks(examId) {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', 'assets/api/exams/markTasks.json', '').then((data: any) => {
        // resolve(data.data)
        resolve(data)
      })
    })
  }

  getExamSubjects(examId): any {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', '/api/examsubject/getExamSubjects/' + examId, '').then((data: any) => {
        if (data.success) {
          resolve(data.data)
        }
      })
    })
  }
}