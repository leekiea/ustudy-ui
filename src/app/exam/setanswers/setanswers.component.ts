import { Component, OnInit, ElementRef } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../../shared.service';
import { forEach } from '@angular/router/src/utils/collection';

@Component({
  templateUrl: 'setanswers.component.html'
})

export class SetAnswersComponent implements OnInit {

  errorMessage: string;

  egsId: string;
  examId: string;
  gradeId: string;
  subjectId: string;
  seted: boolean;

  issynthesize = false;

  currentCheckBox = 2;

  options = [2, 3, 4, 5, 6, 7, 8, 9, 10];

  checkBoxScores = [];

  allsubjects = [];

  // subject answers displayed in the UI
  subjects = [
    { id: 0, name: '不分科' }
  ];

  selectOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  
  // object answers displayed in the UI
  objectives = [
    // {id:1, quesno:0, startno:1,endno:2,type:'单选题',choiceNum:4,score:1},
    // {id:2, quesno:0, startno:3,endno:4,type:'多选题',choiceNum:6,score:1},
    // {id:3, quesno:0, startno:5,endno:6,type:'判断题',choiceNum:2,score:1}
  ];

  // answers that will be submitted to server side
  objectiveAnswers = [];

  radioScore = 0;
  checkboxScore = 0;
  judgmentScore = 0;

  // object full score
  objectiveScore = 0;

  constructor(private _sharedService: SharedService, public fb: FormBuilder, private elementRef: ElementRef, private route: ActivatedRoute, private router: Router) {

  }

  ngOnInit(): void {
    this.egsId = this.route.snapshot.params.egsId;
    this.examId = this.route.snapshot.params.examId;
    this.gradeId = this.route.snapshot.params.gradeId;
    this.subjectId = this.route.snapshot.params.subjectId;

    this.loadAllSubjects();
    this.getQuesAnswers(this.egsId, this.examId, this.gradeId, this.subjectId);
  }

  resetOptions() {
    var objectiveAnswers_ = [];
    this.objectiveAnswers.forEach(objectiveAnswer => {
      const type = objectiveAnswer.type;
      if (type === '单选题' || type === '多选题' || type === '判断题') {
        var options = [];
        const answer = objectiveAnswer.answer;
        if (type === '单选题') {
          for (var i = 0; i < objectiveAnswer.choiceNum; i++) {
            let checked = false;
            if (answer === this.selectOptions[i]) checked = true;
            options.push({ name: this.selectOptions[i], checked: checked });
          }
        } else if (type === '多选题') {
          for (var i = 0; i < objectiveAnswer.choiceNum; i++) {
            let checked = false;
            if (answer.indexOf(this.selectOptions[i]) >= 0) checked = true;
            options.push({ name: this.selectOptions[i], checked: checked });
          }
        } else if (type === '判断题') {
          if (answer === 'Y') {
            options.push({ name: 'Y', checked: true });
            options.push({ name: 'N', checked: false });
          } else {
            options.push({ name: 'Y', checked: false });
            options.push({ name: 'N', checked: true });
          }
        }
        objectiveAnswer.options = options;
        objectiveAnswers_.push(objectiveAnswer);
      }
    });
    this.objectiveAnswers = objectiveAnswers_;
  }

  resetDatas() {

    //this.objectiveAnswers = [];

    this.radioScore = 0;
    this.checkboxScore = 0;
    this.judgmentScore = 0;
    this.objectiveScore = 0;

    const objectives_ = [];
    this.objectives.forEach(objective => {
      if (objective.startno === 0 && objective.endno === 0) {
        objective.startno = objective.quesno;
        objective.endno = objective.quesno;
      }
      this.addAnswers(objective);
      // TODO: revise multiselect questions
      this.setDefaultCheckBoxScore(objective);
      objectives_.push(objective);
    });
    this.objectives = objectives_;

    var subjectives_ = [];
    this.subjectives.forEach(subjective => {
      if (subjective.type !== '填空题') {
        if (subjective.quesno !== 0) {
          subjective.startno = subjective.quesno;
          subjective.endno = subjective.quesno;
          subjectives_.push(subjective);
        } else {
          if (subjective.startno !== 0) {
            if (subjective.endno === 0) {
              subjective.endno = subjective.startno;
              subjective.quesno = subjective.startno;
              subjectives_.push(subjective);
            } else {
              // TODO: why doing this?
              const start = subjective.startno;
              const end = subjective.endno;
              for (var i = start; i <= end; i++) {
                var obj = '{"id":' + new Date().getTime() + ',"type":"' + subjective.type + '","startno":' + i + ',"endno":' + i + ',"quesno":' + i + ',"branch":' + subjective.branch + ',"score":' + subjective.score + '}';
                subjectives_.push(JSON.parse(obj));
              }
            }
          } else if (subjective.endno !== 0) {
            subjective.startno = subjective.endno;
            subjective.quesno = subjective.endno;
            subjectives_.push(subjective);
          }
        }
      } else {
        // TODO: how does this happen?
        if (subjective.startno === 0 || subjective.endno === 0) {
          subjective.startno = subjective.quesno;
          subjective.endno = subjective.quesno;
        }
        subjectives_.push(subjective);
      }
    });

    this.subjectives = subjectives_;
    this.setSubjectivesScore();
  }

