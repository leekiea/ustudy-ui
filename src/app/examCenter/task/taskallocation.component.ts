import { Component, OnInit, ElementRef }  from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { SharedService } from '../../shared.service';

@Component({
    templateUrl: 'taskallocation.component.html'
})

export class TaskAllocationComponent implements OnInit {

	errorMessage: string;

	examId: string;
	gradeId: string;
	subjectId: string;
	seted: boolean;	

	options = [2,3,4,5,6,7,8,9,10];

	subjects = [
		{id:0,name:'不分科'},
		{id:10,name:'历史'},
		{id:11,name:'政治'},
		{id:12,name:'地理'}
	];

	selectOptions = ['A','B','C','D','E','F','G','H','I','J'];

	objectives = [
		{id:1, start:1,end:20,type:1,option:4,score:1}
	];

	objectiveAnswers = [
		{no:1,type:1,option:4,options:[{name:'A',checked:true},{name:'B',checked:false},{name:'C',checked:false},{name:'D',checked:false}],answer:'A',subject:0},
		{no:2,type:1,option:4,options:[{name:'A',checked:true},{name:'B',checked:false},{name:'C',checked:false},{name:'D',checked:false}],answer:'A',subject:0},
		{no:3,type:1,option:4,options:[{name:'A',checked:true},{name:'B',checked:false},{name:'C',checked:false},{name:'D',checked:false}],answer:'A',subject:0},
		{no:4,type:1,option:4,options:[{name:'A',checked:true},{name:'B',checked:false},{name:'C',checked:false},{name:'D',checked:false}],answer:'A',subject:0},
		{no:5,type:1,option:4,options:[{name:'A',checked:true},{name:'B',checked:false},{name:'C',checked:false},{name:'D',checked:false}],answer:'A',subject:0},
		{no:6,type:1,option:4,options:[{name:'A',checked:true},{name:'B',checked:false},{name:'C',checked:false},{name:'D',checked:false}],answer:'A',subject:0},
		{no:7,type:1,option:4,options:[{name:'A',checked:true},{name:'B',checked:false},{name:'C',checked:false},{name:'D',checked:false}],answer:'A',subject:0},
		{no:8,type:1,option:4,options:[{name:'A',checked:true},{name:'B',checked:false},{name:'C',checked:false},{name:'D',checked:false}],answer:'A',subject:0},
		{no:9,type:1,option:4,options:[{name:'A',checked:true},{name:'B',checked:false},{name:'C',checked:false},{name:'D',checked:false}],answer:'A',subject:0},
		{no:10,type:1,option:4,options:[{name:'A',checked:true},{name:'B',checked:false},{name:'C',checked:false},{name:'D',checked:false}],answer:'A',subject:10},
		{no:11,type:1,option:4,options:[{name:'A',checked:true},{name:'B',checked:false},{name:'C',checked:false},{name:'D',checked:false}],answer:'A',subject:11},
		{no:12,type:1,option:4,options:[{name:'A',checked:true},{name:'B',checked:false},{name:'C',checked:false},{name:'D',checked:false}],answer:'A',subject:12},
		{no:13,type:1,option:4,options:[{name:'A',checked:true},{name:'B',checked:false},{name:'C',checked:false},{name:'D',checked:false}],answer:'A',subject:11},
		{no:14,type:1,option:4,options:[{name:'A',checked:true},{name:'B',checked:false},{name:'C',checked:false},{name:'D',checked:false}],answer:'A',subject:10},
		{no:15,type:1,option:4,options:[{name:'A',checked:true},{name:'B',checked:false},{name:'C',checked:false},{name:'D',checked:false}],answer:'A',subject:12},
		{no:16,type:1,option:4,options:[{name:'A',checked:true},{name:'B',checked:false},{name:'C',checked:false},{name:'D',checked:false}],answer:'A',subject:0},
		{no:17,type:1,option:4,options:[{name:'A',checked:true},{name:'B',checked:false},{name:'C',checked:false},{name:'D',checked:false}],answer:'A',subject:0},
		{no:18,type:1,option:4,options:[{name:'A',checked:true},{name:'B',checked:false},{name:'C',checked:false},{name:'D',checked:false}],answer:'A',subject:0},
		{no:19,type:1,option:4,options:[{name:'A',checked:true},{name:'B',checked:false},{name:'C',checked:false},{name:'D',checked:false}],answer:'A',subject:0},
		{no:20,type:1,option:4,options:[{name:'A',checked:true},{name:'B',checked:false},{name:'C',checked:false},{name:'D',checked:false}],answer:'A',subject:0}
	];

