import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from '../shared.service';

declare var $: any;

@Component({
  templateUrl: 'login.component.html'
})

export class LoginComponent {
  public loginForm: FormGroup;

  role: string = "任课老师";

  username: "";
  password: "";
  reqContent = {
    "data": "",
    "reqContentType": "application/x-www-form-urlencoded",
    "resContentType": "application/json"
  }

  constructor(private _sharedService: SharedService, private fb: FormBuilder, private route: ActivatedRoute, private router: Router) {
  }

  ngOnInit() {
    //this.getUser();
    this.loginForm = this.fb.group({
      username: ["", Validators.required],
      password: ["", Validators.required]
    });
  }

  login(event) {
    if (this.loginForm.status == "INVALID") {
      alert("信息不完整");
      return;
    }

    this.reqContent.data = "username=" + this.username + "&password=" + this._sharedService.MD5(this.password);

    console.log("reqContent:" + this.reqContent.data);

    this._sharedService.makeRequest('POST', '/api/login', this.reqContent).then((data: any) => {
      // IP filtering
      $.getJSON('https://ipapi.co/json/', function(ipdata) {
        if (data.orgid == '3461000314' &&
           data.roles[0] != '清道夫' && 
           data.roles[0] != '校长' &&
           ipdata.ip != '219.145.102.230' &&
           ipdata.ip != '117.35.48.38' ) {
            this._sharedService.makeRequest('GET', '/api/logout', '').then((data: any) => {
              alert("您的账号无法在校外登陆系统。IP地址:" + ipdata.ip);
              this._sharedService.userName = '';
              this._sharedService.userRole = '';
              this.router.navigate(['welcome']);
            }).catch((error: any) => {
              alert("注意：请不要在校外登陆系统。 IP地址:" + ipdata.ip);
              this._sharedService.userName = '';
              this._sharedService.userRole = '';
              this.router.navigate(['welcome']);
            });
        }
      });
      this._sharedService.userName = data.userName === undefined ? '' : data.userName;
      this._sharedService.userRole = data.role === undefined ? '' : data.role;
      console.log("login successful: user:" + this._sharedService.userName + " role:" + this._sharedService.userRole);
      this.router.navigate(['welcome']);
    }).catch((error: any) => {
      this._sharedService.userName = '';
      this._sharedService.userRole = '';
      console.log(error.status);
      console.log(error.statusText);
      alert("登录失败！");
      this.router.navigate(['welcome']);
    });
  }
}