  loadAllSubjects() {
    this._sharedService.makeRequest('GET', '/api/subjects', '').then((data: any) => {
      if (data.success) {
        this.allsubjects = data.data;
        this.allsubjects.forEach(subject => {
          if (Number(this.subjectId) === subject.id) {
            if (subject.type === '1' || subject.type === '2') {
              this.issynthesize = true;
              this.allsubjects.forEach(subject_ => {
                if (subject.type === '1' && subject_.type === '3') {
                  this.subjects.push(subject_);
                } else if (subject.type === '2' && subject_.type === '4') {
                  this.subjects.push(subject_);
                }
              })
            }
          }
        });
      }
    }).catch((error: any) => {
      console.log(error.status);
      console.log(error.statusText);
    });
  }

  getQuesAnswers(egsId, examId, gradeId, subjectId) {
    this._sharedService.makeRequest('GET', '/api/setanswers/answers/' + egsId, '').then((data: any) => {
      if (data.success) {
        data = data.data;
        const quesAnswers = data.quesAnswers;

        this.objectives = [];
        this.subjectives = [];
        quesAnswers.forEach(quesAnswer => {
          let type = quesAnswer['type'];
          if (type === '单选题' || type === '多选题' || type === '判断题') {
            this.objectives.push(quesAnswer);
          } else {
            this.subjectives.push(quesAnswer);
          }
        });

        this.objectiveAnswers = data.refAnswers;
        // TODO: revise the multiselect checkboxes
        this.checkBoxScores = data.checkBoxScores;

        this.resetDatas();
        this.resetOptions();
      }
    }).catch((error: any) => {
      console.log(error.status);
      console.log(error.statusText);
    });
  }

  addOneRow() {
    if (this.objectives.length > 0) {
      const obj = this.objectives[this.objectives.length - 1];
      const obj_ = { id: 0 - new Date().getTime(), quesno: 0, startno: 1, endno: 10, type: '单选题', choiceNum: 4, score: 1, branch: '不分科' };
      obj_['startno'] = obj['endno'] + 1;
      obj_['endno'] = obj_['startno'];
      this.objectives.push(obj_);

      this.addAnswers(obj_);
    } else {
      const obj = { id: 0 - new Date().getTime(), quesno: 0, startno: 1, endno: 10, type: '单选题', choiceNum: 4, score: 1, branch: '不分科' };
      this.objectives.push(obj);

      this.addAnswers(obj);
    }
  }

  removeOneRow(id) {
    const _objectives = [];
    for (let i = 0; i < this.objectives.length; i++) {
      const objective = this.objectives[i];
      if (objective && objective['id'] !== id) {
        _objectives.push(objective);
      } else {
        this.removeAnswers(objective);
        this.removeScore(objective);
      }
    }
    this.objectives = _objectives;
  }

  // prepare objective answers based on data returned from server side
  addAnswers(objective) {

    let type = objective['type'];
    if (type === '单选题' || type === '多选题' || type === '判断题') {

      let start = objective['startno'];
      if (start === 0) {
        start = objective['quesno'];
      }
      let end = objective['endno'];
      if (end === 0) {
        end = objective['quesno'];
      }
      let score = objective['score'];

      let totalScore = (end - start + 1) * score;
      this.objectiveScore = this.objectiveScore + totalScore;

      let choiceNum = objective.choiceNum;
      let _option = [];

      if (type === '判断题') {
        _option.push({ name: 'Y', checked: false });
        _option.push({ name: 'N', checked: false });
      } else {
        for (let i = 0; i < choiceNum; i++) {
          let checked = false;
          _option.push({ name: this.selectOptions[i], checked: checked });
        }
      }

      for (let j = start; j <= end; j++) {
        var answersSeted = false;
        this.objectiveAnswers.forEach(objectiveAnswer => {
          if (objectiveAnswer.quesno === j) {
            answersSeted = true;
          }
        });

        if (!answersSeted) {
          const answer = { quesno: j, type: objective.type, choiceNum: objective.choiceNum, options: _option, answer: '', branch: objective.branch };
          this.objectiveAnswers.push(answer);
        }
      }

      if (type === '单选题') {
        this.radioScore = this.radioScore + totalScore;
      } else if (type === '多选题') {
        this.checkboxScore = this.checkboxScore + totalScore;
      } else if (type === '判断题') {
        this.judgmentScore = this.judgmentScore + totalScore;
      }

      this.objectiveAnswers.sort(function(a, b) {
        return a.quesno - b.quesno;
      });
    }
  }

