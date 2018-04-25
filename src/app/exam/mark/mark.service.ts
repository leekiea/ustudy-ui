import { Injectable } from '@angular/core';
import { SharedService } from '../../shared.service';

@Injectable()
export class MarkService {

  constructor(private _sharedService: SharedService) { }

  getProgress(rawData): string {
    let progress = '';
    let index = rawData.indexOf('/');
    let num = rawData.substring(0, index);
    let total = rawData.substring(index + 1);
    return Math.floor(Number(num)/Number(total)*100) + '%';
  }

  getNum(rawData): string {
    let index = rawData.indexOf('/');
    return rawData.substring(0, index);
  }

  getTotal(rawData): string {
    let index = rawData.indexOf('/');
    return rawData.substring(index + 1);
  }

  toNum(data){
    return parseFloat(data);
  }

}