import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import * as _ from 'lodash';
import {ExamService} from '../../exam/exam.service';

@Component({
  selector: 'app-questions-analysis',
  templateUrl: './questions-analysis.component.html',
  styleUrls: ['./questions-analysis.component.css']
})
export class QuestionsAnalysisComponent implements OnInit {
  tab: String = 'summary';
  private result: any;
  exams: Promise<any>;
  selectedExam: any;
  scores: any[];
  scoreDatas: any[];
  barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    scales: {
      yAxes: [{
        display: true,
        ticks: {
          beginAtZero: true,
        }
      }]
    },
  };
  filterResult: any;
  subjectResult: any;
  objectResult: any;

  constructor(private _dataService: DataService, private _examService: ExamService) { }

  ngOnInit() {
    const params = Object.create({});
    params.finished = false;
    this.exams = this._examService.filterExams({finished: false});
    this.exams = this._examService.anaExams({finished: false});
    this.exams.then((data) => {
      this.selectedExam = _.first(data);
      if (!this.selectedExam) {
        this.exams = this._examService.filterExams({finished: true});
        this.exams.then((data) => {
          this.selectedExam = _.first(data);
        })
      }
    });
  }

  selectResult(result) {
    // XXX: mock
    // this.result = result;
    // const counts = _.countBy(result.scores, Number);
    // setTimeout(() => {
    //   this.scores = _.keys(counts);
    //   this.scoreDatas = [{data: _.values(counts), label: '分数统计'}];
    // }, 500);

    this.filterResult = result;
    this.loadResult()
  }

  loadResult() {
    if (!this.filterResult) {
      return
    }
    if (this.tab === 'summary') {
      this._dataService.getAnaResults('', this.filterResult.subject.id, this.filterResult.class).then((data) => {
        this.result = data[0];
        setTimeout(() => {
          this.scores = _.keys(this.result.scoreplacement);
          this.scoreDatas = [{data: _.values(this.result.scoreplacement), label: '分数统计'}];
        }, 500);
      })
    }
    if (this.tab === 'subjective') {
      this._dataService.getAnaResults('subject', this.filterResult.subject.id, this.filterResult.class).then((data) => {
        this.subjectResult = data
      })
    }
    if (this.tab === 'objective') {
      this._dataService.getAnaResults('object', this.filterResult.subject.id, this.filterResult.class).then((data) => {
        this.objectResult = data
      })
    }
  }

  getHighestScore() {
    return _.max(_.map(this.result, 'score'))
  }

  getLowestScore() {
    return _.min(_.map(this.result, 'score'))
  }

  getAvg() {
    const scores = _.map(this.result, 'score');
    return _.sum(scores) / scores.length
  }

  getOptionsData(question: any) {
    return [{data: _.values(question.choices).map((c) => _.toNumber(c.slice(0, -1))), label: ''}]
  }

  getQuestionOptions(question: any) {
    return _.keys(question.choices)
  }

  distributionChartHovered($event: any) {
  }

  getOptionsColors(question: any) {
    // TODO: 正确答案
    const data = _.values(question.choices).map((c) => _.toNumber(c.slice(0, -1)));
    const max = _.max(data);
    return [{backgroundColor: data.map((d) => d === max ? '#229fd9' : 'grey')}]
  }
}