	radioScore = 20;
	checkboxScore = 0;
	judgmentScore = 0;
	objectiveScore = 20;

	constructor(private _sharedService: SharedService, public fb: FormBuilder, private elementRef: ElementRef, private route: ActivatedRoute, private router: Router) {

    }

    ngOnInit(): void {
		this.examId = this.route.snapshot.params.examId;
		this.gradeId = this.route.snapshot.params.gradeId;
		this.subjectId = this.route.snapshot.params.subjectId;
		this.seted = this.route.snapshot.params.seted;

		if(this.seted){
			this.reload(this.examId, this.gradeId, this.subjectId);
		}
	}
	
	reload(examId,gradeId,subjectId) {
		// //req.open('GET', 'assets/api/teachers/teachers.json');
		// this._sharedService.makeRequest('GET', 'assets/api/exams/exams.json', '').then((data: any) => {
		// 	//cache the list
		// 	console.log("data: " + JSON.stringify(data));
		// 	for(var t of data) {
		// 		//科目
		// 		if (t.subjects && t.subjects.length >0) {
		// 			var str = "";
		// 			for (var s of t.subjects) {
		// 				str += s.n + " ";
		// 			}
		// 			t.subjects = str;
		// 		} else {
		// 			t.subjects = "";
		// 		}	
		// 		//年级
		// 		if (t.grades && t.grades.length >0) {
		// 			var str = "";
		// 			for (var g of t.grades) {
		// 				str += g.n + " ";
		// 			}
		// 			t.grades = str;
		// 		} else {
		// 			t.grades = "";
		// 		}							
		// 	}
		// 	this.temp = [...data];
		// 	this.rows = data;
		// }).catch((error: any) => {
		// 	console.log(error.status);
		// 	console.log(error.statusText);
		// });
	}
	
	addOneRow(){
		if(this.objectives.length > 0){
			const obj = this.objectives[this.objectives.length-1];
			const obj_ = {id:new Date().getTime(), start:1,end:20,type:1,option:4,score:1};
			obj_['start'] = obj['end'] + 1;
			obj_['end'] = obj_['start'];
			this.objectives.push(obj_);
	
			this.addScore(obj_);
			this.addAnswers(obj_);
		}else{
			const obj = {id:1, start:1,end:20,type:1,option:4,score:1};
			this.objectives.push(obj);

			this.addScore(obj);
			this.addAnswers(obj);
		}		
	}

	addOption(objective){
		let optionCount = objective.option;
		let type = objective.type;
		let _option = [];

		if(type === 3){
			_option.push('Y');
			_option.push('N');
		}else{
			for(var i=0;i<optionCount;i++){
				_option.push(this.selectOptions[i]);
			}
		}
	}
	
	removeOneRow(id){
		const _objectives = [];
		for(var i=0;i<this.objectives.length;i++){
			const objective = this.objectives[i];
			if(objective && objective['id'] !== id){
				_objectives.push(objective);
			}else{
				this.removeAnswers(objective)
				this.removeScore(objective);
			}
		}
		this.objectives = _objectives;
	}
	
	addAnswers(objective){
		let start = objective['start'];
		let end = objective['end'];
		let type = objective['type'];
		
		let optionCount = objective.option;
		let _option = [];
		
		if(type === 3){
			_option.push({name:'Y',checked:true});
			_option.push({name:'N',checked:false});
		}else{
			for(var i=0;i<optionCount;i++){
				let checked = false;
				if(i === 0) checked = true;
				_option.push({name:this.selectOptions[i],checked:checked});
			}
		}

		for(var j=start;j<=end;j++){
			const answer = {no:j,type:objective.type,option:objective.option,options:_option,answer:'A',subject:0};
			if(type === 3){
				answer.answer = 'Y';
			}
			this.objectiveAnswers.push(answer);
		}

		this.objectiveAnswers.sort(function(a,b){
			return a.no - b.no;
		});
	}	