  removeAnswers(objective) {
    const answers = [];

    let start = objective['startno'];
    let end = objective['endno'];
    let type = objective['type'];
    for (let j = 0; j < this.objectiveAnswers.length; j++) {
      const answer = this.objectiveAnswers[j];
      const quesno = answer['quesno'];
      //TODO: if startno != endno, the quesno is always 0.
      if (!(quesno >= start && quesno <= end && answer['type'] === type)) {
        answers.push(answer);
      }
    }
    this.objectiveAnswers = answers;
  }

  removeScore(objective) {
    let start = objective['startno'];
    let end = objective['endno'];
    let type = objective['type'];
    let score = objective['score'];
    let total = (end + 1 - start) * score;
    if (type === '单选题') {
      this.radioScore = this.radioScore - total;
    } else if (type === '多选题') {
      this.checkboxScore = this.checkboxScore - total;
    } else if (type === '判断题') {
      this.judgmentScore = this.judgmentScore - total;
    }
    this.objectiveScore = this.objectiveScore - total;
  }

  startValueChange(oldStart, newStart, type, score) {
    let total = (oldStart - newStart) * score;
    if (type === '单选题') {
      this.radioScore = this.radioScore + total;
    } else if (type === '多选题') {
      this.checkboxScore = this.checkboxScore + total;
    } else if (type === '判断题') {
      this.judgmentScore = this.judgmentScore + total;
    }
    this.objectiveScore = this.objectiveScore + total;
    if (oldStart > newStart) {
      let choiceNum = 4;
      let _option = [];

      if (type === '判断题') {
        _option.push({ name: 'Y', checked: false });
        _option.push({ name: 'N', checked: false });
      } else {
        for (var i = 0; i < choiceNum; i++) {
          let checked = false;
          //if (i === 0) checked = true;
          _option.push({ name: this.selectOptions[i], checked: checked });
        }
      }

      for (let j = newStart; j < oldStart; j++) {
        let answersSeted = false;
        this.objectiveAnswers.forEach(objectiveAnswer => {
          if (objectiveAnswer.quesno === j) {
            answersSeted = true;
          }
        });

        if (!answersSeted) {
          const answer = { quesno: j, type: type, choiceNum: choiceNum, options: _option, answer: '', branch: '不分科' };
          // if (type === '判断题') {
          //   answer.answer = 'Y';
          // }
          this.objectiveAnswers.push(answer);
        }
      }
    } else if (oldStart < newStart) {
      const answers = [];

      this.objectiveAnswers.forEach(answer => {
        const quesno = answer['quesno'];
        if (!(quesno >= oldStart && quesno < newStart && answer['type'] === type)) {
          answers.push(answer);
        }

      });
      this.objectiveAnswers = answers;
    }
  }

  endValueChange(oldEnd, newEnd, type, score) {
    let total = (newEnd - oldEnd) * score;
    if (type === '单选题') {
      this.radioScore = this.radioScore + total;
    } else if (type === '多选题') {
      this.checkboxScore = this.checkboxScore + total;
    } else if (type === '判断题') {
      this.judgmentScore = this.judgmentScore + total;
    }
    this.objectiveScore = this.objectiveScore + total;
    if (oldEnd < newEnd) {
      let choiceNum = 4;
      let _option = [];

      if (type === '判断题') {
        _option.push({ name: 'Y', checked: false });
        _option.push({ name: 'N', checked: false });
      } else {
        for (var i = 0; i < choiceNum; i++) {
          let checked = false;
          //if (i === 0) checked = true;
          _option.push({ name: this.selectOptions[i], checked: checked });
        }
      }

      for (var j = oldEnd + 1; j <= newEnd; j++) {
        var answersSeted = false;
        this.objectiveAnswers.forEach(objectiveAnswer => {
          if (objectiveAnswer.quesno === j) {
            answersSeted = true;
          }
        });

        if (!answersSeted) {
          const answer = { quesno: j, type: type, choiceNum: choiceNum, options: _option, answer: '', branch: '不分科' };
          // if (type === '判断题') {
          //   answer.answer = 'Y';
          // }
          this.objectiveAnswers.push(answer);
        }
      }
    } else if (oldEnd > newEnd) {
      const answers = [];

      this.objectiveAnswers.forEach(answer => {
        const quesno = answer['quesno'];
        if (!(quesno > newEnd && quesno <= oldEnd && answer['type'] === type)) {
          answers.push(answer);
        }

      });
      this.objectiveAnswers = answers;
    }
  }

  typeValueChange(start, end, type) {
    let choiceNum = 4;
    let _option = [];

    if (type === '判断题') {
      choiceNum = 2;
      _option.push({ name: 'Y', checked: false });
      _option.push({ name: 'N', checked: false });
    } else {
      for (var i = 0; i < choiceNum; i++) {
        let checked = false;
        //if (i === 0) checked = true;
        _option.push({ name: this.selectOptions[i], checked: checked });
      }
    }

    const answers = [];
    this.objectiveAnswers.forEach(objectiveAnswer => {
      // var answer = objectiveAnswer;
      for (var j = start; j <= end; j++) {
        if (objectiveAnswer.quesno === j) {
          objectiveAnswer['options'] = _option;
          objectiveAnswer['type'] = type;
          objectiveAnswer['choiceNum'] = choiceNum;
          objectiveAnswer['answer'] = '';
          // if (type === '判断题') {
          //   objectiveAnswer['answer'] = 'Y';
          // } else {
          //   objectiveAnswer['answer'] = 'A';
          // }
        }
      }
      answers.push(objectiveAnswer);
    });

    this.objectiveAnswers = answers;
  }

