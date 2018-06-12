import { Component, OnInit, AfterViewInit, ViewChild, Renderer2}  from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MarkService } from './mark.service';
import { SharedService } from '../../shared.service';

declare var $: any;

@Component({
    templateUrl: 'mark.component.html'
})

export class MarkComponent implements OnInit {
	//Dom elements
	@ViewChild('questionSelector') questionSelector;
	@ViewChild('markContainer') markContainer;
	@ViewChild('rootContainer') rootContainer;
	@ViewChild('markPanel') markPanel;
	@ViewChild('markBarHeader') markBarHeader;
	@ViewChild('markBarBody') markBarBody;
	@ViewChild('cvs1') cvs1;
	@ViewChild('cvs2') cvs2;
	@ViewChild('cvs3') cvs3;

	//request content
	reqContent: any = {
		questions: [
	//		{"id": "001", "n": "1"}
		],
		"startSeq": -1,
		"endSeq": -1
	}

	// mark content
	mark: any = {
		progress: "0%",
		groups: [
			{
				papers: [

				]
			}
		]
	};

	// exam info
	egsId: string;

	// mark type
	markType: string;
	composable: boolean = true;

	// question selector
	questionList: any;
	markQuestions: any = [];
	progress: string;
	progressText: string;
	
	// score board
	curScore: number = 0;
	digits = [1,2,3,4,5,6,7,8,9,0];
	displayScoreBoard: boolean = true;
	fullScore: string = "0";
	scoreList = [];
	scoreUnit = "1";
	autoSubmit = false;
	focusQuestion = {
		questionName: "",
		stepName: ""
	}

	// page controller
	curPage: number = 1;
	pageCount: number = 0; 
	firstPageEnabled: string = "";
	prePageEnabled: string = "";
	nextPageEnabled: string = "";
	lastPageEnabled: string = "";
	totalPages: number = 0;

	// statistic
	statistics = [];

	// canvas
	editMode: string = "None";
	score: string = "";
	score2: string = "";
	score3: string = "";
	answer = {
		regions: [
			{
				id: 0,
				quesImg: null,
				ansImg: null,
				markImg: null,
				markImgData: null,
				markImgRecords: [],
				scale: 1,
				canvasH: 0,
				canvasY: 0,
				x: 0,
				y: 0,
				w: 0,
				h: 0
			}
		],
		questionName: "",
		answerType: "",
		isMarked: false
	};
	answer2 = {
		regions: [
			{
				id: 0,
				quesImg: null,
				ansImg: null,
				markImg: null,
				markImgData: null,
				markImgRecords: [],
				scale: 1,
				canvasH: 0,
				canvasY: 0,
				x: 0,
				y: 0,
				w: 0,
				h: 0
			}
		],
		questionName: "",
		answerType: "",
		isMarked: false
	};
	answer3 = {
		regions: [
			{
				id: 0,
				quesImg: null,
				ansImg: null,
				markImg: null,
				markImgData: null,
				markImgRecords: [],
				scale: 1,
				canvasH: 0,
				canvasY: 0,
				x: 0,
				y: 0,
				w: 0,
				h: 0
			}
		],
		questionName: "",
		answerType: "",
		isMarked: false
	};
	questionName = '';
	stepName = '';
	markCanvas2Display: string = 'none';
	markCanvas3Display: string = 'none';
	isHidden: boolean = false;
	isHidden2: boolean = true;
	isHidden3: boolean = true;

	index1: number = 1;
	index2: number = 2;
	index3: number = 3;

	inBounds = true;
	edge = {
		top: true,
		bottom: true,
		left: true,
		right: true
	};

	isFullScreen = false;

	busy: Promise<any>;

    constructor(private _sharedService: SharedService, private _markService: MarkService, private renderer: Renderer2, private route: ActivatedRoute, private router: Router) {

    }

	ngOnInit(): void {
		this.route.params.subscribe(params => {
			// flag of the first params load
			let summary = this.mark.summary;
			this.egsId = this.route.snapshot.params.egsId;
			this.markType = this.route.snapshot.params.markType;
			if(this.route.snapshot.params.composable === 'true') {
				this.composable = true;
			} else {
				this.composable = false;
			}
			console.log("composable:" + this.composable);
			this.questionName = JSON.parse(this.route.snapshot.params.question)[0].n;
			this.markQuestions = JSON.parse(this.route.snapshot.params.question);
			if (this.markType === "标准" && this.composable === true) {
				this.questionList = JSON.parse(this.route.snapshot.params.questionList);
			} else {
				this.questionList = JSON.parse(this.route.snapshot.params.question);
			}			
			if (summary !== undefined) {
				this.ngAfterViewInit();
			}
		});
	}

