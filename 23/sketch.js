let palette;

function setup() {
  createCanvas(windowWidth, windowHeight);
  palette = [
    color(59, 162, 44),   // Green
    color(241, 90, 36),   // Orange
    color(255, 255, 255), // White
    color(20, 20, 20)     // Black/Dark Gray
  ];

  noLoop();
}

function draw() {
  background(15);
  for (let i = 0; i < 60; i++) {
    let x = random(-100, width + 100);
    let y = random(-100, height + 100);
    let size = random(80, 250);
    drawOrganicShell(x, y, size);
  }
  applyGrain(25); 
}

function drawOrganicShell(x, y, maxSize) {
  push();
  translate(x, y);
  rotate(random(TWO_PI));

  let segments = floor(random(80, 150));
  let angleStep = random(0.1, 0.25);
  let growth = random(1.01, 1.05);

  for (let i = 0; i < segments; i++) {
    let r = pow(growth, i) * (maxSize / 10);
    let angle = i * angleStep;
    
    let posX = cos(angle) * r;
    let posY = sin(angle) * r;

    let colIdx = floor(map(sin(i * 0.1), -1, 1, 0, 3));
    let col = palette[colIdx];
    fill(red(col), green(col), blue(col), 200);
    stroke(0, 50);  
    
    push();
    translate(posX, posY);
    rotate(angle + PI / 2);
    
    beginShape();
    vertex(0, 0);
    vertex(r * 0.5, r * 0.2);
    vertex(r * 0.6, 0);
    vertex(r * 0.5, -r * 0.2);
    endShape(CLOSE);
    pop();

    if (i % 40 === 0 && i > 0) {
      drawMiniSpiral(posX, posY, r * 0.3);
    }
  }
  pop();
}

function drawMiniSpiral(x, y, s) {
  push();
  translate(x, y);
  noFill();
  stroke(255, 150);
  strokeWeight(0.5);
  beginShape();
  for (let a = 0; a < TWO_PI * 3; a += 0.1) {
    let r = (a / TWO_PI) * s;
    vertex(cos(a) * r, sin(a) * r);
  }
  endShape();
  pop();
}
function applyGrain(intensity) {
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    let grain = random(-intensity, intensity);
    pixels[i] = pixels[i] + grain;     // R
    pixels[i + 1] = pixels[i + 1] + grain; // G
    pixels[i + 2] = pixels[i + 2] + grain; // B
  }
  updatePixels();
}