  choiceNumValueChange(start, end, type, choiceNum) {

    if (type !== '判断题') {
      let _option = [];
      for (var i = 0; i < choiceNum; i++) {
        let checked = false;
        //if (i === 0) checked = true;
        _option.push({ name: this.selectOptions[i], checked: checked });
      }
      const answers = [];
      this.objectiveAnswers.forEach(objectiveAnswer => {
        // var answer = objectiveAnswer;
        for (var j = start; j <= end; j++) {
          if (objectiveAnswer.quesno === j) {
            objectiveAnswer['options'] = _option;
            objectiveAnswer['answer'] = '';
          }
        }
        answers.push(objectiveAnswer);
      });

      this.objectiveAnswers = answers;
    }
  }

  scoreValueChange(start, end, type, oldScore, newScore) {
    let total = (end - start + 1) * (newScore - oldScore);
    if (type === '单选题') {
      this.radioScore = this.radioScore + total;
    } else if (type === '多选题') {
      this.checkboxScore = this.checkboxScore + total;
    } else if (type === '判断题') {
      this.judgmentScore = this.judgmentScore + total;
    }
    this.objectiveScore = this.objectiveScore + total;
  }

  onValueChange(valueType, id) {

    const _objectives = [];
    for (var i = 0; i < this.objectives.length; i++) {
      const obj = this.objectives[i];
      if (obj && obj['id'] === id) {
        let start_ = obj['startno'];
        let end_ = obj['endno'];
        let type_ = obj['type'];
        let score_ = obj['score'];

        if (valueType === 1) {
          var start = Number(this.elementRef.nativeElement.querySelector('#start_' + id).value);
          if (!start || start < 1) {
            start = start_;
          } else {
            obj['startno'] = start;
          }
          this.elementRef.nativeElement.querySelector('#start_' + id).value = start;
          this.startValueChange(start_, start, type_, score_);
        } else if (valueType === 2) {
          var end = Number(this.elementRef.nativeElement.querySelector('#end_' + id).value);
          if (!end || end < 1 || end < obj['startno']) {
            end = end_;
          } else {
            obj['endno'] = end;
          }
          this.elementRef.nativeElement.querySelector('#end_' + id).value = end;
          this.endValueChange(end_, end, type_, score_);
        } else if (valueType === 3) {
          var type = this.elementRef.nativeElement.querySelector('#type_' + id).value;
          obj['type'] = type;
          if (type === '单选题' || type === '多选题') {
            obj['choiceNum'] = 4;
          } else if (type === '判断题') {
            obj['choiceNum'] = 2;
          }
          this.typeValueChange(start_, end_, type);
        } else if (valueType === 4) {
          const choiceNum = Number(this.elementRef.nativeElement.querySelector('#option_' + id).value);
          obj['choiceNum'] = choiceNum;
          this.choiceNumValueChange(start_, end_, type_, choiceNum);
          // TODO: why setting the checkbox value?
          this.setDefaultCheckBoxScore(obj);
        } else if (valueType === 5) {
          var score = Number(this.elementRef.nativeElement.querySelector('#score_' + id).value);
          if (!score || score < 1) {
            score = score_;
          } else {
            obj['score'] = score;
          }
          this.elementRef.nativeElement.querySelector('#score_' + id).value = score;
          this.scoreValueChange(start_, end_, type_, score_, score);
        }
      }
      _objectives.push(obj);
    }
    this.objectives = _objectives;
  }

  setAnswersOption(id, type, value) {
    this.objectiveAnswers.forEach(answer => {
      if (answer.quesno === id && answer.type === type) {
        if (type === '多选题') {
          let ans = answer.answer;
          if (ans.indexOf(value) >= 0) {
            ans = ans.replace(',' + value, '');
            ans = ans.replace(value, '');
            if (ans.indexOf(',') === 0) {
              ans = ans.substring(1);
            }
            answer.answer = ans;
          } else {
            ans = ans + ',' + value;
            if (ans.indexOf(',') === 0) {
              ans = ans.substring(1);
            }
            answer.answer = ans;
          }
        } else {
          answer.answer = value;
        }
      }
    });
  }

  setAnswersSubject(id, type) {
    let value = this.elementRef.nativeElement.querySelector('#answersSubject_' + id).value;
    this.objectiveAnswers.forEach(answer => {
      if (answer.quesno === id && answer.type === type) {
        answer.subject = value;
      }
    });
  }

  //-------------------------------Subjectives--------------------------------------