    ngAfterViewInit(): void {
		$(this.questionSelector.nativeElement).selectpicker({
			style: 'btn-link',
			width: 'fit',
			maxOptions: 3
		});
		$(this.questionSelector.nativeElement).selectpicker('val', JSON.parse(this.route.snapshot.params.question)[0].id);
		console.log("init mark questions:" + JSON.stringify(this.markQuestions));
		$(this.questionSelector.nativeElement).on('changed.bs.select', {t: this}, this.onQuestionChange);
		$("#mark-progress").hover(function(){
				console.log("mouse on");
				$(".progress-text").toggle();
			}, function(){
				$(".progress-text").toggle();
			}
		);

		this.reload();
	}

	onQuestionChange(event: any): void {
		var t = event.data.t;
		t.markQuestions = [];
		var questionIds = $(t.questionSelector.nativeElement).val();
		if (questionIds == null || questionIds.length === 0) {
			alert("请选择题号加载试卷！");
		}
		
		//this.questionName = questionIds[0];

		for(let questionId of questionIds) {
			for(let question of t.questionList) {
				if (question.id === questionId) {
					t.markQuestions.push(question);
					break;
				}
			}
		}

		this.questionName = t.markQuestions[0].n;
		
		// load marks data based on the mark questions.
		t.reload();
	}

	reload(): void {
		for(let markQuestion of this.markQuestions) {
			let question = {"id": ""};
			question.id = markQuestion.id;
			this.reqContent.questions.push(question);
		}

		this._sharedService.makeRequest('POST', '/exam/marktask/paper/view/', JSON.stringify(this.reqContent)).then((data: any) => {
		//this._sharedService.makeRequest('GET', 'assets/api/exams/singleMark.json', '').then((data: any) => {
			this.reqContent.questions = [];

			//cache the list
			console.log("data: " + JSON.stringify(data));
			this.mark = data;
			this.pageCount = this.mark.groups.length;
			if (this.pageCount <= 0) {
				$('#setCommentModal').style.display = '';
				return;
			}
			if (this.reqContent.startSeq === -1 && this.reqContent.endSeq === -1) {
				this.curPage = this.mark.groups[0].paperSeq;
				if(this.curPage === 1) {
					this.firstPageEnabled = "disabled";
					this.prePageEnabled = "disabled";
				} else {
					this.firstPageEnabled = "";
					this.prePageEnabled = "";
				}
			} else {
				this.reqContent.startSeq = -1;
				this.reqContent.endSeq = -1;
			}

			if (this.markQuestions.length == 1) {
				this.markCanvas2Display = 'none';
				this.markCanvas3Display = 'none';
				this.isHidden2 = true;
				this.isHidden3 = true;
			}
			if (this.markQuestions.length == 2) {
				this.markCanvas2Display = 'block';
				this.markCanvas3Display = 'none';
				this.isHidden2 = false;
				this.isHidden3 = true;
			}
			if (this.markQuestions.length == 3) {
				this.markCanvas2Display = 'block';
				this.markCanvas3Display = 'block';
				this.isHidden2 = false;
				this.isHidden3 = false;
			}
			this.totalPages = Number(this._markService.getTotal(data.progress));
			this.setStatistics(data.summary);

			this.updateCanvas();
			this.updateFullScore();
		}).catch((error: any) => {
			console.dir(error);
			alert("无法加载试卷");
		});
	}	

