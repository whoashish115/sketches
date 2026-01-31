let colors = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  noLoop();
  generateNewPalette();
}

function draw() {
  background(colors[0]);
  let startSize = max(width, height);
  subdivide(width / 2, height / 2, startSize, 0);
}

function subdivide(x, y, s, depth) {
  let maxDepth = 5;
  let splitProb = map(depth, 0, maxDepth, 0.95, 0.1);

  if (depth < maxDepth && random() < splitProb) {
    let newS = s / 2;
    let off = s / 4;
    subdivide(x - off, y - off, newS, depth + 1);
    subdivide(x + off, y - off, newS, depth + 1);
    subdivide(x - off, y + off, newS, depth + 1);
    subdivide(x + off, y + off, newS, depth + 1);
  } else {
    drawCell(x, y, s);
  }
}

function drawCell(x, y, s) {
  push();
  translate(x, y);
  let bg = random(colors);
  fill(bg);
  noStroke();
  rect(0, 0, s, s);

  let fg = random(colors.filter(c => c !== bg));
  fill(fg);
  
  let type = floor(random(8));
  let inner = s * 0.8; 
  switch (type) {
    case 0: ellipse(0, 0, inner); break;
    case 1: drawStar(0, 0, inner/2, inner/4, floor(random(5, 12))); break;
    case 2: drawSawtooth(inner); break;
    case 3: 
      rotate(QUARTER_PI);
      rect(0, 0, inner * 0.7, inner * 0.7); 
      break;
    case 4: ellipse(0, 0, inner * 0.2); break;
    case 5: 
      triangle(-inner/2, -inner/2, inner/2, -inner/2, 0, 0);
      triangle(-inner/2, inner/2, inner/2, inner/2, 0, 0);
      break;
    case 6: // Grid of dots
      let dotS = inner / 3;
      for(let i = -1; i <= 1; i++) {
        for(let j = -1; j <= 1; j++) {
          ellipse(i * dotS, j * dotS, dotS * 0.5);
        }
      }
      break;
  }
  pop();
}

function generateNewPalette() {
  colors = [];
  for (let i = 0; i < 5; i++) {
    colors.push(color(random(255), random(120), random(255)));
  }
  colors.push(random() > 0.5 ? color(20) : color(250));
}

function drawStar(x, y, r1, r2, n) {
  let angle = TWO_PI / n;
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * r2;
    let sy = y + sin(a) * r2;
    vertex(sx, sy);
    sx = x + cos(a + angle/2) * r1;
    sy = y + sin(a + angle/2) * r1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

function drawSawtooth(s) {
  let steps = floor(random(3, 6));
  let w = s / steps;
  for (let i = 0; i < steps; i++) {
    let px = -s / 2 + i * w;
    triangle(px, -s / 2, px + w, -s / 2, px + w / 2, s / 2);
  }
}

// Adjust canvas if user resizes window
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}

// Refresh logic
function mousePressed() {
  generateNewPalette();
  redraw();
}