/* First edits from Beyond Fireship video on text transition animations */
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        console.log(entry)
        if (entry.isIntersecting) {
            entry.target.classList.add('show');}
        else {
            entry.target.classList.remove('show');
        }
    });
});

const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el) => observer.observe(el));



/* The fractal tree */
class Canvas {
	constructor(canvas, id) {
		this.canvas = canvas;
		this.elem = document.getElementById(id);
		this.ctx = this.elem.getContext('2d');
		this.dx = 0;
		this.dy = 0;
		this.cx = 0;
		this.cy = 0;
		this.lastX = 0;
		this.lastY = 0;

		this.elem.setAttribute('width', window.innerWidth);
		this.elem.setAttribute('height', window.innerHeight);
		this.width = this.elem.width;
		this.height = this.elem.height;

		this.elem.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
		window.addEventListener('resize', (e) => this.onWindowResize(e), false);

	}

	clear() {
		this.ctx.clearRect(0,0,this.width,this.height);
	}

	getScrollX() {
	    return window.pageXOffset || window.document.documentElement.scrollLeft;
	}

	getScrollY() {
	    return window.pageYOffset || window.document.documentElement.scrollTop;
	}

	getPosition(event) {    
	    event.preventDefault();
	    this.dx = event.pageX - (this.getScrollX() + this.elem.getBoundingClientRect().left);
	    this.dy = event.pageY - (this.getScrollY() + this.elem.getBoundingClientRect().top) ;        
	    this.lastX = event.pageX - (this.getScrollX() + this.elem.getBoundingClientRect().left) - this.cx;
	    this.lastY = event.pageY - (this.getScrollY() + this.elem.getBoundingClientRect().top) - this.cy;

	    return {
	        x: this.lastX,
	        y: this.lastY
	    }    
	}

	getTouchPos(event) {    
	    event.preventDefault();

	    this.dx = event.changedTouches[0].pageX - (this.getScrollX() + this.elem.getBoundingClientRect().left) - this.lastX;
	    this.dy = event.changedTouches[0].pageY - (this.getScrollY() + this.elem.getBoundingClientRect().top) - this.lastY;    
	    this.lastX = event.changedTouches[0].pageX - (this.getScrollX() + this.elem.getBoundingClientRect().left);
	    this.lastY = event.changedTouches[0].pageY - (this.getScrollY() + this.elem.getBoundingClientRect().top);        

	    this.lastX = this.lastX > 0 ? (this.lastX < this.elem.width ? this.lastX : this.elem.width) : 0;
	    this.lastY = this.lastY > 0 ? (this.lastY < this.elem.height ? this.lastY : this.elem.height) : 0;        

	    return {
	        x: this.lastX,
	        y: this.lastY
	    }    
	}

	animate() {
		requestAnimationFrame(() => this.animate());

		this.cx = this.cx - 0.8 * Math.cos(this.canvas.angle);
		this.cy = this.cy - 0.8 * Math.sin(this.canvas.angle);

		this.canvas.update({			
			x: this.cx,
			y: this.cy
		});		
	}
		
	onMouseMove(e) {	
		this.cx = e.pageX - (this.getScrollX() + this.elem.getBoundingClientRect().left) - this.lastX;
    	this.cy = e.pageY - (this.getScrollY() + this.elem.getBoundingClientRect().top) - this.lastY; 

		this.canvas.update({			
			x: e.clientX - this.getPosition(e).x,
			y: e.clientY - this.getPosition(e).y
		});
	}
	
	onWindowResize(e) {
		this.clear();
		this.elem.setAttribute('width', window.innerWidth);
		this.elem.setAttribute('height', window.innerHeight);	
		this.canvas.draw();
	}
}

class FractalTree {
	constructor(canvas_id) {
		// initialize the tree.
		this.canvas = new Canvas(this, canvas_id);	
		this.ctx = this.canvas.ctx;
		this.ctx.strokeStyle = 'black';
		this.ctx.lineCap = 'round';

		this.max_ratio = 1.6;
		this.min_ratio = 1.38;		
		this.max_angle = Math.PI/2;
		this.angle = Math.PI/5;
		
		this.max_order = 12;
		this.max_color = 8;
		
		this.order_colors = Gradient("#e4d700","#126845",this.max_color);
		this.start_length = this.canvas.height/3.5;
		this.start_width = 30;	

		// actually initialize the canvas
		this.draw();
		this.canvas.animate();
	}	

	update(pos){
		this.canvas.clear();		
		this.updateAngle(pos);
		this.updateRatio(pos);
		this.draw();		
	}

	updateAngle(pos){
		let x = -Math.abs(pos.x - (this.canvas.width/2)),
			y = (pos.y - (this.canvas.height-this.start_length));
		this.angle = (Math.PI/2) - Math.atan(y/x);
	}