	updateCanvas(): void {
		// console.log("update canvas for page: " + this.curPage);
		this.clearAnswers();
		for (let group of this.mark.groups) {
			if (group.paperSeq === this.curPage) {
				this.answer.regions = group.papers[0].regions;
				this.answer.answerType = group.papers[0].answerType;
				this.answer.questionName = group.papers[0].questionName;
				this.answer.isMarked = group.papers[0].isMarked;
				let length = this.answer.regions.length;
				if (this.markQuestions.length >= 2) {
					length += group.papers[1].regions.length;
				}
				if (this.markQuestions.length == 3) {
					length += group.papers[2].regions.length;
				}
				let t = this;
				for (let region of this.answer.regions) {
					let interval = setInterval(function() {
						let w = 0;
						let h = 0;
						if (length > 1) {
							if(t.isMobile()) {
								w = Math.floor($(window).width());
							} else {
								w = Math.floor($(window).width()/length);
							}
							h = Math.floor(region.h*w/region.w);
						} else if (length == 1) {
							h = Math.floor($(window).height());
							w = Math.floor(region.w*h/region.h);
						}
						$('#id_' + region.id + '_' + region.x + '_' + region.y).width(w);
						$('#id_' + region.id + '_' + region.x + '_' + region.y).height(h);
                        clearInterval(interval);
                    }, 1);
				}
				if (this.markQuestions.length >= 2) {
					this.answer2.regions = group.papers[1].regions;
					this.answer2.answerType = group.papers[1].answerType;
					this.answer2.questionName = group.papers[1].questionName;
					this.answer2.isMarked = group.papers[1].isMarked;
					for (let region of this.answer2.regions) {
						let interval = setInterval(function() {
							let w = 0;
							if(t.isMobile()) {
								w = Math.floor($(window).width());
							} else {
								w = Math.floor($(window).width()/length);
							}	
							let h = Math.floor(region.h*w/region.w);
							$('#id_' + region.id + '_' + region.x + '_' + region.y).width(w);
							$('#id_' + region.id + '_' + region.x + '_' + region.y).height(h);
	                        clearInterval(interval);
	                    }, 1);
					}
				}
				if (this.markQuestions.length == 3) {
					this.answer3.regions = group.papers[2].regions;
					this.answer3.answerType = group.papers[2].answerType;
					this.answer3.questionName = group.papers[2].questionName;
					this.answer3.isMarked = group.papers[2].isMarked;
					for (let region of this.answer3.regions) {
						let interval = setInterval(function() {
							let w = 0;
							if(t.isMobile()) {
								w = Math.floor($(window).width());
							} else {
								w = Math.floor($(window).width()/length);
							}	
							let h = Math.floor(region.h*w/region.w);
							$('#id_' + region.id + '_' + region.x + '_' + region.y).width(w);
							$('#id_' + region.id + '_' + region.x + '_' + region.y).height(h);
	                        clearInterval(interval);
	                    }, 1);
					}
				}
				this.editMode = "" + this.curPage + Math.floor(new Date().getTime()/1000);
				break;
			}
		}
	}

	clearAnswers(): void {
		this.score  = "";
		this.score2 = "";
		this.score3 = "";

		this.answer.answerType = "";
		this.answer.isMarked = false;
		for(let region of this.answer.regions) {
				region.scale = 1;
				region.canvasH = 0;
				region.canvasY = 0;
		}
		this.answer2.answerType = "";
		this.answer2.isMarked = false;
		for(let region of this.answer2.regions) {
				region.scale = 1;
				region.canvasH = 0;
				region.canvasY = 0;
		}
		this.answer3.answerType = "";
		this.answer3.isMarked = false;
		for(let region of this.answer3.regions) {
				region.scale = 1;
				region.canvasH = 0;
				region.canvasY = 0;
		}
	}

	updateFullScore(): void {
		// console.log("before update full score: " + this.fullScore);

		for (let group of this.mark.groups) {
			if (group.paperSeq === this.curPage) {
				for(let paper of group.papers) {
					// is it possible that one paper is marked and others are not in one group?
					if (paper.isMarked === true) {
						// update the score board and questionName to prepare for re-mark
						this.fullScore = paper.fullscore;
						this.questionName = paper.questionName;
						// console.log("after update full score: " + this.fullScore);
						let qn = this.questionName;
						if(!this.isMobile()) {
							let interval = setInterval(function() {
								$('#id_' + qn).focus();
								clearInterval(interval);
							}, 1);
						}
						this.updateScoreBoard();
						return;
					}
					if (paper.problemPaper === true) {
						continue;
					}
					if (paper.steps.length === 0 && paper.score === "") {
						this.fullScore = paper.fullscore;
						this.questionName = paper.questionName;
						// console.log("after update full score: " + this.fullScore);
						let qn = this.questionName;
						if(!this.isMobile()) {
							let interval = setInterval(function() {
								$('#id_' + qn).focus();
								clearInterval(interval);
							}, 1);
						}
						this.updateScoreBoard();
						return;
					} else if (paper.steps.length > 0) {
						for(let step of paper.steps) {
							if (step.score === "") {
								this.fullScore = step.fullscore;
								this.questionName = paper.questionName;
								this.stepName = step.name;
								let qn = this.stepName;
								if(!this.isMobile()) {
									let interval = setInterval(function() {
										$('#id_' + qn).focus();
										clearInterval(interval);
									}, 1);
								}
			                    this.updateScoreBoard();
								return;
							} 
						}
					}
				}
			}
		}
		if(this.autoSubmit === true) {
			this.submit();
		}
		console.log("after update full score");
	}

