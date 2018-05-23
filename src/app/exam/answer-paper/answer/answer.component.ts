import { Component, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AnswerService } from '../answer.service';
import * as _ from 'lodash';
import { TaskService } from '../../task/task.service';
import { SharedService } from '../../../shared.service';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';
import { BsModalService } from 'ngx-bootstrap';

@Component({
  selector: 'app-answer',
  templateUrl: './answer.component.html',
  styleUrls: ['./answer.component.css']
})
export class AnswerComponent implements OnInit {
  //from parent
  egsId: number;
  gradeId: number;
  subName: string;
  questionId: number;
  type: string;
  questionList: any;

  //data
  papers: any;
  grade: any;
  temp: any;

  //filter
  examCode: string;
  selectedQuestion: any;
  viewAnswerPaper = false;
  selectedClassName: string;

  modalRef: BsModalRef;

  answers: Array<any>;
  areas: Array<any>;
  selectedImgUrls: Array<string>;

  constructor(private route: ActivatedRoute, private _answerService: AnswerService, private _taskService: TaskService,
              public _sharedService: SharedService, private modalService: BsModalService) { }

  ngOnInit() {
    this.egsId = Number(this.route.snapshot.params.egsId);
    this.gradeId = Number(this.route.snapshot.params.gradeId);
    this.subName = this.route.snapshot.params.subName;
    this.questionId = Number(this.route.snapshot.params.questionId);
    if(this.route.snapshot.params.questionList){
      this.questionList = JSON.parse(this.route.snapshot.params.questionList);
    }
    this.type = this.route.snapshot.params.type;
    if (this.type === 'class') {
      this.viewAnswerPaper = Boolean(this.route.snapshot.params.viewAnswerPaper);
    }
    this.selectedQuestion = this.questionList[0];
    for(let question of this.questionList) {
      if (question.quesid === this.questionId) {
        this.selectedQuestion = question;
        break;
      }
    }
    Promise.all([
      this._taskService.getGrade(this.gradeId).then((data) => {
        this.grade = data;
        if (this.grade !=undefined) {
          this.grade.classes= _.orderBy(this.grade.classes,'id');
        }
      }),
      this._answerService.getPapers(this.type, this.selectedQuestion.quesid).then((data: any) => {
        this.papers = data;
        this.temp = [...data];
      })
    ]).then(() => this.returnResult())
  }

  onQuestionChange() {
    this.temp = this.papers = [];
    console.log(`question changed:`, JSON.stringify(this.selectedQuestion));
    Promise.all([
      this._answerService.getPapers(this.type, this.selectedQuestion.quesid).then((data: any) => {
        this.papers = data;
        this.temp = [...data];
      })
    ]).then(() => this.returnResult())
  }

  moveQuestion(step) {
    const index = _.findIndex(this.questionList, this.selectedQuestion), length = this.questionList.length;
    this.selectedQuestion = this.questionList[index + step];
    this.onQuestionChange();
  }

  getUrl(paper) {
    if (this.viewAnswerPaper) {
      return paper.fullPaper.split(';').map((url) => this._sharedService.getImgUrl(url, ''))
    } else {
      let result = [];
      result.push(this._sharedService.getImgUrl(paper.markAnsPaper, ''));
      return result;
    }
  }

  setProblemPapers() {
    let paperIds = '';
    for(let paper of this.papers) {
      if(paper.hasProblem) {
        paperIds = paperIds + ',' + paper.paperId;
      }
    }
    if(paperIds === '') {
      alert('请先勾选想标记为异常卷的答题卡！');
      return;
    } else {
      paperIds = paperIds.substring(1, paperIds.length);
    }
    this._answerService.setProblemPapers(paperIds).then(()=> {
      alert('异常卷标记成功！');
    }).catch((error: any) => {
      console.dir(error);
      alert('无法标记异常卷');
    });
  }

  viewPaper(template: TemplateRef<any>, paper: any) {
    this.selectedImgUrls = this.getUrl(paper);
    this.modalRef = this.modalService.show(template,  { class: 'gray modal-lg'});
  }

  returnResult() {
    let options = {
      clsName: '',
      examCode: ''
    };
    console.log(`selected class: ` + JSON.stringify(this.selectedClassName));
    if (this.selectedClassName) {
      options.clsName = this.selectedClassName
    }

    if(this.examCode) {
      options.examCode = this.examCode
    }
    // console.log(`paper list(before filter): `, JSON.stringify(this.papers));
    console.log(`options: `, JSON.stringify(options));
    // filter our data
    if (this.papers) {
      const temp = this.temp.filter(function(d) {
        return d.clsName.indexOf(options.clsName) !== -1
          && d.eeCode.indexOf(options.examCode) !== -1;
      });
      this.papers = temp;
    }
    console.log(`paper list: `, JSON.stringify(this.papers));
  }
}
