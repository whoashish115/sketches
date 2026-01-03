let colors = [
  '#0b3d2e',
  '#1f7a4d',
  '#4caf50',
  '#cddc39',
  '#ffeb3b', 
  '#00e5ff', 
  '#00bcd4',
  '#1565c0'  
];
let pos = [];

function setup() {
	createCanvas(windowWidth, windowHeight);
	rectMode(CENTER);
	background(0);
	blendMode(ADD);
  
  let c = 60;
	let w = width / c;
	for (let i = 0; i < c; i++) {
		for (let j = 0; j < c; j++) {
			let x = i * w;
			let y = j * w;
			let d = w * random(0.1, 1);
			let alph = int(random(256));
			let clr1 = color(random(colors));
			let clr2 = color(random(colors));
			clr1.setAlpha(alph);
			clr2.setAlpha(alph);
			noStroke();
			fill(clr1);
			circle(x, y, d);
			fill(clr2);
			circle(x, y, d * 0.5);
			pos.push(createVector(x, y));
		}
	}

	for (let i of pos) {
		curve(i.x, i.y, random(random(random(random(windowWidth/2)))));
	}

}
function curve(x, y, num) {
	let px = x;
	let py = y;
	let alph = int(random(random(50)));
	let flclr = color(random(colors));
	let stclr = color(random(colors));
	flclr.setAlpha(alph);
	stclr.setAlpha(alph);
	let rnd = int(random(3));
	let sw = random(random()) * random(0.01, 0.001) * width;

	fill(flclr);
	stroke(stclr);
	strokeWeight(sw);
	if (rnd == 1) {
		noStroke();
	} else if (rnd == 2) {
		noFill();
	}

	beginShape();

	for (let i = 0; i < num; i++) {
		let a = 800 * noise(x / 600, y / 600);
		vertex(x, y);
		line(px, py, x, y);
		x += cos(a);
		y += sin(a);
	}

	endShape();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
 setup()
}