	onFocus(questionName: string, stepName: string, fullScore: string): void {
		console.log("get focus!!! " + questionName + " " + stepName + " " + fullScore);
		this.editMode = "None";
		this.curScore = 0;
		this.questionName = questionName;
		if (stepName !== '') {
			this.focusQuestion.questionName = "";
			this.focusQuestion.stepName = stepName;
		} else {
			this.focusQuestion.questionName = questionName;
			this.focusQuestion.stepName = "";			
		}
		this.fullScore = fullScore;
		this.updateScoreBoard();
	}

	setDigit(digit) {
		let score = this.curScore = this.curScore*10 + Number(digit);
		for (let group of this.mark.groups) {
			if (group.paperSeq === this.curPage) {
				if (this.focusQuestion.questionName !== "" || this.focusQuestion.stepName !== "") {
					for(let paper of group.papers) {
						if (paper.problemPaper === true) {
							continue;
						}
						if (paper.steps.length === 0 && paper.questionName === this.focusQuestion.questionName) {
							paper.score = score;
							break;
						} else if (paper.steps.length > 0) {
							let matched = false;
							for(let step of paper.steps) {
								if (step.name === this.focusQuestion.stepName) {
									step.score = score;
									matched = true;
									break;
								} 
							}
							if (matched === true) break;
						}
					}
				} else {
					for(let paper of group.papers) {
						if (paper.problemPaper === true) {
							continue;
						}
						if (paper.steps.length === 0 && paper.score === "") {
							paper.score = score;
							this.focusQuestion.questionName = paper.questionName;
							this.focusQuestion.stepName = "";	
							break;
						} else if (paper.steps.length > 0) {
							let matched = false;
							for(let step of paper.steps) {
								if (step.score === "") {
									step.score = score;
									this.focusQuestion.questionName = "";
									this.focusQuestion.stepName = step.name;	
									matched = true;
									break;
								}
							}
							if (matched === true) break;
						}
					}
				}
				break;
			}
		}
	}

	scroll(questionName): void {
		let top = 0;
		if (this.markQuestions.length === 1) {
			return;
		} else if (this.markQuestions.length == 2) {
			if (this.answer2.questionName === questionName) {
				for (let region of this.answer.regions) {
					top += region.canvasH;
				}
			}
		} else if (this.markQuestions.length == 3) {
			if (this.answer2.questionName === questionName) {
				for (let region of this.answer.regions) {
					top += region.canvasH;
				}
			} else if (this.answer3.questionName === questionName) {
				for (let region of this.answer.regions) {
					top += region.canvasH;
				}
				for (let region of this.answer2.regions) {
					top += region.canvasH;
				}
			}
		}
		$(this.markPanel.nativeElement).scrollTop(top);
	}

	setScoreUnit(unit): void {
		this.scoreUnit = unit;
		this.updateScoreBoard();
	}

	updateScoreBoard(): void {
		if (this.composable === false) {
			return;
		}
		this.scoreList = [];
		var score = Number(this.fullScore);
		var unit = parseFloat(this.scoreUnit);
		for (var i=0; i<=score; i+=unit) {
			this.scoreList.push(i);
		}

		setTimeout(() => {
			let $header = $(this.markBarHeader.nativeElement);
			let $body = $(this.markBarBody.nativeElement);
			let $root = $(this.rootContainer.nativeElement);
			// 20px margin bottom for the header
        	$body.height($root.height() - $header.height() - 20);
			console.log("update score board - root:" + $root.height() + " header: " + $header.height() + " body: " + $body.height());
      	}, 100);
	}

	setFullScore(): void {
		if (this.composable === true) {
			this.setScore(this.fullScore);
		} else {
			this.curScore = 0;
			this.setDigit(this.fullScore);
		}
	}