  subjectives = [
    { id: 0 - new Date().getTime(), quesno: 0, type: '填空题', startno: 1, endno: 10, branch: '不分科', score: 2 , remark: '', child: [] }
  ];

  subjectiveCount = 0;
  subjectiveScore = 0;

  setSubjectivesScore() {

    this.subjectiveCount = 0;
    this.subjectiveScore = 0;

    this.subjectives.forEach(subjective => {
      var count = subjective.endno - subjective.startno + 1;
      this.subjectiveCount += count;
      if (subjective.child != null && subjective.child.length > 0) {
        for(let child of subjective.child) {
          this.subjectiveScore += child.score;
        }
      } else {
        this.subjectiveScore += count * subjective.score;
      }
    })
  }

  addOneSubjectiveRow(id) {
    if (this.subjectives.length > 0) {
      if (id !== 0) {
        this.subjectives.forEach(subjective => {
          if (subjective.id === id) {
            let childs = subjective['child'];
            if (!childs) {
              childs = [];
            }
            let child = { id: 0 - new Date().getTime(), quesno: 1, quesid: subjective.quesno, branch: '不分科', type: subjective.type, score: 1, child: [] };
            child.quesno = childs.length + 1;
            child.branch = subjective.branch;
            childs.push(child);

            subjective['child'] = childs;
          }
        });
      } else {
        const obj = this.subjectives[this.subjectives.length - 1];
        const obj_ = { id: 0 - new Date().getTime(), quesno: 0, type: '填空题', startno: 1, endno: 10, branch: '不分科', score: 2 , remark: '', child: [] };
        if (obj['type'] === '填空题') obj_['startno'] = obj['endno'] + 1;
        else obj_['startno'] = obj['startno'] + 1;
        obj_['endno'] = obj_['startno'];
        obj_['quesno'] = obj_['startno'];
        this.subjectives.push(obj_);

        this.subjectiveCount = this.subjectiveCount + 1;
        this.subjectiveScore = this.subjectiveScore + 2;
      }

    } else {
      const obj = { id: 0 - new Date().getTime(), quesno: 0, type: '填空题', startno: 1, endno: 1, branch: '不分科', score: 1 , remark: '', child: [] };
      if (this.objectives.length > 0) {
        let objective = this.objectives[this.objectives.length - 1];
        obj.startno = objective.endno + 1;
        obj.endno = objective.endno + 1;
      }
      this.subjectives.push(obj);

      this.subjectiveCount = 1;
      this.subjectiveScore = 1;
    }
  }

  addOneSubjectiveStep(id, childId) {
    if(this.subjectives.length > 0 && id !== 0){
      this.subjectives.forEach(subjective => {
        if (subjective.id === id) {
          if(childId !== 0){
            let childs = subjective['child'];
            if(childs && childs.length>0){
              const childs_ = [];
              childs.forEach(child =>{
                if (child.id === childId) {
                  let steps = child.steps;
                  if(!steps){
                    steps = [];
                  }
                  if(steps.length > 0){
                    for (let i = 0; i<steps.length; i++) {
                      let step = steps[i];
                      step.step = i+1;
                    }
                  }
                  const step = { id: 0 - new Date().getTime(), quesno: child.quesno, type: child.type, branch: child.branch, score: 1 , 
                    quesid: child.id, egsId: child.egsId, step: steps.length+1, remark: '' };
                  
                  steps.push(step);
                  child.steps = steps;
                }
                childs_.push(child);
              })
              subjective['child'] = childs_;
            }
          }else{
            let steps = subjective['step'];
            if(!steps){
              steps = [];
            }
            if(steps.length > 0){
              for (let i = 0; i<steps.length; i++) {
                let step = steps[i];
                step.step = i+1;
              }
            }
            const step = { id: 0 - new Date().getTime(), quesno: 0, type: subjective.type, branch: subjective.branch, score: 1 , 
              quesid: subjective.id, egsId: subjective['examGradeSubId'], step: steps.length+1, remark: '' };
            
            steps.push(step);

            subjective['step'] = steps;
          }
        }
      })
    }
  }  

  removeOneSubjectiveStep(id, childId, stepId) {
    if(this.subjectives.length > 0 && id !== 0){
      this.subjectives.forEach(subjective => {
        if (subjective.id === id) {
          if(childId !== 0){
            subjective['child'].forEach(child =>{
              if (child.id === childId) {
                let steps = child.steps;
                if(steps && steps.length > 0){
                  const steps_ = [];
                  steps.forEach(step => {
                    if (step.id !== stepId) {
                      step.step = steps_.length + 1;
                      steps_.push(step);
                    }
                  });
                  child['steps'] = steps_;
                }
              }
            })
          }else{
            subjective['step'].forEach(step =>{
              let steps = subjective['step'];
              if(steps && steps.length > 0){
                const steps_ = [];
                steps.forEach(step => {
                  if (step.id !== stepId) {
                    step.step = steps_.length + 1;
                    steps_.push(step);
                  }
                });
                subjective['step'] = steps_;
              }
            })
          }
        }
      })
    }
  }

