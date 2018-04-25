import { Injectable } from '@angular/core';
import { SharedService } from '../shared.service';
declare var jQuery: any;

@Injectable()
export class DataService {

  constructor(private _sharedService: SharedService) { }

  getAnswers() {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', 'assets/api/exams/quesanswerlist.json', '').then((data: any) => {
        resolve(data)
      })
    })
  }

  getMarks() {
    return new Promise((resolve, reject) => {
      //this._sharedService.makeRequest('GET', 'assets/api/exams/marklist.json', '').then((data: any) => {
      this._sharedService.makeRequest('GET', '/exam/mark/progress/', '').then((data: any) => {
        for (const exam of data.data) {
          for (const egs of exam.egs) {
            let marked = 0;
            let total = 0;
            for (const metric of egs.metrics) {
              delete metric.quesid;
              if(metric.startno === metric.endno){
                metric.quesName = '' + metric.startno;
              } else {
                metric.quesName = metric.startno + '-' + metric.endno;
              }
              delete metric.startno;
              delete metric.endno;
              marked += metric.marked;
              total += metric.total;
              metric.progress = Math.floor(metric.marked/metric.total*100) + '%';
            }
            egs.progress = Math.floor(marked/total*100) + '%';
          }
        }
        resolve(data.data)
      })
    })
  }

  getTeachers(egsId) {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', `/exam/teacher/mark/progress/${egsId}`, '').then((data: any) => {
        resolve(data.data)
      })
    })
  }

  initSideBar(type: string) {
    const defaultMarkData = [
      {
        text: '阅卷进度统计',
        href: '#data/mark/markStatistics',
        tags: ['0']/*,
        nodes: [{
          text: '进度明细',
          href: '#data/mark/markDetails',
          tags: ['0']
        }]*/
      }/*, {
        text: '阅卷质量',
        href: '#data/mark/markQuality',
        tags: ['0']
      }, {
        text: '阅卷检索',
        href: '#data/mark/markSearch',
        tags: ['0']
      }*/
    ];
    
    const defaultResultData = [
      {
        text: '成绩统计',
        href: 'javascript:;',
        tags: ['1'],
        nodes: [{
          text: '考生成绩统计',
          href: 'javascript:;',
          tags: ['1'],
          state: {
            expanded: true
          },
          nodes: [{
            text: '考生成绩',
            href: '#data/result/examinees',
            tags: ['0']
          },{
            text: '班级成绩',
            href: '#data/result/classes',
            tags: ['0']
          }]
        }]
      }
    ];

    if(type === 'mark') {
      jQuery('#sidebar').treeview({
        levels: 2,
        enableLinks: true,
        showBorder: false,
        expandIcon: 'glyphicon glyphicon-menu-right',
        collapseIcon: 'glyphicon glyphicon-menu-down',
        color: '#333',
        backColor: 'transparent',
        data: defaultMarkData
      });
    } else if (type === 'result') {
      jQuery('#sidebar').treeview({
        levels: 2,
        enableLinks: true,
        showBorder: false,
        expandIcon: 'glyphicon glyphicon-menu-right',
        collapseIcon: 'glyphicon glyphicon-menu-down',
        color: '#333',
        backColor: 'transparent',
        data: defaultResultData
      });
    }
  }

  getStudentResultList(examId, params: {}) {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', `/api/score/students/subjects/${examId}`, params).then((data: any) => {
        if (data.success) {
          resolve(data.data)
        } else {
          reject()
        }
      })
    })
  }
  
  getClessResultList(examId, gradeId) {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', `/api/score/cls/${examId}/${gradeId}/`, '').then((data: any) => {
        if (data.success) {
          resolve(data.data)
        } else {
          reject()
        }
      })
    })
  }

  getExamineeDetails(examId: any, examineeId: any) {
    return new Promise((resolve, reject) => {
      this._sharedService.makeRequest('GET', `/api/score/student/scores/${examineeId}/${examId}`, '').then((data: any) => {
        if (data.success) {
          resolve(data.data)
        } else {
          reject()
        }
      })
    })
  }
}