	toNum(data) {
		return this._markService.toNum(data);
	}

	setZeroScore(): void {
		if (this.composable === true) {
			this.setScore("0");
		} else {
			this.curScore = 0;
			this.setDigit(0);
		}
	}

	setScore(score: string): void {
		// TODO: support problem paper in the future
		if (score === 'PROBLEM') {
			return;
		}
		console.log("get focus!!! " + this.focusQuestion.questionName + " " + this.focusQuestion.stepName);
		for (let group of this.mark.groups) {
			if (group.paperSeq === this.curPage) {
				if (this.focusQuestion.questionName !== "" || this.focusQuestion.stepName !== "") {
					for(let paper of group.papers) {
						if (paper.problemPaper === true) {
							continue;
						}
						if (paper.steps.length === 0 && paper.questionName === this.focusQuestion.questionName) {
							if (score !== 'PROBLEM') {
								paper.score = score;
							} else {
								paper.problemPaper = true;
							}
							this.updateFullScore();
							break;
						} else if (paper.steps.length > 0) {
							let matched = false;
							for(let step of paper.steps) {
								if (step.name === this.focusQuestion.stepName) {
									if (score !== 'PROBLEM') {
										step.score = score;
									} else {
										paper.problemPaper = true;
									}
									this.updateFullScore();
									matched = true;
									break;
								} 
							}
							if (matched === true) break;
						}
					}
				} else {
					for(let paper of group.papers) {
						if (paper.problemPaper === true) {
							continue;
						}
						if (paper.steps.length === 0 && paper.score === "") {
							if (score !== 'PROBLEM') {
								paper.score = score;
							} else {
								paper.problemPaper = true;
							}
							this.updateFullScore();
							break;
						} else if (paper.steps.length > 0) {
							let matched = false;
							for(let step of paper.steps) {
								if (step.score === "") {
									if (score !== 'PROBLEM') {
										step.score = score;
									} else {
										paper.problemPaper = true;
									}
									this.updateFullScore();
									matched = true;
									break;
								}
							}
							if (matched === true) break;
						}
					}
				}
				break;
			}
		}
		this.focusQuestion.questionName = "";
		this.focusQuestion.stepName = "";
	}

	// here the questionName can be either question name or step name. now only support question name for marking score.
	setScoreByQuestion(questionName: string, score: string): void {
		console.log("set score: questionName:" + questionName);
		for (let group of this.mark.groups) {
			if (group.paperSeq === this.curPage) {
				if (questionName !== '') {
					for(let paper of group.papers) {
						if (paper.problemPaper === true) {
							continue;
						}
						if (paper.steps.length === 0 && paper.questionName === questionName) {
							if (score !== 'PROBLEM') {
								paper.score = score;
							} else {
								paper.problemPaper = true;
							}
							break;
						} else if (paper.steps.length > 0) {
							let matched = false;
							for(let step of paper.steps) {
								if (step.name === questionName) {
									if (score !== 'PROBLEM') {
										step.score = score;
									} else {
										paper.problemPaper = true;
									}
									matched = true;
									break;
								} 
							}
							if (matched === true) break;
						}
					}
				}
				break;
			}
		}
	}

	firstPage(): void {
		this.curPage = 1;
		this.firstPageEnabled = "disabled";
		this.prePageEnabled = "disabled";
		if(this.curPage === this.totalPages) {
			this.nextPageEnabled = "disabled";
			this.lastPageEnabled = "disabled";
		} else {
			this.nextPageEnabled = "";
			this.lastPageEnabled = "";
		}

		this.editMode = "None";
		if (this.curPage < this.mark.groups[0].paperSeq) {
			this.reqContent.startSeq = 1;
			this.reqContent.endSeq = 20;
			this.reload();
		} else {
			this.updateCanvas();
			this.updateFullScore();
		}
	}

	previousPage(): void {
		this.editMode = "None";
		this.nextPageEnabled = "";
		this.lastPageEnabled = "";
		if (this.curPage === 2) {
			this.firstPageEnabled = "disabled";
			this.prePageEnabled = "disabled";			
		} else if (this.curPage <= 1) {
			return;
		}
		
		this.curPage--;

		if (this.curPage < this.mark.groups[0].paperSeq) {
			this.reqContent.startSeq = (this.curPage - 19 < 0 ? 1 : this.curPage - 19);
			this.reqContent.endSeq = this.curPage;
			this.reload();
		} else {
			this.updateCanvas();
			this.updateFullScore();
		}
	}