  removeOneSubjectiveRow(id, childId) {
    const _subjectives = [];
    for (var i = 0; i < this.subjectives.length; i++) {
      const subjective = this.subjectives[i];
      if (subjective && subjective['id'] !== id) {
        _subjectives.push(subjective);
      } else if (childId > 0) {
        let childs = subjective['child'];
        const _child = [];
        childs.forEach(child => {
          if (child.quesno !== childId) {
            child.quesno = _child.length + 1;
            _child.push(child);
          }
        });
        subjective['child'] = _child;

        _subjectives.push(subjective);
      } else {
        this.subjectiveCount = this.subjectiveCount - 1;
        if (subjective.type === '填空题') {
          this.subjectiveScore = this.subjectiveScore - (subjective.endno - subjective.startno + 1) * subjective.score;
        } else {
          this.subjectiveScore = this.subjectiveScore - subjective.score;
        }
      }
    }

    this.subjectives = _subjectives;
  }

  onSubjectiveValueChange(valueType, id, childId, stepId) {
    this.subjectives.forEach(subjective => {
      if (subjective.id === id) {
        if (childId !== 0) {
          let childs = subjective['child'];
          childs.forEach(child => {
            if (child.id === childId) {
              let value = this.elementRef.nativeElement.querySelector('#subjective_' + valueType + '_' + id + '_' + childId + '_' + stepId).value;
              if(stepId !== 0){
                let steps = child['steps'];
                steps.forEach(step => {
                  if (step.id === stepId) {
                    if (valueType === 'score') {
                      value = Number(value);
                      if (!value || value < 1) {
                        value = step.score;
                      }
                    }
                    step[valueType] = value;
                  }
                })
              }else{
                if (valueType === 'score') {
                  value = Number(value);
                  if (!value || value < 1) {
                    value = child.score;
                  }
                }
                child[valueType] = value;
              }
              this.elementRef.nativeElement.querySelector('#subjective_' + valueType + '_' + id + '_' + childId + '_' + stepId).value = value;
            }
          });
        } else {
          let value = this.elementRef.nativeElement.querySelector('#subjective_' + valueType + '_' + id + '_' + childId + '_' + stepId).value;
          
          if(stepId !== 0){
            let steps = subjective['step'];
            steps.forEach(step => {
              if (step.id === stepId) {
                if (valueType === 'score') {
                  value = Number(value);
                  if (!value || value < 1) {
                    value = step.score;
                  }
                }
                step[valueType] = value;
              }
            })
          }else{
            if (valueType === 'start') {  
              this.subjectiveCount = this.subjectiveCount - (subjective.endno - subjective.startno + 1);
              this.subjectiveScore = this.subjectiveScore - (subjective.endno - subjective.startno + 1) * subjective.score;
  
              value = Number(value);
              if (!value || value < 1) {
                value = subjective.startno;
              } else if (value > subjective.endno) {
                value = subjective.endno;
              }
  
              subjective.startno = value;
              subjective.quesno = value;
              if (subjective.endno < subjective.startno) {
                subjective.endno = subjective.startno;
              }
              
              this.subjectiveCount = this.subjectiveCount + (subjective.endno - subjective.startno + 1);
              this.subjectiveScore = this.subjectiveScore + (subjective.endno - subjective.startno + 1) * subjective.score;
  
            } else if (valueType === 'end') {
  
              this.subjectiveCount = this.subjectiveCount - (subjective.endno - subjective.startno + 1);
              this.subjectiveScore = this.subjectiveScore - (subjective.endno - subjective.startno + 1) * subjective.score;
  
              value = Number(value);
              if (!value || value < 1) {
                value = subjective.endno;
              } else if (value < subjective.startno) {
                value = subjective.startno;
              }
              
              subjective.endno = value;
              if (subjective.endno < subjective.startno) {
                subjective.startno = subjective.endno;
                subjective.quesno = subjective.endno;
              }
              
              this.subjectiveCount = this.subjectiveCount + (subjective.endno - subjective.startno + 1);
              this.subjectiveScore = this.subjectiveScore + (subjective.endno - subjective.startno + 1) * subjective.score;
              
            } else if (valueType === 'type') {
              subjective[valueType] = value;
            } else if (valueType === 'score') {
              
              value = Number(value);
              if (!value || value < 1) {
                value = subjective.score;
              }
              
              this.subjectiveScore = this.subjectiveScore + (subjective.endno - subjective.startno + 1) * (value - subjective.score);
              subjective[valueType] = value;
            }
          }
          this.elementRef.nativeElement.querySelector('#subjective_' + valueType + '_' + id + '_' + childId + '_' + stepId).value = value;
        }
      }
    });
  }

  objectiveChoiceNum = 2;
  objectiveScore_ = 1

  showCheckBoxScore(choiceNum, score) {
    this.initCheckBoxScores(choiceNum, score);
    this.elementRef.nativeElement.querySelector('#infoModal').style.display = '';
  }

