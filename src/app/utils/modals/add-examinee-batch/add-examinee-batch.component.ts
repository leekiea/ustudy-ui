import {Component, OnInit, ViewChild} from '@angular/core';
import {BsModalRef} from 'ngx-bootstrap';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';
import {ExamService} from '../../../exam/exam.service';

type AOA = Array<Array<any>>;
@Component({
  selector: 'app-add-examinee-batch',
  templateUrl: './add-examinee-batch.component.html',
  styleUrls: ['./add-examinee-batch.component.css']
})
export class AddExamineeBatchComponent implements OnInit {
  @ViewChild('examineeTable') table: any;
  data: AOA = [[]];
  data1: [any];
  examinees = [];
  examId: string;
  gradeId: string;
  grade: any;

  constructor(public bsModalRef: BsModalRef, private _examService: ExamService) { }

  ngOnInit() {
  }

  onFileChange(evt: any) {
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary'});

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      this.data = <AOA>(XLSX.utils.sheet_to_json(ws, {header: 1}));

      let groups = [];
      /* get subject groups*/
      let t = this;
      for(let row of this.data) {
        if (row[0] == undefined || row[1] == undefined) {
          return;
        }
        
        if (row[0] == '姓名') {
          t.data = t.data.slice(1);
          break;
        } else {
          let group = {name: '', subNames: ''};
          group.name = row[0];
          group.subNames = row[1];
          
          if (group.subNames.indexOf(' ') != -1) {
            group.subNames = group.subNames.replace(/ /g, '');
          }
  
          if (group.subNames.indexOf('（') != -1) {
            group.subNames = group.subNames.replace(/\（/g, '(');
          }
  
          if (group.subNames.indexOf('）') != -1) {
            group.subNames = group.subNames.replace(/\）/g, ')');
          }
  
          if (group.subNames.indexOf('，') != -1) {
            group.subNames = group.subNames.replace(/\，/g, ',');
          }
          groups.push(group);
          t.data = t.data.slice(1);
        }
      }

      _.forEach(this.data, (row) => {
        console.log("row: " + row[0] + "_" + row[1] + "_" + row[2] + "_" + row[3] + "_" + row[4]);
        if(row[0] == undefined || row[2] == undefined || row[3] == undefined || row[4] == undefined) {
          return;
        }
        const examinee = Object.create({});
        // [{stuName: this.name, stuId: this.stuId, examCode: this.examCode, classId: this.examineeClass.classId,
        examinee.examId = Number(this.examId);
        examinee.gradeId = Number(this.gradeId);
        if (row[0].indexOf(' ') != -1) {
          examinee.stuName = row[0].replace(/ /g, '');
        } else {
          examinee.stuName = row[0];
        }
        examinee.stuId = row[1];

        if (row[2].indexOf(' ') != -1) {
          examinee.examCode = row[2].replace(/ /g, '');
        } else {
          examinee.examCode = row[2];
        }

        if (row[3].indexOf(' ') != -1) {
          examinee.className = row[3].replace(/ /g, '');
        } else {
          examinee.className = row[3];
        }

        if (row[3].indexOf('(') != -1) {
          examinee.className = examinee.className.replace(/\(/g, '（');
        }

        if (row[3].indexOf(')') != -1) {
          examinee.className = examinee.className.replace(/\)/g, '）');
        }

        let subNames = '';

        for (let group of groups) {
          if (group.name == row[4]) {
            subNames = group.subNames;
          }
        }

        examinee.subs = [];
        for(let subName of subNames.split(',')) {
          let matched = false;
          for(let sub of this.grade.subjects) {
            if (sub.name === subName) {
              matched = true;
              examinee.subs.push(sub.id);
              break;
            }
          }
          if (!matched) {
            alert('无法找到科目：' + subName);
            return;
          }
        }

        this.examinees.push(examinee);
      });
      this.examinees = [...this.examinees]; // refresh the table rows
    };
    reader.readAsBinaryString(target.files[0]);
  }

  submit() {
    this._examService.addOrUpdateExaminee(this.examinees).then((data) => {
      alert(`批量新建考生成功`);
      this.bsModalRef.hide()
    });
  }
}
