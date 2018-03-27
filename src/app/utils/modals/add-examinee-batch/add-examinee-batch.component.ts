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
      this._examService.getGrade(this.gradeId).then((data) => {
        this.grade = data;
        _.forEach(this.data.slice(1), (row) => {
          const examinee = Object.create({});
          // [{stuName: this.name, stuId: this.stuId, stuExamId: this.stuExamId, classId: this.examineeClass.classId,
          examinee.examId = this.examId;
          examinee.gradeId = this.gradeId;
          examinee.stuName = row[0];
          examinee.stuId = row[1];
          examinee.stuExamId = row[2];
          examinee.classId = this.findClass(row[3]);
          examinee.className = row[3];
          this.examinees.push(examinee)
        })
      });
    };
    reader.readAsBinaryString(target.files[0]);
  }

  test() {
    console.log(1)
  }

  private findClass(name: any) {
    const classes = this.grade.classes;
    return _.get(_.find(classes, {className: name}), 'id')
  }

  changeClass(event, row) {
    row.classId = event.target.value
  }

  submit() {
    this._examService.addOrUpdateExaminee(this.examinees).then((data) => {
      alert(`批量新建考生成功`);
      this.bsModalRef.hide()
    });
  }
}
