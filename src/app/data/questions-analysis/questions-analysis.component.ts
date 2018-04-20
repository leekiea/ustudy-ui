import { Component, OnInit } from '@angular/core';
import { DataService } from "../data.service";
import * as _ from 'lodash';
import {ExamService} from "../../exam/exam.service";

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
          stepSize: 1
        }
      }]
    },
  };

  constructor(private _dataService: DataService, private _examService: ExamService) { }

  ngOnInit() {
    const params = Object.create({});
    params.finished = false;
    this.exams = this._examService.filterExams({finished: false});
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
    this.result = result;
    const counts = _.countBy(result.scores, Number);
    setTimeout(() => {
      this.scores = _.keys(counts);
      this.scoreDatas = [{data: _.values(counts), label: '分数统计'}];
    }, 500);
    // this._dataService.getAnswers().then((data) => {
    //   this.result = data
    // })
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
}