  initCheckBoxScores(choiceNum, score) {

    var size = 0;
    if(choiceNum > 1){
      for (var i = 1; i < choiceNum; i++) {
        size = size + 1;
      }
    }

    this.objectiveChoiceNum = choiceNum;
    this.objectiveScore_ = score;
    this.currentCheckBox = 2;
    if (this.checkBoxScores.length !== size) {
      this.checkBoxScores = [];
      for (var i = 2; i <= choiceNum; i++) {
        let scores_ = [];
        for (var j = 1; j < i; j++) {
          scores_.push({ count: j, score: 0 });
        }
        this.checkBoxScores.push({ size: i, seted: false, scores: scores_ });
      }
    }
  }  

  //completions = {}
  completions = { id: 0 - new Date().getTime(), quesno: 0, type: '填空题', startno: 1, endno: 10, branch: '不分科', score: 2, remark:'',child:[] };

  setScore(id) {
    this.subjectives.forEach(element => {
      if(element.id === id){
        //this.completions = element;
        this.completions.id = element.id;
        this.completions.quesno = element.quesno;
        this.completions.type = element.type;
        this.completions.startno = element.startno;
        this.completions.endno = element.endno;
        this.completions.branch = element.branch;
        this.completions.score = element.score;
        if(element['child'] === null){
          var childs = [];
          for(var i=element.startno;i<=element.endno;i++){
            var child = { id: 0 - new Date().getTime(), quesno: i, quesid: element.id, branch: element.branch, type: element.type, score: element.score };
            childs.push(child);
          }
          this.completions.child = childs;
          element['child'] = childs;
        }else{
          this.completions.child = element['child'];
        }
      }
    });
    var childs = this.completions['child']
    for(var i=0;i<childs.length-1;i++){
      for(var j=i+1;j<childs.length;j++){
        if(childs[i].quesno > childs[j].quesno){
          var child = childs[i];
          childs[i] = childs[j];          
          childs[j] = child;
        }
      }
    }
    this.completions['child'] = childs
    this.elementRef.nativeElement.querySelector('#setScoreModal').style.display = '';
  }

  setCompletionScore(completionId,quesno){
    let score = Number(this.elementRef.nativeElement.querySelector('#setScore_' + completionId + '_' + quesno).value);
    this.subjectives.forEach(element => {
      if(element.id === completionId){
        element['child'].forEach(child => {
          if(child.quesno === quesno){
            this.subjectiveScore -= child.score
            child.score = score;
            this.subjectiveScore += score
          }
        });
      }
    });
  }

  closeSetCompletionScoreModal(){
    this.elementRef.nativeElement.querySelector('#setScoreModal').style.display = 'none';
  }

  comment  = {subjective:0,child:0,step:0,text:''}

  addRemark(subjectiveId,childId,stepId){

    if(subjectiveId != 0){
      this.comment.subjective = subjectiveId;
      this.comment.child = childId;
      this.comment.step = stepId;
      this.subjectives.forEach(element => {
        if(element.id === subjectiveId){
          if(childId === 0){
            if(stepId === 0){
              if(element.remark && element.remark != null){
                this.comment.text = element.remark;
              }else{
                this.comment.text = '';
              }
            }else{
              element['step'].forEach(step => {
                if(step.id === stepId){
                  if(step.remark && step.remark != null){
                    this.comment.text = step.remark;
                  }else{
                    this.comment.text = '';
                  }
                }
              })
            }
          }else{
            element['child'].forEach(child => {
              if(child.id === childId){
                if(stepId === 0){
                  if(child.remark && child.remark != null){
                    this.comment.text = child.remark;
                  }else{
                    this.comment.text = '';
                  }
                }else{
                  child['steps'].forEach(step => {
                    if(step.id === stepId){
                      if(step.remark && step.remark != null){
                        this.comment.text = step.remark;
                      }else{
                        this.comment.text = '';
                      }
                    }
                  })
                }
              }
            })
          }
        }
      });  
    }
    this.elementRef.nativeElement.querySelector('#qes_comment').value = this.comment.text;
    this.elementRef.nativeElement.querySelector('#setCommentModal').style.display = '';
  }

  closeSetCommentModal(type){
    if(this.comment.subjective !==0 && type === 1){
      var text = this.elementRef.nativeElement.querySelector('#qes_comment').value;
      this.subjectives.forEach(element => {
        if(element.id === this.comment.subjective){
          if(this.comment.child === 0){
            if(this.comment.step === 0){
              element.remark = text;
            }else{
              element['step'].forEach(step => {
                if(step.id === this.comment.step){
                  step.remark = text;
                }
              })
            }
          }else{
            element['child'].forEach(child => {
              if(child.id === this.comment.child){
                if(this.comment.step === 0){
                  child.remark = text;
                }else{
                  child['steps'].forEach(step => {
                    if(step.id === this.comment.step){
                      step.remark = text;
                    }
                  })
                }
              }
            })
          }
        }
      });  
    }
    this.elementRef.nativeElement.querySelector('#setCommentModal').style.display = 'none';
  }

