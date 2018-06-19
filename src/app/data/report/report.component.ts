import { Component, OnInit } from '@angular/core';
import {DataService} from '../data.service';
import * as _ from 'lodash';
import * as XLSX from 'xlsx';

type AOA = Array<Array<any>>;
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
  fileNameFirst:string;

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
    //检查画面条件
    if (!this.checkSelected()){
      return;
    }

    //调用API获取数据
    this._dataService.getReprotSubScore(this.selectedSubject.id).then((data: any) => {
      let tempResult = [];
      tempResult = data;
      if (!tempResult || tempResult.length == 0) {
        alert('未查询到相关信息。');
        return;
      }
      //生成文件
      this.downloadSubScore(tempResult);
    })
  }

  private getBranchScore() {

  }

  getDetailScore() {
    //检查画面条件
    if (!this.checkSelected()){
      return;
    }
    //调用API获取数据
    this._dataService.getReprotDetailScore(this.selectedSubject.id).then((data: any) => {
      if (!data || data.details.length==0) {
        alert('未查询到相关信息。');
        return;
      }
        //生成文件
      this.downloadDetailScore(data);
    })

  }
  private checkSelected():boolean{
    if (_.isObject(this.selectedExam) && _.isObject(this.selectedSchool) && _.isObject(this.selectedGrade) && _.isObject(this.selectedSubject)) {
      //选择的条件正确
      this.fileNameFirst=this.selectedExam.examName + '_' + this.selectedSchool.schoolName +  '_' + this.selectedGrade.gradeName +  '_' + this.selectedSubject.name;
    }
    else {
        alert('您选择的条件不正确。');
        return false;
    }
      return true
  }

  private downloadSubScore(resultData:any): void {
    let dataExp:AOA=[];
    dataExp[0]=new Array();
    for (let i:number=0; i<resultData.length; i++){
      dataExp[i+1]=new Array();
    }
    /* 第一行 标题 */
    dataExp[0][0]='序号';
    dataExp[0][1]='考号';
    dataExp[0][2]='姓名';
    dataExp[0][3]='班级';
    dataExp[0][4]='成绩';
    dataExp[0][5]='排名';
    let colLen = 5;
    for (let row of resultData) {
      if (row.childScores != null && row.childScores.length > 0) {
        for (let childScore of row.childScores) {
          dataExp[0][++colLen]=childScore.subName;
          dataExp[0][++colLen]='排名';
        }
        break;
      }
    }
    for (let i:number=0; i<resultData.length; i++){
      dataExp[i+1][0]=i+1;
      dataExp[i+1][1]=resultData[i].eeCode;
      dataExp[i+1][2]=resultData[i].eeName;
      dataExp[i+1][3]=resultData[i].clsName;
      dataExp[i+1][4]=resultData[i].score;
      dataExp[i+1][5]=resultData[i].rank;
      if (resultData[i].childScores != null && resultData[i].childScores.length >0) {
        let index = 5;
        for (let childScore of resultData[i].childScores) {
          dataExp[i+1][++index]=childScore.score;
          dataExp[i+1][++index]=childScore.rank;
        }
      } else if (colLen > 5) {
        for (let j:number=5; j<colLen; j++) {
          dataExp[i+1][j+1]=0;
        }
      }
    }

		/* generate worksheet */
		const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataExp);

		/* generate workbook and add the worksheet */
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, this.selectedSubject.name);

		/* save to file */
		XLSX.writeFile(wb, this.fileNameFirst + '单科成绩.xlsx');
  }

  private downloadDetailScore(resultData:any): void {
    let dataExp:AOA=[];
    let details:any[]=resultData.details;
    let clsName:string;
    let sheetRow:number;
    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    for (let idx:number=0;idx<details.length;idx++){
      if (!clsName || clsName!=details[idx].clsName ) {
        sheetRow=0;
        //前sheet生成
        if (dataExp.length>0){
          const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataExp);
          XLSX.utils.book_append_sheet(wb, ws, clsName);
          let wscols = [{wch: 6}];
          for(let i=0; i<100; i++) {
            let col = {wch: 4};
            wscols.push(col);
          }
          ws['!cols'] = wscols;
        }
        //head生成
        dataExp=this.creatDetailScoreHead(resultData);
        sheetRow=3;
      }

      //body生成 1行
      this.creatDetailScoreBody(resultData,dataExp,idx,sheetRow);

      clsName=details[idx].clsName;
      sheetRow+=1;
    }

    //最后一sheet保存
    if (dataExp.length>0){
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(dataExp);
      XLSX.utils.book_append_sheet(wb, ws, clsName);
      let wscols = [{wch: 6}];
      for(let i=0; i<100; i++) {
        let col = {wch: 4};
        wscols.push(col);
      }
      ws['!cols'] = wscols;
    }
    /* save to file */
    XLSX.writeFile(wb,  this.fileNameFirst + '答题明细.xlsx');
  }

  private creatDetailScoreHead(resultData:any):AOA{
    let dataExp:AOA=[];
    let row:number;
    let col:number;
    //数组初始化
    dataExp=[];
    dataExp[0]=new Array();
    dataExp[1]=new Array();
    dataExp[2]=new Array();

    row=0;
    /* 第1行 标题 */
    dataExp[row][0]='';
    dataExp[row][1]='';
    col=2;
    if (resultData.objRef){
      dataExp[row][col]='客观题';
      col=col+resultData.objRef.length;
    }
    if (resultData.subRef){
      dataExp[row][col]='主观题';
      col=col+resultData.subRef.length;
    }

    /* 第2行 标题 */
    row=1;
    dataExp[row][0]='';
    dataExp[row][1]='';
    col=2;
    if (resultData.objRef){
      for (let i:number=0;i<resultData.objRef.length;i++){
        dataExp[row][col]=resultData.objRef[i].quesno;
        col+=1;
      }
    }
    if (resultData.subRef){
      for (let i:number=0;i<resultData.subRef.length;i++){
        dataExp[row][col]=resultData.subRef[i].quesno;
        col+=1;
      }
    }
    dataExp[row][col]='总分';

    /* 第3行 标题 */
    row=2;
    dataExp[row][0]='姓名';
    dataExp[row][1]='班级';
    col=2;
    if (resultData.objRef){
      for (let i:number=0;i<resultData.objRef.length;i++){
        dataExp[row][col]=resultData.objRef[i].value;
        col+=1;
      }
    }
    if (resultData.subRef){
      for (let i:number=0;i<resultData.subRef.length;i++){
        dataExp[row][col]=resultData.subRef[i].value;
        col+=1;
      }
    }
    dataExp[row][col]=resultData.score;
    return dataExp;
  }

  private creatDetailScoreBody(resultData:any,dataExp:AOA,idx:number,row:number): void {
    let col:number;
    //行初始化
    dataExp[row]=new Array();

    /* 1行 分数详情 */
    dataExp[row][0]=resultData.details[idx].eeName;
    dataExp[row][1]=resultData.details[idx].clsName;
    col=2;
    if (resultData.objRef){
      for (let i:number=0;i<resultData.objRef.length;i++){
        dataExp[row][col]=this.getDetailCellValueObj(resultData,idx,resultData.objRef[i].quesno);
        col+=1;
      }
    }
    if (resultData.subRef){
      for (let i:number=0;i<resultData.subRef.length;i++){
        dataExp[row][col]=this.getDetailCellValueSub(resultData,idx,resultData.subRef[i].quesno);
        col+=1;
      }
    }
    dataExp[row][col]=resultData.details[idx].score;
  }

  //取得客观题答案或分数
  private getDetailCellValueObj(resultData:any,idx:number,col:string):string {
    let rstValue:string='';
    for (let i:number=0;i<resultData.details[idx].objL.length;i++){
      if (resultData.details[idx].objL[i].quesno==col) {
        rstValue=resultData.details[idx].objL[i].value;
        return rstValue;
      }
    }
    return rstValue;
  }

  //取得主观题分数
  private getDetailCellValueSub(resultData:any,idx:number,col:string):string {
    let rstValue:string='';
    for (let i:number=0;i<resultData.details[idx].subL.length;i++){
      if (resultData.details[idx].subL[i].quesno==col) {
        rstValue=resultData.details[idx].subL[i].value;
        return rstValue;
      }
    }
    return rstValue;
  }

}
