let t = 0;

let rows = 6;
let cols = 10;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(RADIANS);
  background(0);
}

function draw() {

  background(0);

  blendMode(ADD);

  t += 1;

  let spacingX = width / (cols - 1);
  let spacingY = height / (rows - 1);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {

      let x = i * spacingX;
      let y = j * spacingY;

      for (let k = 0; k < 4; k++) {
        let angle = (k / 4) * TWO_PI + (t * 0.005);
        drawBranch(x, y, 45, angle, 5, i + j);
      }
    }
  }

  blendMode(BLEND);
}

function drawLeaf(x, y, angle, it) {
  let pulse = sin(t * 0.05) * 5;

  push();
  translate(x, y);
  rotate(angle);

  noStroke();

  drawingContext.shadowBlur = 15;
  drawingContext.shadowColor = "#ff0000";

  fill(255, 0, 0);

  beginShape();
  vertex(0, 0);
  vertex(8 + pulse, -3);
  vertex(15 + pulse, 0);
  vertex(8 + pulse, 3);
  endShape(CLOSE);

  pop();
}

function drawBranch(x, y, len, angle, depth, it) {
  if (depth === 0) {
    drawLeaf(x, y, angle, it);
    return;
  }

  let bend = sin(t * 0.02 + it) * 0.4;

  let x2 = x + cos(angle + bend) * len;
  let y2 = y + sin(angle + bend) * len;

  let col = depth > 2 ? color(255) : color(255, 0, 0);

  stroke(col);
  strokeWeight(depth * 0.6);

  drawingContext.shadowBlur = 6;
  drawingContext.shadowColor = col;

  line(x, y, x2, y2);

  let newLen = len * 0.7;

  drawBranch(x2, y2, newLen, angle - 0.6, depth - 1, it);
  drawBranch(x2, y2, newLen, angle + 0.6, depth - 1, it);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}