  closeCheckBoxModal() {
    if (this.checkBoxScores.length > 0) {
      this.checkBoxScores[this.checkBoxScores.length - 1].seted = true;
    }
    this.elementRef.nativeElement.querySelector('#infoModal').style.display = 'none';
  }

  setDefaultCheckBoxScore(objective) {
    if (objective.type === 2) {
      console.log('!!! question type is 2');
      console.dir(objective);
      this.checkBoxScores = [];
      let optionSize = objective['choiceNum'];

      for (var i = 2; i <= optionSize; i++) {
        let scores_ = [];
        for (var j = 1; j < i; j++) {
          scores_.push({ count: j, score: 0 });
        }
        this.checkBoxScores.push({ size: i, seted: false, scores: scores_ });
      }
    }
  }

  setCheckBoxScore(size, count) {
    let score = Number(this.elementRef.nativeElement.querySelector('#checkBoxScore_' + size + '_' + count).value);
    if (!score || score < 0) {
      score = 0;
    } else if (score > this.objectiveScore_) {
      score = this.objectiveScore_;
    }
    this.elementRef.nativeElement.querySelector('#checkBoxScore_' + size + '_' + count).value = score;
    this.checkBoxScores.forEach(element => {
      if (element.size === size) {
        element.scores.forEach(element_ => {
          if (element_.count === count) {
            element_.score = score;
          }
        });
      }
    });
  }

  setNextCheckBoxScore() {
    this.checkBoxScores.forEach(element => {
      if (element.size === this.currentCheckBox) {
        element.seted = true;
      }
    });

    if (this.currentCheckBox < this.checkBoxScores[this.checkBoxScores.length - 1].size) {
      this.currentCheckBox = this.currentCheckBox + 1;
    }
  }

  setCurrentCheckBoxScore(size) {
    this.currentCheckBox = size;
  }

  commitDatas() {
    var data = {};
    data['objectives'] = this.objectives;
    data['subjectives'] = this.subjectives;
    data['objectiveAnswers'] = this.objectiveAnswers;

    var flag = true;

    this.subjectives.forEach(subjective => {
      if (subjective.type !== '填空题') {
        var childs = subjective["child"];
        var score = subjective.score;
        if(flag && childs && childs.length > 0){
          var childTotalScore = 0;
          childs.forEach(sc =>{
            var childScore = sc["score"];
            childTotalScore += sc["score"];
            var steps = sc["steps"];
            if(flag && steps && steps.length > 0){
              var totalScore = 0;
              steps.forEach(sc_ =>{
                totalScore += sc_["score"];
              })
              if(childScore !== totalScore){
                alert(subjective.type + "第 " + subjective.quesno + "." + sc.quesno + " 题分数设置有误，请检查后再次提交！");
                flag = false;
              }
            }
          })
          if(flag && score !== childTotalScore){
            alert(subjective.type + "第 " + subjective.quesno + " 题分数设置有误，请检查后再次提交！");
            flag = false;
          }
        }
        var steps = subjective["step"];
        if(flag && steps && steps.length > 0){
          var totalScore = 0;
          steps.forEach(sc =>{
            totalScore += sc["score"];
          })
          if(score !== totalScore){
            alert(subjective.type + "第 " + subjective.quesno + " 题分数设置有误，请检查后再次提交！");
            flag = false;
          }
        }
      }
    })

    if(flag){
      var quesnos = '';
      this.objectiveAnswers.forEach(answer => {
        if(answer.answer === ''){
          flag = false;
          if(quesnos !== ''){
            quesnos += ',';
          }
          quesnos += answer.quesno;
        }
      })
      if(!flag){
        alert("客观题 " + quesnos + " 题标准答案未设置，请检查后再次提交！");
      }
    }
    
    if(!flag){
      return;
    }

    if (this.checkBoxScores.length === 0) {
      this.objectives.forEach(objective => {
        if (objective.type === '多选题') {
          if (objective.choiceNum > this.objectiveChoiceNum) {
            this.objectiveChoiceNum = objective.choiceNum;
          }
          if (objective.score > this.objectiveScore_) {
            this.objectiveScore_ = objective.score;
          }
        }
      });
    }
    this.initCheckBoxScores(this.objectiveChoiceNum, this.objectiveScore_);
    data['checkBoxScores'] = this.checkBoxScores;
    if(confirm("客观题" + this.objectiveScore + "分，主观题" + this.subjectiveScore + "分，共" + (this.objectiveScore+this.subjectiveScore) + "分，确认保存吗？")) {
      this._sharedService.makeRequest('POST', '/api/setanswers/answers/' + this.egsId, JSON.stringify(data)).then((data: any) => {
        if (data.success) {
          alert("保存成功！");
          this.getQuesAnswers(this.egsId, this.examId, this.gradeId, this.subjectId);
        }
      }).catch((error: any) => {
        console.log(error.status);
        console.log(error.statusText);
      });
    }
  }

}
