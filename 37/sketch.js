let t = 0;
let items = [];
let grid = new Map();

const palette = [
  "#ff6b81",
  "#ff8fa3",
  "#ffb4a2",
  "#ffcdb2",
  "#ffe5d9",
  "#ff99ac"
];
const ITEM_COUNT = 300;
const CELL_SIZE = 260;
const CONNECT_DIST = 200;
function setup() {
  createCanvas(windowWidth, windowHeight);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  colorMode(RGB, 255);
  buildItems();
}

function buildItems() {
  items = [];
  for (let i = 0; i < ITEM_COUNT; i++) {
    items.push({
      x: random(width),
      y: random(height),
      type: floor(random(4)),        

      size: random(28, 110),
      rot: random(TWO_PI),
      speed: random(0.002, 0.01),
      sides: floor(random(4, 9)),    

      amp: random(8, 30),
      seed: random(1000),
      col: color(random(palette))
    });
  }
}

function draw() {
  background(18);
drawDottedBG(); 
  grid = new Map();

  for (let i = 0; i < items.length; i++) {
    let it = items[i];
    let p = movedPos(it);

    let gx = floor(p.x / CELL_SIZE);
    let gy = floor(p.y / CELL_SIZE);
    let key = gx + "," + gy;

    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(i);

    push();
    translate(p.x, p.y);
    rotate(it.rot + sin(t * 0.4 + it.seed) * 0.2);

    if (it.type === 0) drawSoftPolygon(it);
    else if (it.type === 1) drawBorderPolygon(it);
    else if (it.type === 2) drawRibbon(it);
    else drawCapsule(it);

    pop();
  }

  drawConnections();

  t += 0.01;
}

function movedPos(it) {
  let dx = sin(t + it.seed + it.y * 0.01) * it.amp;
  let dy = cos(t * 1.1 + it.seed * 1.3 + it.x * 0.01) * it.amp;
  return {
    x: it.x + dx,
    y: it.y + dy
  };
}

function drawSoftPolygon(it) {
  let c = it.col;
  let n = it.sides;
  let r = it.size;

  noStroke();
  fill(red(c), green(c), blue(c));

  beginShape();
  for (let k = 0; k < n + 3; k++) {
    let a = (TWO_PI / n) * (k % n);
    let wobble = sin(a * 3 + t * 2 + it.seed) * r * 0.12;
    let rr = r * 0.65 + wobble;
    curveVertex(cos(a) * rr, sin(a) * rr);
  }
  endShape(CLOSE);

  noFill();
  stroke(255, 210);
  strokeWeight(2);
  beginShape();
  for (let k = 0; k < n + 3; k++) {
    let a = (TWO_PI / n) * (k % n);
    let wobble = sin(a * 3 + t * 2 + it.seed) * r * 0.12;
    let rr = r * 0.65 + wobble;
    curveVertex(cos(a) * rr, sin(a) * rr);
  }
  endShape(CLOSE);
}

function drawBorderPolygon(it) {
  let c = it.col;
  let n = it.sides;
  let r = it.size * 0.8;

  noFill();
  stroke(c);
  strokeWeight(3);

  beginShape();
  for (let k = 0; k < n + 3; k++) {
    let a = (TWO_PI / n) * (k % n);
    let wobble = sin(a * 2 + t + it.seed) * r * 0.10;
    let rr = r + wobble;
    curveVertex(cos(a) * rr, sin(a) * rr);
  }
  endShape(CLOSE);

  noStroke();
  fill(c);
  circle(0, 0, it.size * 0.18);
}

function drawRibbon(it) {
  let c = it.col;

  noFill();
  stroke(c);
  strokeWeight(3);

  beginShape();
  for (let a = -PI; a <= PI + 0.3; a += 0.22) {
    let x = a * it.size * 0.28;
    let y = sin(a * 2 + t * 2 + it.seed) * it.size * 0.18;
    curveVertex(x, y);
  }
  endShape();

  stroke(255, 200);
  strokeWeight(1.2);
  beginShape();
  for (let a = -PI; a <= PI + 0.3; a += 0.22) {
    let x = a * it.size * 0.22;
    let y = sin(a * 2 + t * 2 + it.seed) * it.size * 0.10;
    curveVertex(x, y);
  }
  endShape();
}
function drawDottedBG() {
  let spacing = 15;   

  let size = 4;       

  noStroke();
  fill(255, 80);      

  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      circle(x, y, size);
    }
  }
}

function drawCapsule(it) {
  let c = it.col;
  let r = it.size;

  stroke(c);
  strokeWeight(3);
  fill(red(c), green(c), blue(c));

  beginShape();
  for (let a = 0; a < TWO_PI + 0.4; a += 0.18) {
    let rx = r * (0.9 + 0.18 * sin(a * 3 + t + it.seed));
    let ry = r * (0.55 + 0.15 * cos(a * 2 + t + it.seed));
    curveVertex(cos(a) * rx, sin(a) * ry);
  }
  endShape(CLOSE);

  noFill();
  stroke(255, 190);
  strokeWeight(1.5);
  beginShape();
  for (let a = 0; a < TWO_PI + 0.4; a += 0.18) {
    let rx = r * (0.9 + 0.18 * sin(a * 3 + t + it.seed));
    let ry = r * (0.55 + 0.15 * cos(a * 2 + t + it.seed));
    curveVertex(cos(a) * rx, sin(a) * ry);
  }
  endShape(CLOSE);
}

function drawConnections() {
  let maxDistSq = CONNECT_DIST * CONNECT_DIST;

  for (let i = 0; i < items.length; i++) {
    let a = movedPos(items[i]);
    let gx = floor(a.x / CELL_SIZE);
    let gy = floor(a.y / CELL_SIZE);

    for (let xx = gx - 1; xx <= gx + 1; xx++) {
      for (let yy = gy - 1; yy <= gy + 1; yy++) {
        let bucket = grid.get(xx + "," + yy);
        if (!bucket) continue;

        for (let j of bucket) {
          if (j <= i) continue;

          let b = movedPos(items[j]);
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          let dSq = dx * dx + dy * dy;

          if (dSq < maxDistSq) {
            let d = sqrt(dSq);
            let alpha = map(d, 0, CONNECT_DIST, 140, 0);

            stroke(255, 255, 255, alpha);
            strokeWeight(1.2);
            line(a.x, a.y, b.x, b.y);
          }
        }
      }
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  buildItems();
}