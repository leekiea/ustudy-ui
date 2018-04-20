import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

@Component({
  selector: 'answer-filter',
  templateUrl: './answer-filter.component.html',
  styleUrls: ['./answer-filter.component.css']
})
export class AnswerFilterComponent implements OnChanges {
  @Input() selectedExam: any;
  @Output() selectResult = new EventEmitter();
  selectedGrade: any;
  selectedSubject: any;

  constructor() { }

  ngOnChanges(changes) {
  }

  returnResult() {
    const mockData = {
      total: 600,
      highest: 709,
      lowest: 250,
      average: 444,
      median: 451,
      passNum: 501,
      hardness: 0.45,
      discrimination: 0.6,
      sd: 3.7,
      scores: [650, 651, 450, 250]
    };
    this.selectResult.emit(mockData)
  }

  reload(exam: any) {
  }

}