	nextPage(): void {
		this.editMode = "None";
		if (this.curPage === this.totalPages) {
			return;
		}
		this.curPage++;
		this.firstPageEnabled = "";
		this.prePageEnabled = "";
		if (this.curPage === this.totalPages) {
			this.nextPageEnabled = "disabled";
			this.lastPageEnabled = "disabled";								
		} else {
			this.nextPageEnabled = "";
			this.lastPageEnabled = "";					
		}
		if (this.curPage > this.mark.groups[this.pageCount - 1].paperSeq) {
			this.reqContent.startSeq = this.curPage;
			this.reqContent.endSeq = -1;
			this.reload();
		} else {
			this.updateCanvas();
			this.updateFullScore();
		}
	}

	lastPage(): void {
		this.editMode = "None";
		this.curPage = this.totalPages;
		this.firstPageEnabled = "";
		this.prePageEnabled = "";
		this.nextPageEnabled = "disabled";
		this.lastPageEnabled = "disabled";					
		if (this.curPage > this.mark.groups[this.pageCount - 1].paperSeq) {
			this.reqContent.startSeq = this.curPage;
			this.reqContent.endSeq = -1;
			this.reload();
		} else {
			this.updateCanvas();
			this.updateFullScore();
		}
	}

	setStatistics(data: any): void {
		this.statistics = data;
		let num = 0;
		let total = 0;
		for(let question of data) {
			num += Number(this._markService.getNum(question.progress));
			total += Number(this._markService.getTotal(question.progress));
		}
		this.progress = Math.floor(Number(num)/Number(total)*1000)/10 + '%';
		this.progressText = num + '/' + total;
	}

	validScore(value, max): boolean {
		if ( Number(value) > Number(max) || Number(value) < 0) {
			alert('给分不能小于零或者大于最大分值');
			return false;
		} 
		return true;
	}

	submit(): void {
		let message = "";
		for (let group of this.mark.groups) {
			if (group.paperSeq === this.curPage) {
				if (group.papers[0].score !== "") {
					this.score = group.papers[0].score;
					if (!this.validScore(this.score, group.papers[0].fullscore)) return;
				} else if (group.papers[0].steps.length > 0) {
					let scoreSum = 0;
					for (let step of group.papers[0].steps) {
						if (!this.validScore(step.score, step.fullscore)) return;
						scoreSum += parseFloat(step.score);
					}
					this.score = String(scoreSum);
				} else if (group.papers[0].problemPaper === false){
					alert("请完成打分再提交，谢谢！");
					return;
				}
				//message += group.papers[0].questionName + "题: " + this.score + ";";
				message += this.score;
				if (this.markQuestions.length >= 2) {
					if (group.papers[1].score !== "") {
						this.score2 = group.papers[1].score;
						if (!this.validScore(this.score2, group.papers[1].fullscore)) return;
					} else if (group.papers[1].steps.length > 0) {
						let scoreSum = 0;
						for (let step of group.papers[1].steps) {
							if (!this.validScore(step.score, step.fullscore)) return;
							scoreSum += parseFloat(step.score);
						}
						this.score2 = String(scoreSum);
					} else if (group.papers[1].problemPaper === false){
						alert("请完成打分再提交，谢谢！");
						return;
					}
					//message += group.papers[1].questionName + "题: " + this.score2 + ";";
					message += "; " + this.score2;
				}
				if (this.markQuestions.length == 3) {
					if (group.papers[2].score !== "") {
						this.score3 = group.papers[2].score;
						if (!this.validScore(this.score3, group.papers[2].fullscore)) return;
					} else if (group.papers[2].steps.length > 0) {
						let scoreSum = 0;
						for (let step of group.papers[2].steps) {
							if (!this.validScore(step.score, step.fullscore)) return;
							scoreSum += parseFloat(step.score);
						}
						this.score3 = String(scoreSum);
					} else if (group.papers[2].problemPaper === false){
						alert("请完成打分再提交，谢谢！");
						return;
					}
					//message += group.papers[2].questionName + "题: " + this.score3 + ";";
					message += "; " + this.score3;
				}
				this.showAlert(message, 2000);
			}
		}
		this.addScore();
	}

