import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import * as _ from 'lodash';
import {ExamService} from '../../exam/exam.service';

declare var jQuery: any;

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
  temp: any;
  barChartOptions: any = {
    animation : false,
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
  objBarChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true,
    animation : false,
    scales: {
      yAxes: [
        {
          id: 'y-axis-1',
          display: true,
          position: 'left',
          ticks: {
            min: 0,
            max: 100,
            stepSize: 20,
            callback: function(value, index, values) {
              return value + '%';
            }
          },
          scaleLabel: {
            display: true,
            labelString: '百分比',
            fontColor: '#546372'
          }
        }
      ]
    },
    tooltips: {
      custom: function(tooltip) {
        // Tooltip Element
        let tooltipEl = document.getElementById('chartjs-tooltip');

        // Create element on first render
        if (!tooltipEl) {
          tooltipEl = document.createElement('div');
          tooltipEl.id = 'chartjs-tooltip';
          tooltipEl.innerHTML = '<table></table>';
          document.body.appendChild(tooltipEl);
          jQuery(tooltipEl).css({'position': 'absolute'})
        }
        // Hide if no tooltip
        if (tooltip.opacity === 0) {
          tooltipEl.style.opacity = '0';
          return;
        }
        tooltipEl.style.opacity = '1';

// Set caret Position
        tooltipEl.classList.remove('above', 'below', 'no-transform');
        if (tooltip.yAlign) {
          tooltipEl.classList.add(tooltip.yAlign);
        } else {
          tooltipEl.classList.add('no-transform');
        }

        function getBody(bodyItem) {
          return bodyItem.lines;
        }

// Set Text
        if (tooltip.body) {
          const titleLines = tooltip.title || [];
          const bodyLines = tooltip.body.map(getBody);

          let innerHtml = '<thead>';
          let percentage;

          titleLines.forEach(function(title) {
            innerHtml += '<tr><th>' + title + '</th></tr>';
          });
          innerHtml += '</thead><tbody>';

          const index = tooltip.dataPoints[0].index;
          bodyLines.forEach(function(body, i) {
            const colors = tooltip.labelColors[i];
            let style = 'background:' + colors.backgroundColor;
            style += '; border-color:' + colors.borderColor;
            style += '; border-width: 2px';
            const span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
            if (_.isString(body[0])) {
              const res = body[0].split(' ');
              percentage = res[0];
            } else {
              percentage = body[0].labels[index];
            }
            innerHtml += '<tr><td>' + span + `${percentage }%` + '</td></tr>';
          });
          innerHtml += '</tbody>';

          const tableRoot = tooltipEl.querySelector('table');
          tableRoot.innerHTML = innerHtml;
        }

        const position = jQuery(this._chart.canvas).position();

// Display, position, and set styles for font
        tooltipEl.style.opacity = '1';
        tooltipEl.style.left = position.left + tooltip.caretX + 'px';
        tooltipEl.style.top = position.top + tooltip.caretY + 'px';
        tooltipEl.style.fontFamily = tooltip._bodyFontFamily;
        tooltipEl.style.fontSize = tooltip.bodyFontSize;
        tooltipEl.style.fontStyle = tooltip._bodyFontStyle;
        tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px';
      },
    }
  };
  pieChartOptions: any = {
    animation : false,
    responsive: true,
    tooltips: {
      custom: function(tooltip) {
        // Tooltip Element
        let tooltipEl = document.getElementById('chartjs-tooltip');

        // Create element on first render
        if (!tooltipEl) {
          tooltipEl = document.createElement('div');
          tooltipEl.id = 'chartjs-tooltip';
          tooltipEl.innerHTML = '<table></table>';
          document.body.appendChild(tooltipEl);
          jQuery(tooltipEl).css({'position': 'absolute'})
        }
        // Hide if no tooltip
        if (tooltip.opacity === 0) {
          tooltipEl.style.opacity = '0';
          return;
        }
        tooltipEl.style.opacity = '1';

// Set caret Position
        tooltipEl.classList.remove('above', 'below', 'no-transform');
        if (tooltip.yAlign) {
          tooltipEl.classList.add(tooltip.yAlign);
        } else {
          tooltipEl.classList.add('no-transform');
        }

        function getBody(bodyItem) {
          return bodyItem.lines;
        }

// Set Text
        if (tooltip.body) {
          const titleLines = tooltip.title || [];
          const bodyLines = tooltip.body.map(getBody);

          let innerHtml = '<thead>';
          let score;
          let num;

          titleLines.forEach(function(title) {
            innerHtml += '<tr><th>' + title + '</th></tr>';
          });
          innerHtml += '</thead><tbody>';

          const index = tooltip.dataPoints[0].index;
          bodyLines.forEach(function(body, i) {
            const colors = tooltip.labelColors[i];
            let style = 'background:' + colors.backgroundColor;
            style += '; border-color:' + colors.borderColor;
            style += '; border-width: 2px';
            const span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
            if (_.isString(body[0])) {
              const res = body[0].split(' ');
              score = res[0];
              num = res[1]
            } else {
              score = body[0].labels[index];
              num = body[0].datasets[0].data[index]
            }
            innerHtml += '<tr><td>' + span + `${score}分: ${num}人` + '</td></tr>';
          });
          innerHtml += '</tbody>';

          const tableRoot = tooltipEl.querySelector('table');
          tableRoot.innerHTML = innerHtml;
        }

        const position = jQuery(this._chart.canvas).position();

// Display, position, and set styles for font
        tooltipEl.style.opacity = '1';
        tooltipEl.style.left = position.left + tooltip.caretX + 'px';
        tooltipEl.style.top = position.top + tooltip.caretY + 'px';
        tooltipEl.style.fontFamily = tooltip._bodyFontFamily;
        tooltipEl.style.fontSize = tooltip.bodyFontSize;
        tooltipEl.style.fontStyle = tooltip._bodyFontStyle;
        tooltipEl.style.padding = tooltip.yPadding + 'px ' + tooltip.xPadding + 'px';
      },
    }
  };
  filterResult: any;
  subjectResult: any;
  objectResult: any;
  pages = [];
  currentPage = 1;

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
        this.exams.then((data1) => {
          this.selectedExam = _.first(data1);
        })
      }
    });
  }

  selectResult(result) {
    this.filterResult = result;
    this.loadResult()
  }

  loadResult() {
    const tooltipEl = document.getElementById('chartjs-tooltip');
    if (tooltipEl) {
      tooltipEl.style.opacity = '0';
    }
    if (!this.filterResult) {
      return
    }
    if (this.tab === 'summary') {
      this._dataService.getAnaResults('', this.filterResult.subject.id, this.filterResult.class.id).then((data) => {
        this.result = data[0];
        this.scoreDatas = [{data: _.values(this.result.scoreplacement), label: '人数'}];
        setTimeout(() => {
          this.scores = _.keys(this.result.scoreplacement).map((i) => String(Number(i)));
        }, 500);
      })
    }
    if (this.tab === 'subjective') {
      this._dataService.getAnaResults('subject', this.filterResult.subject.id, this.filterResult.class.id).then((data) => {
        this.subjectResult = data;
        this.pages = _.range(1, Math.ceil(this.subjectResult.length / 10) + 1);
        this.currentPage = 1
      })
    }
    if (this.tab === 'objective') {
      this._dataService.getAnaResults('object', this.filterResult.subject.id, this.filterResult.class.id).then((data) => {
        this.objectResult = data;
        this.pages = _.range(1, Math.ceil(this.objectResult.length / 10) + 1);
        this.currentPage = 1
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

  getOptionsColors(question: any) {
    const options = _.keys(question.choices);
    return [{backgroundColor: options.map((d) => d === question.refa ? '#04BE02' : 'grey')}]
  }

  getQuestionScoreLabels(question: any) {
    return _.keys(question.details)
  }

  getOptionsScoreDetails(question: any) {
    return _.values(question.details)
  }
}