	removeAnswers(objective){
		const answers = [];
		
		let start = objective['start'];
		let end = objective['end'];
		let type = objective['type'];
		for(var j=0;j<this.objectiveAnswers.length;j++){
			const answer = this.objectiveAnswers[j];
			const no = answer['no'];
			if(!(no>=start && no<=end && answer['type'] === type)){
				answers.push(answer);
			}
		}
		this.objectiveAnswers = answers;
	}

	addScore(objective){
		let start = objective['start'];
		let end = objective['end'];
		let type = objective['type'];
		let score = objective['score'];
		let total = (end+1-start)*score;
		if(type === 1){
			this.radioScore = this.radioScore + total;
		}else if(type === 2){
			this.checkboxScore = this.checkboxScore + total;
		}else if(type === 3){
			this.judgmentScore = this.judgmentScore + total;
		}
		this.objectiveScore = this.objectiveScore + total;
	}

	removeScore(objective){
		let start = objective['start'];
		let end = objective['end'];
		let type = objective['type'];
		let score = objective['score'];
		let total = (end+1-start)*score;
		if(type === 1){
			this.radioScore = this.radioScore - total;
		}else if(type === 2){
			this.checkboxScore = this.checkboxScore - total;
		}else if(type === 3){
			this.judgmentScore = this.judgmentScore - total;
		}
		this.objectiveScore = this.objectiveScore - total;
	}

	onValueChange(valueType,id){

		const _objectives = [];
		for(var i=0;i<this.objectives.length;i++){
			const obj = this.objectives[i];
			if(obj && obj['id'] === id){
				let start = obj['start'];
				let end = obj['end'];
				let type = obj['type'];
				let score = obj['score'];

				this.removeScore(obj);
				this.removeAnswers(obj);

				if(valueType === 1){
					start = Number(this.elementRef.nativeElement.querySelector('#start_' + id).value);
					obj['start'] = start;					
				}else if(valueType === 2){
					end = Number(this.elementRef.nativeElement.querySelector('#end_' + id).value);
					obj['end'] = end;
				}else if(valueType === 3){
					type = Number(this.elementRef.nativeElement.querySelector('#type_' + id).value);
					obj['type'] = type;
					if(type === 1 || type === 2){
						obj['option'] = 4;
					}else if(type === 3){
						obj['option'] = 2;
					}
				}else if(valueType === 4){
					const option = Number(this.elementRef.nativeElement.querySelector('#option_' + id).value);
					obj['option'] = option;
				}else if(valueType === 5){
					score = Number(this.elementRef.nativeElement.querySelector('#score_' + id).value);
					obj['score'] = score;
				}

				this.addScore(obj);
				this.addAnswers(obj);
			}
			_objectives.push(obj);
		}
		this.objectives = _objectives;
	}

	setAnswersOption(id, type, value){
		this.objectiveAnswers.forEach(answer => {
			if(answer.no === id && answer.type === type){
				if(type === 2){
					let ans = answer.answer;
					if(ans.indexOf(value)>=0){
						ans = ans.replace(','+value,'');
						ans = ans.replace(value,'');
						if(ans.indexOf(',') === 0){
							ans = ans.substring(1);
						}
						answer.answer = ans;
					}else{
						answer.answer = ans + ',' + value;
					}
				}else{
					answer.answer = value;
				}
			}
		});
	}

	setAnswersSubject(id, type){
		let value = this.elementRef.nativeElement.querySelector('#answersSubject_' + id).value;
		this.objectiveAnswers.forEach(answer => {
			if(answer.no === id && answer.type === type){
				answer.subject = value;				
			}
		});
	}

	//-------------------------------Subjectives--------------------------------------

	subjectives = [
		{id:1, type:4,start:1,end:10,subject:0,score:2}
	];

	subjectiveCount = 10;
	subjectiveScore = 20;

