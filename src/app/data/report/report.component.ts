import { Component, OnInit } from '@angular/core';
import {DataService} from '../data.service';

@Component({
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  exams: any;
  selectedExam: any;
  selectedSchool: any;
  selectedGrade: any;
  selectedSubject: any;


  constructor(private _dataService: DataService) { }

  ngOnInit() {
    this._dataService.getExamList().then((data) => {
    	this.exams = data;
    	for (let exam of this.exams) {
    		for (let school of exam.schools) {
    			for (let grade of school.GradeDetails) {
    				grade.subList = this.prepareSubList(grade.subs);
    			}
    		}
    	}
    	console.dir(this.exams);
    }
    ).catch((error) => {
    	console.dir(error);
    }
    );
  }

  prepareSubList(subs: any) {
  	let list = [];
  	for (let k in subs) {
  		list.push({id: k, name: subs[k]});
  	}
  	console.log("list: " + JSON.stringify(list));
  	return list;
  }

  // selectedSubject.id is the egsId you can use.

  getSubScore() {

  }

  getBranchScore() {

  }

  getDetailScore() {

  }
}