	updateRatio(pos){
		let x = pos.x - (this.canvas.width/2),
			y = pos.y - (this.canvas.height-this.start_length),
			d = Math.min(1,Math.sqrt((x*x)+(y*y))/(this.canvas.width/2));
		this.ratio = ((this.max_ratio-this.min_ratio)*(1-d)) + this.min_ratio;		
	}

	draw(){				
		// fill the canvas background, add opacity
		this.ctx.globalCompositeOperation = "lighter";
		this.ctx.globalAlpha = 0.98;
		this.ctx.fillStyle = 'transparent';
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.width);

		// draw the trunk of the tree.
		this.ctx.save();
			this.ctx.translate(this.canvas.width/2, this.canvas.height);

			//actually draw the trunk.
			this.ctx.strokeStyle = this.order_colors[0];
			this.drawBranch(this.start_length,this.start_width);		
			
			this.ctx.save();
				this.ctx.translate(0,-this.start_length);
				this.drawBranches(1);
			this.ctx.restore();		
			
		this.ctx.restore();
	}

	drawBranch(length, width){
		this.ctx.lineWidth = (!width || width<1)?1:width;
		this.ctx.beginPath();  
		this.ctx.moveTo(0,0);
		this.ctx.lineTo(0,-length);
		this.ctx.stroke();
	}

	drawBranches(order){
		let ratio = Math.pow(this.ratio,order);
		let new_length = this.start_length/ratio;
		let new_width = this.start_width/ratio;
		
		if(new_length < 3 || order > this.max_order){
			return;
		}
		
		this.ctx.strokeStyle = this.order_colors[Math.floor(order)];	

		//draw the right branch
		this.ctx.save();
			this.ctx.rotate(this.angle);
		
			this.drawBranch(new_length,new_width);
		
			this.ctx.save();
				this.ctx.translate(0,-new_length);
				this.drawBranches(order+1);
			this.ctx.restore();
			
		this.ctx.restore();
		
		
		//draw the left branch
		this.ctx.save();
			this.ctx.rotate(-this.angle);
		
			this.drawBranch(new_length,new_width);
		
			this.ctx.save();
				this.ctx.translate(0,-new_length);
				this.drawBranches(order+1)
			this.ctx.restore();
		
		this.ctx.restore();
	}
}

function Gradient(stop1_hex, stop2_hex, num){
	// stop1 and stop2 must be strings that rep hex color vals.
	stop1_hex = stop1_hex.replace("#","").toUpperCase();
	stop2_hex = stop2_hex.replace("#","").toUpperCase();
	
	var stops = new Array(num),
		stop1_rgb = {r:0,g:0,b:0},
		stop2_rgb = {r:0,g:0,b:0},
		steps = {r:0,g:0,b:0},
		i,r,g,b;
	
	//parse the two input strings into rgb values
	stop1_rgb.r = parseInt(stop1_hex.substr(0,2),16);
	stop1_rgb.g = parseInt(stop1_hex.substr(2,2),16);
	stop1_rgb.b = parseInt(stop1_hex.substr(4,2),16);
	
	stop2_rgb.r = parseInt(stop2_hex.substr(0,2),16);
	stop2_rgb.g = parseInt(stop2_hex.substr(2,2),16);
	stop2_rgb.b = parseInt(stop2_hex.substr(4,2),16);
	
	steps.r = (stop2_rgb.r - stop1_rgb.r)/num;
	steps.g = (stop2_rgb.g - stop1_rgb.g)/num;
	steps.b = (stop2_rgb.b - stop1_rgb.b)/num;
	
	stops[0] = "#"+stop1_hex;
	
	for(i=1; i<num-1; i++){
		r = Math.round(stop1_rgb.r+(i*steps.r)).toString(16);
		g = Math.round(stop1_rgb.g+(i*steps.g)).toString(16);
		b = Math.round(stop1_rgb.b+(i*steps.b)).toString(16);
		
		r = (r.length != 2)?"0"+r:r;
		g = (g.length != 2)?"0"+g:g;
		b = (b.length != 2)?"0"+b:b;
		
		stops[i] = "#"+(r+g+b).toUpperCase();
	}
	
	stops[num-1] = "#"+stop2_hex;
	return stops;
}

var fractalTree = new FractalTree('canvas');


/* Parallax */
let controller = new ScrollMagic.Controller();
let timeline = new TimelineMax();

timeline
    .to('.OR', 4, {y: 50})
    .to('.nurse', 5, {y: 40}, '-=2')
    .to('.TB2', 6, {y: 20}, '-=4')
    .to('.TB1', 6, {y: 20}, '-=3')
    .to('.covid1', 6, {y: 10}, '-=4')
    .to('.covid2', 6, {y: 10}, '-=4');

let scene = new ScrollMagic.Scene({
    triggerElement: "nextContent",
    duration: "100%",
    triggerHook: 0,
})
    .setTween(timeline)
    .setPin("nextContent")
    .addTo(controller)
