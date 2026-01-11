let colors;
let shapeCount = 600;
let lineCount = 300;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
  angleMode(DEGREES);

  colors = ['#000', '#e8c22a', '#4f2001', '#FFA500', '#B22222', '#CD853F', '#FF7F50'];

  background(255);
  drawChaos();
}

function drawChaos() {
  for (let i = 0; i < shapeCount; i++) {
    let x = random(width);
    let y = random(height);
    let w = random(20, 150);
    let h = random(20, 150);
    let angle = random(360);
    let idx = floor(random(colors.length));
    let c = color(colors[idx]);
    let fillShape = random() < 0.6; // 60% chance to fill

    push();
    translate(x, y);
    rotate(angle);

    if (fillShape) {
      fill(c);
      stroke(0);
      strokeWeight(random(1, 3));
    } else {
      noFill();
      stroke(c);
      strokeWeight(random(0.5, 4));
    }

    let shapeType = floor(random(4)); // 0=triangle,1=square,2=arc,3=3D-like square
    switch (shapeType) {
      case 0:
        triangle(random(3*w), random( 3*h),
                 random(3*w), random(3*h),
                 random(w), random(3*h));
        break;
      case 1:
        rectMode(CENTER);
        rect(0, 0, random(2*w), random(2*h));
        break;
      case 2:
        arc(0, 0, random(2*w), random(2*w), random(360), random(360, 720));
        break;
      case 3:
        let dx = random(-10, 10);
        let dy = random(-10, 10);
        rect(-dx, -dy, random(10, w), random(10, h));
        rect(0, 0, random(10, w), random(10, h));
        line(-w/2, -h/2, w/2, -h/2);
        line(w/2, -h/2, w/2, h/2);
        line(-w/2, -h/2, -w/2, h/2);
        break;
    }
    pop();
  }

  for (let i = 0; i < lineCount; i++) {
    stroke(colors[floor(random(colors.length))]);
    strokeWeight(random(0.5, 5));
    line(random(width), random(height), random(width), random(height));
  }

  for (let i = 0; i < 40; i++) {
    noFill();
    stroke(255, random(100, 200));
    strokeWeight(random(1, 5));
    beginShape();
    for (let j = 0; j < 6; j++) {
      curveVertex(random(width), random(height));
    }
    endShape();
  }

  for (let i = 0; i < 300; i++) {
    let x = random(width);
    let y = random(height);
    let s = random(5, 20);
    stroke(0);
    strokeWeight(random(0.5, 2));
    noFill();
    rect(x, y, s, s);
  }
}