	updatePaper() {
		// console.log("update paper: " + this.markQuestions.length);
		// console.log("0: " + this.answer.regions[0].markImgData);
		// console.log("1: " + this.answer2.regions[0].markImgData);
		// console.log("2: " + this.answer3.regions[0].markImgData);
		if (this.answer.regions[0].markImgData === null ||
			(this.markQuestions.length >= 2 && this.answer2.regions[0].markImgData === null) ||
			(this.markQuestions.length === 3 && this.answer3.regions[0].markImgData === null)) {		
			return;
		}

		for (let group of this.mark.groups) {
			if (group.paperSeq === this.curPage) {
				// if(group.papers[0].isMarked === true) {
				// 	alert("试卷已阅，不能重复提交。");
				// 	return;
				// }
				if (group.papers.length >= 1) {
					group.papers[0].answerType = this.answer.answerType;
				}
				if (group.papers.length >= 2) {
					group.papers[1].answerType = this.answer2.answerType;				
				}
				if (group.papers.length === 3) {
					group.papers[2].answerType = this.answer3.answerType;				
				}
				for (let paper of group.papers) {
					paper.regions.forEach( (region, i) => {
						delete region.scale;
						delete region.canvasH;
						delete region.canvasY;
						region.ansMarkImg = "AM_" + paper.questionName + "_" + i + "_" + this.mark.teacherId + "_" + region.ansImg;
						region.markImg = "M_" + paper.questionName + "_" + i + "_" + this.mark.teacherId + "_" + region.ansImg;
						//region.markImg = region.ansImg.slice(0, -4) + "_M_" + this.mark.teacherId + region.ansImg.slice(-4);
					});
				}
				this.busy = this._sharedService.makeRequest('POST', `/exam/marktask/paper/update/${this.egsId}`, JSON.stringify(group));
				this.busy.then((data: any) => {
					let message = "";
					for (let group of this.mark.groups) {
						if (group.paperSeq === this.curPage) {
							for (let paper of group.papers) {
								paper.isMarked = true;
							}
						}
					}
					this.focusQuestion.questionName = '';
					this.focusQuestion.stepName = '';
					this.questionName = '';
					this.stepName = '';
					if (this.composable === false) {
						this.curScore = 0;
					}
					this.setStatistics(data);
					//alert("修改成功");
					this.nextPage();
				}).catch((error: any) => {
					this.focusQuestion.questionName = '';
					this.focusQuestion.stepName = '';
					console.log(error.status);
					console.log(error.statusText);
					if (error.status == 403) {
						alert("阅卷已暂停，请联系管理员。");
						this.router.navigate(['markList']);
					} else {
						alert("修改失败！");
					}					
				});
			}
		}
	}

    showAlert(text, time): void {
        var $body = $(document.body);
        //var tipTag = "<div class='tip'><span class='tipcontent' style='font-size:50px; position: fixed; top: " + top + "; left: " + left + ";'>" +text + "</span><div>";
        var $markPanel = $(this.markPanel.nativeElement);

        var top = $markPanel.offset().top + "px";
        var left= $markPanel.offset().left + "px";
        var width = $markPanel.width() + "px";
        var height = $markPanel.height() + "px";
        // console.log("bg top :" + top);
        // console.log("bg left :" + left);
        // console.log("bg width :" + width);
        // console.log("bg height :" + height);

		var bgTag = "<div class='background'></div>";

		var $bgTag = $(bgTag);

        $body.find(".background").remove();
        $body.append(bgTag);
        $bgTag = $body.find(".background");
        
        //tips时间序列标识
        var timeStr = new Date().getTime();

        $bgTag.attr("timeStr",timeStr);
        $bgTag.show().css({
            'background': 'gray',
            'position': 'fixed',
            'top': top,
            'left': left,
            'width': width,
            'height': height
        });
        if(time){
            $bgTag.fadeOut(time - 500,function(){
                if($bgTag.attr("timeStr")==timeStr){
                	console.log("remove: timestr-" + timeStr);
                    $bgTag.remove();
                }
            });
        }else{
            $bgTag.fadeOut(2000,function(){
                if($bgTag.attr("timeStr")==timeStr){
                    $bgTag.remove();
                }
            });
        }

        var tipTag = "<div class='tip'><span style='font-size:100px;'>" +text + "</span></div>";
        var $tipTag= $(tipTag);

        $body.find(".tip").remove();
        $body.append(tipTag);
        $tipTag = $body.find(".tip");

        console.log("tag height:" + $tipTag.height());
        console.log("tag width:" + $tipTag.width());
        top = (document.body.clientHeight - $tipTag.height())/3 + "px";
        left= (document.body.clientWidth - $tipTag.width())/2 + "px";

        $tipTag.attr("timeStr",timeStr);
        $tipTag.find('span').show().css({
            'color': 'red',
            'position': 'fixed',
            'top': top,
            'left': 0,
            'text-align': 'center',
            'width': document.body.clientWidth + 'px'
        });
        if(time){
            $tipTag.fadeOut(time,function(){
                if($tipTag.attr("timeStr")==timeStr){
                    $tipTag.remove();
                }
            });
        }else{
            $tipTag.fadeOut(3000,function(){
                if($tipTag.attr("timeStr")==timeStr){
                    $tipTag.remove();
                }
            });
        }
    };

