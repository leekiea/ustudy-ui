import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import * as _ from 'lodash';
import * as XLSX from 'xlsx';
import {ExamService} from '../../exam/exam.service';
import { SharedService } from '../../shared.service';

declare var jQuery: any;
type AOA = Array<Array<any>>;

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

  constructor(private _dataService: DataService, private _examService: ExamService, public _sharedService: SharedService) { }

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
        this.pages = _.range(1, Math.ceil(this.subjectResult.length / 20) + 1);
        this.currentPage = 1
      })
    }
    if (this.tab === 'objective') {
      this._dataService.getAnaResults('object', this.filterResult.subject.id, this.filterResult.class.id).then((data) => {
        this.objectResult = data;
        this.pages = _.range(1, Math.ceil(this.objectResult.length / 20) + 1);
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

  export() {
    if (this.tab === 'summary') {
      this.downloadSum(this.result);
    } else if (this.tab === 'objective') {
      this.downloadObj(this.objectResult);
    } else if (this.tab === 'subjective') {
      this.downloadSub(this.subjectResult);
    }
  }

  private downloadSum(data:any): void {
    let dataExp:AOA=[];
    dataExp[0]=new Array();
    dataExp[1]=new Array();

    /* 第一行 标题 */
    dataExp[0][0]='考生总数';
    dataExp[0][1]='最高分';
    dataExp[0][2]='最低分';
    dataExp[0][3]='平均分';
    dataExp[0][4]='总分';
    dataExp[0][5]='及格人数';
    dataExp[1][0]=data.exCount;
    dataExp[1][1]=data.maxScore;
    dataExp[1][2]=data.minScore;
    dataExp[1][3]=data.aveScore;
    dataExp[1][4]=data.fscore;
    dataExp[1][5]=data.passCount;

		/* generate worksheet */
		const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataExp);

		/* generate workbook and add the worksheet */
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, '概要');

		/* save to file */
    XLSX.writeFile(wb, this.selectedExam.examName + '_' + this.filterResult.grade.gradeName 
    + '_' + this.filterResult.class.name + '_试题分析概要.xlsx');
  }

  private downloadObj(data:any): void {

    if (!data || data.length <= 0) {
      return;
    }

    let dataExp:AOA=[];
    dataExp[0]=new Array();

    /* 第一行 标题 */
    dataExp[0][0]='题号';
    dataExp[0][1]='分值';
    dataExp[0][2]='平均分';
    dataExp[0][3]='标准答案';
    dataExp[0][4]='选项分布';

    for(let i=0; i<data.length; i++) {
      dataExp[i+1]=new Array();
      dataExp[i+1][0]=data[i].quesno;
      dataExp[i+1][1]=data[i].score;
      dataExp[i+1][2]=data[i].aveScore;
      dataExp[i+1][3]=data[i].refa;
      dataExp[i+1][4]=JSON.stringify(data[i].choices);
    }

		/* generate worksheet */
		const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataExp);

		/* generate workbook and add the worksheet */
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, '客观题');

		/* save to file */
    XLSX.writeFile(wb, this.selectedExam.examName + '_' + this.filterResult.grade.gradeName 
    + '_' + this.filterResult.class.name + '_试题分析客观题.xlsx');
  }

  private downloadSub(data:any): void {

    if (!data || data.length <= 0) {
      return;
    }

    let dataExp:AOA=[];
    dataExp[0]=new Array();

    /* 第一行 标题 */
    dataExp[0][0]='题号';
    dataExp[0][1]='分值';
    dataExp[0][2]='平均分';
    dataExp[0][3]='得分明细';

    for(let i=0; i<data.length; i++) {
      dataExp[i+1]=new Array();
      dataExp[i+1][0]=data[i].quesname;
      dataExp[i+1][1]=data[i].score;
      dataExp[i+1][2]=data[i].aveScore;
      dataExp[i+1][3]=JSON.stringify(data[i].details);
    }

		/* generate worksheet */
		const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataExp);

		/* generate workbook and add the worksheet */
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, '主观题');

		/* save to file */
    XLSX.writeFile(wb, this.selectedExam.examName + '_' + this.filterResult.grade.gradeName 
    + '_' + this.filterResult.class.name + '_试题分析主观题.xlsx');
  }
}

