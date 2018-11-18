import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Md5 } from 'ts-md5/dist/md5';
import * as _ from 'lodash';
import {Router} from '@angular/router';

enum GradeAccess {
  NONE,
  SELF_GRADE,
  ALL_GRADE
}

enum SubjectAccess {
  NONE,
  SELF_SUBJECT,
  ALL_SUBJECT
}

/*
This shared service provides common utilitis and constants to the whole project.
*/
@Injectable()
export class SharedService {

  public userName = '';
  public userRole = '';
  public orgId = '';

  //private baseUrl = 'http://ustudy-dev.oss-cn-beijing.aliyuncs.com/';
  private baseUrl = 'http://ustudy.oss-cn-beijing.aliyuncs.com/';
  private getUrl: Promise<string>;
  roles = ['校长', '年级主任', '学科组长', '备课组长', '班主任', '任课老师', '考务老师', '扫描账号', '主任', '教研员', '考务账号', '教研室扫描账号', '清道夫'];
  pages = [ '学校信息', '教师信息', '学生信息', '考试信息', '模板制作', '答卷扫描', '答案设置', '任务分配', '线上阅卷', '答题卷中心', '阅卷统计', '试题分析', '成绩统计', '报表下载',
    '修改密码', '阅-Message', '成绩导入', '报表参数设置', '答题卡制作', '编辑考号', '蘑菇云云盘', '在线客服', '异常卷处理'];
  // change the bei ke zu zhang's permission temporarily.
  perms = [
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],//学校信息
    [1, 1, 1, 0 /*1*/, 0, 0, 1, 0, 1, 1, 1, 0, 1],//教师信息
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],//学生信息
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1],//考试信息
    [1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],//模版制作
    [1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],//答卷扫描
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1],//答案设置
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1],//任务分配
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],//线上阅卷
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],//答题卷中心
    [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1],//阅卷统计
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],//试题分析
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],//成绩统计
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],//报表下载
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]//异常卷处理
  ];

  views = ['paper', 'analysis'];

  // each element in the array is for a user role;
  // [grade access, subject access]
  viewPerms = [
    [[2,2], [1,2], [2,1], [1,1], [1,1], [2,1], [2,2], [0,0], [2,2], [1,1], [2,2], [0,0], [2,2]],
    [[2,2], [1,2], [2,1], [1,1], [1,1], [1,1], [2,2], [0,0], [2,2], [1,1], [2,2], [0,0], [2,2]]
  ];

  constructor(private _http: Http, private router: Router) {
    this.getUrl = new Promise(function(resolve, reject) {
      const configXhr = new XMLHttpRequest();
      configXhr.open('GET', 'assets/config.json');
      configXhr.onload = () => {
        resolve(JSON.parse(configXhr.response).url);
      };
      configXhr.onerror = () => {
        console.log(`The request is rejected when getting configured URL. Status: ${configXhr.status} Text: ${configXhr.statusText}`);
        reject({
          status: configXhr.status,
          statusText: configXhr.statusText
        });
      };
      configXhr.send();
    })
  };

  checkPerm(page: string): boolean {
    const roleIndex = this.roles.indexOf(this.userRole);
    const pageIndex = this.pages.indexOf(page);
    if (roleIndex < 0 || pageIndex < 0) {
      return false
    }
    return this.perms[pageIndex][roleIndex] === 1
  }

  checkViewPerm(view: string) {
    const roleIndex = this.roles.indexOf(this.userRole);
    const viewIndex = this.views.indexOf(view);
    let access = {
      grade: 'NONE',
      subject: 'NONE'
    }
    if (roleIndex < 0 || viewIndex < 0) {
      return access;
    }

    let accesses = this.viewPerms[viewIndex][roleIndex];
    console.log(`true or false: `, GradeAccess[0] == 'NONE');
    access.grade = GradeAccess[accesses[0]];
    access.subject = SubjectAccess[accesses[1]];
    return access;
  }

  checkPermAndRedirect(page: string) {
    const res = this.checkPerm(page);
    if (!res) {
      this.router.navigate(['/welcome']);
    }
    return res
  }

  getImgUrl(paperImg: string, region: any): string {
    let url = '';
    if (region === '') {
      url = this.baseUrl + paperImg;
    } else {
      url = this.baseUrl + paperImg + '?x-oss-process=image/crop,';
      url += 'x_' + region.x + ',';
      url += 'y_' + region.y + ',';
      url += 'w_' + region.w + ',';
      url += 'h_' + region.h;
    }
    return url;
  }

  MD5(pw: string): any {
    return Md5.hashStr(pw);
  }

  /* Do a http request
  method: http method
  endpoint:
      - "/info/..." will send to server side
      - "assets/..." is for test
  content:
      - string: request data. the default req&res contentType is JSON
      - JSON: {"data": "", "reqContentType": "", "resContentType": ""}
      or object
  */
  makeRequest(method: string, endpoint: string, content: any) {
    return new Promise((resolve, reject) => {
      // parse the content
      const data = (content.data === undefined ? (typeof(content) === 'string' ? content : JSON.stringify(content)) : content.data);
      const reqContentType = (content.reqContentType === undefined ? 'application/json' : content.reqContentType);
      const resContentType = (content.resContentType === undefined ? 'application/json' : content.resContentType);

      // get the configured URL
      this.getUrl.then((url) => {
        if (endpoint.substring(0, 6) === 'assets') {
          url = ''
        }
        const xhr = new XMLHttpRequest();
        let params = '';
        if (method.toLowerCase() === 'get' && _.isObject(content)) {
          params = '?' + _.map(content, (v, k) => `${k}=${v}`).join('&')
        }
        xhr.open(method, `${url}${endpoint}${params}`);
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.response));
            } catch (e) {
              resolve({});
            }
          } else {
            console.log('error happens: ' + url);
            reject({
              status: xhr.status,
              statusText: xhr.statusText
            });
          }
        };
        xhr.onerror = () => {
          console.log('error happens: ' + url);
          reject({
            status: xhr.status,
            statusText: xhr.statusText
          });
        };
        xhr.withCredentials = true;
        if (method === 'POST') {
          xhr.setRequestHeader('Content-type', reqContentType);
          xhr.send(data);
        } else {
          xhr.send();
        }
      });
    });
  }
}