	drawLine(): void {
		this.editMode = 'Line';
	}

	drawCircle(): void {
		this.editMode = 'Circle';
	}

	drawText(): void {
		this.editMode = 'Text';
	}

	addLike(): void {
		this.editMode = 'Like';
	}

	addHelp(): void {
		this.editMode = 'Help';
	}

	addBestAnswer(): void {
		this.editMode = "BestAnswer";
	}

	addFAQ(): void {
		this.editMode = "FAQ";
	}

	addQueerAnswer(): void {
		this.editMode = "QueerAnswer";
	}

	addMarkScore(): void {
		console.log(this.questionName);
		for (let group of this.mark.groups) {
			if (group.paperSeq === this.curPage) {
				if (this.questionName !== '') {
					for(let paper of group.papers) {
						if (paper.steps.length > 0 && paper.questionName === this.questionName) {
							return;
						}
					}
				}
				break;
			}
		}
		this.editMode = "MarkScore";
	}
	
	addScore(): void {
		this.editMode = "Score";
	}

	clear(): void {
		console.log("edit mode before clear:" + this.editMode);
		this.editMode = "Clear";
	}

	getNum(rawData): string {
		return this._markService.getNum(rawData);
	}

	getTotal(rawData): string {
		return this._markService.getTotal(rawData);
	}

	checkEdge(event) {
		this.edge = event;
	}

	closeMarkTipModal(type) {
		if (type == 1) { //yes: jump to next question
			$('#markTipModal').hide();
			//1. get mark list
			let marks: any;
			this._markService.getMarkList().then((data: any) => {
		      console.log('data: ' + JSON.stringify(data));
		      marks = data.sort(this._markService.sortQuesName);
			  //2. find the first unfinished mark question
			  let selectedMark: any;
		      for (let mark of marks) {
		      	if (this._markService.getProgress(mark.progress) !== '100%') {
		      		selectedMark = mark;
		      		break;
		      	}
		      }
		      if (selectedMark === undefined) {
		      	alert("恭喜你，您在本次考试阅卷任务已全部结束");
		      	this.router.navigate(['markList']);
		      }

				/*
				3. route to the question with the following info
					{
					 questionList: getQuestionList(mark.subject), 
					 markType: mark.markType, 
					 composable: mark.summary[0].composable, 
					 question: getQuestion(mark.summary[0].quesid, mark.summary[0].questionName), 
					 egsId: mark.egsId
					}
				*/
			  let questionList = this._markService.getQuestionList(selectedMark.subject, marks);
			  let markType = selectedMark.markType;
			  let composable = selectedMark.summary[0].composable;
			  let question = this._markService.getQuestion(selectedMark.summary[0].quesid, selectedMark.summary[0].questionName);
			  let egsId = selectedMark.egsId;
			  this.router.navigate(['mark', {questionList: questionList, markType: markType, composable: composable, question: question, egsId: egsId}]);  
		    }).catch((error: any) => {
		      console.log(error.status);
		      console.log(error.statusText);
		    });
		} else { //no: jump to mark list
			$('#markTipModal').hide();
			this.router.navigate(['markList']);
		}
	}

	isMobile(): boolean {
		if ($(window).width() <= 812) { //812 is the max width of iphone X
			return true;
		} else {
			return false;
		}
	}
}