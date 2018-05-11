import { Component, OnInit, AfterViewInit, ViewChild, Renderer2, Input, OnChanges, Inject, forwardRef, EventEmitter }  from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedService } from '../../shared.service';
import { ProblemComponent } from './problem.component';

@Component({
	selector: 'paper-canvas',
    templateUrl: 'expaper.component.html'
})

export class ExpaperComponent implements OnInit {
	@Input() paperImg: string;

	/***** View *****/
	@ViewChild('paperCanvas') paperCanvas;

	container: any;
	canvas: any;
	ctx: any;
	isBigSize = false;

    constructor(private _sharedService: SharedService, private renderer: Renderer2, private route: ActivatedRoute,
    	@Inject(forwardRef(()=>ProblemComponent)) public parent: ProblemComponent) {

    }

    ngOnInit(): void {
    	console.log("canvas init" + this.paperImg);

	}

	ngOnChanges(): void {
		console.log("canvas change"  + this.paperImg);
		if (this.canvas === undefined) {
			return;
		}
		console.log("canvas before load paper"  + this.paperImg);
		this.isBigSize = false;
		this.loadPaper(0, 0);
	}

	ngAfterViewInit(): void {
		console.log("canvas afterview" + this.paperImg);
		this.container = this.parent.paperContainer.nativeElement;

		this.canvas = this.paperCanvas.nativeElement;
		this.ctx = this.canvas.getContext("2d");
		this.renderer.listen(this.canvas, 'dblclick', (evt) => {
    		this.doubleClick(evt);
    	});
		this.isBigSize = false;
		this.loadPaper(0, 0);
	}

	doubleClick(evt) {
		let x = (evt.offsetX == undefined || evt.offsetX == 0 ? evt.layerX: evt.offsetX);
		let y = (evt.offsetY == undefined || evt.offsetY == 0 ? evt.layerY: evt.offsetY);
		this.isBigSize = !this.isBigSize;
		console.dir(evt);
		this.loadPaper(x, y);
	}

	loadPaper(x, y): void {
		var promiseArray = [];
		console.log("loadPaper");
		// total canvas width
		let canvasW = this.container.clientWidth - 20; //leave 20px for the scroll bar

		// total canvas height
		let canvasH = 0;

		// set the total size of the canvas
		this.ctx.canvas.width = canvasW;

		let paperImg = new Image();

		paperImg.crossOrigin = "anonymous";
		let t = this;
		paperImg.onload = function() {
			if (t.isBigSize === false) {
				t.ctx.canvas.height = (t.ctx.canvas.width/paperImg.width) * paperImg.height ;
				t.ctx.drawImage(paperImg, 0, 0, paperImg.width, paperImg.height, 0, 0, t.ctx.canvas.width, t.ctx.canvas.height);
			} else {
				t.ctx.canvas.height = (t.ctx.canvas.width/(paperImg.width - x)) * (paperImg.height -y) ;
				t.ctx.drawImage(paperImg, x , y, paperImg.width, paperImg.height, 0, 0, paperImg.width, paperImg.height);
			}
		}
		paperImg.onerror = function() {
			alert("无法加载试卷！");
		}
		paperImg.src = this._sharedService.getImgUrl(this.paperImg, '');
	}
}
