let colors;
let cellSize = 38;
let cols, rows;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
  rectMode(CORNER);
  ellipseMode(CENTER);
  strokeWeight(3);
  colors = [
    color('#FF595E'),
    color('#FFCA3A'),
    color('#8AC926'),
    color('#1982C4'),
    color('#6A4C93'),
    color('#FF9F1C')
  ];

  cols = ceil(width / cellSize);
  rows = ceil(height / cellSize);

  background('#0B1D3A'); // dark blue background

  drawGrid();
}

function drawGrid() {
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      let x = i * cellSize;
      let y = j * cellSize;
      drawCell(x, y, cellSize);
    }
  }
}

function drawCell(x, y, size) {
  push();
  translate(x, y);
  let c = random(colors);
  stroke(c);
  noFill();
  let type = floor(random(6));

  switch (type) {
    case 0: drawSpiral(size); break;
    case 1: drawConcentricCircles(size); break;
    case 2: drawQuarterLines(size); break;
    case 3: drawDiagonalLines(size); break;
    case 4: drawCrossPattern(size); break;
    case 5: drawNestedSquares(size); break;
  }
  pop();
}

function drawSpiral(s) {
  let steps = 5;
  for (let i = 0; i < steps; i++) {
    rect(s/2 - i*(s/10), s/2 - i*(s/10), i*2*(s/10), i*2*(s/10));
  }
}

function drawConcentricCircles(s) {
  let steps = 4;
  for (let i = 0; i < steps; i++) {
    ellipse(s/2, s/2, s - i*10, s - i*10);
  }
}
function drawQuarterLines(s) {
  for (let i = 0; i < s; i+=6) {
    line(0, i, i, 0);
  }
}
function drawDiagonalLines(s) {
  for (let i = 0; i < s; i+=6) {
    line(i, 0, s, i);
  }
}
function drawCrossPattern(s) {
  line(0, 0, s, s);
  line(s, 0, 0, s);
  line(s/2, 0, s/2, s);
  line(0, s/2, s, s/2);
}
function drawNestedSquares(s) {
  let steps = 5;
  for (let i = 0; i < steps; i++) {
    rect(i*5, i*5, s - i*10, s - i*10);
  }
}