	addOneSubjectiveRow(id) {
		if (this.subjectives.length > 0) {
			if (id > 0){
				this.subjectives.forEach(subjective => {
					if(subjective.id === id){
						let childs = subjective['child'];
						if(!childs){
							childs = [];
						}
						let child = {id:1,type:4,subject:10,score:1};
						child.id = childs.length + 1;
						child.type = subjective.type;
						child.subject = subjective.subject;
						childs.push(child);

						subjective['child'] = childs;
					}
				});
			} else {
				const obj = this.subjectives[this.subjectives.length-1];
				const obj_ = {id:new Date().getTime(), type:4, start:1, end:10, subject:0, score:2};
				if(obj['type'] === 4) obj_['start'] = obj['end'] + 1;
				else obj_['start'] = obj['start'] + 1;
				obj_['end'] = obj_['start'];
				this.subjectives.push(obj_);

				this.subjectiveCount = this.subjectiveCount + 1;
				this.subjectiveScore = this.subjectiveScore + 2;
			}

		}else{
			const obj = {id:1, type:4, start:1, end:10, subject:0, score:2};
			this.subjectives.push(obj);

			this.subjectiveCount = 10;
			this.subjectiveScore = 20;
		}
	}

	removeOneSubjectiveRow(id, childId) {
		const _subjectives = [];
		for (var i=0;i<this.subjectives.length;i++) {
			const subjective = this.subjectives[i];
			if (subjective && subjective['id'] !== id) {
				_subjectives.push(subjective);
			} else if(childId > 0) {
				let child = subjective['child'];
				const _child = [];
				child.forEach(element => {
					if(element.id !== childId){
						element.id = _child.length + 1;
						_child.push(element);
					}
				});
				subjective['child'] = _child;

				_subjectives.push(subjective);
			} else {
				this.subjectiveCount = this.subjectiveCount - 1;
				if (subjective.type === 4){
					this.subjectiveScore = this.subjectiveScore - (subjective.end - subjective.start + 1) * subjective.score;
				} else {
					this.subjectiveScore = this.subjectiveScore - subjective.score;
				}
			}
		}

		this.subjectives = _subjectives;
	}

	onSubjectiveValueChange(valueType, id, childId) {
		this.subjectives.forEach(subjective => {
			if (subjective.id === id) {
				if (childId > 0) {
					let childs = subjective['child'];
					childs.forEach(child => {
						if (child.id === childId) {
							let value = Number(this.elementRef.nativeElement.querySelector('#subjective_'+valueType + '_' + id +'_' + childId).value);
							child[valueType] = value;
						}
					});
				} else {
					
					let value = Number(this.elementRef.nativeElement.querySelector('#subjective_'+valueType+'_' + id).value);
					if (valueType === 'start') {
						if(subjective.type === 4){
							this.subjectiveCount = this.subjectiveCount + subjective.start - value;
							this.subjectiveScore = this.subjectiveScore + (subjective.start - value) * subjective.score
						}
					} else if (valueType === 'end') {
						this.subjectiveCount = this.subjectiveCount - subjective.start + value;
						this.subjectiveScore = this.subjectiveScore + (value - subjective.end ) * subjective.score
					} else if (valueType === 'type') {
						if(subjective.type === 4 || value === 4){
							if (subjective.type === 4) {
								this.subjectiveCount = this.subjectiveCount - subjective.end + subjective.start;
								this.subjectiveScore = this.subjectiveScore - (subjective.end - subjective.start) * subjective.score
							} else {
								this.subjectiveCount = this.subjectiveCount + subjective.end - subjective.start;
								this.subjectiveScore = this.subjectiveScore + (subjective.end - subjective.start) * subjective.score
							}
						}
					} else if (valueType === 'score') {
						debugger;
						if(subjective.type === 4){
							this.subjectiveScore = this.subjectiveScore + (subjective.end - subjective.start + 1) * (value - subjective.score)
						} else {
							this.subjectiveScore = this.subjectiveScore + value - subjective.score;
						}
					}
					
					subjective[valueType] = value;
				}
			}
		});
	}
}
