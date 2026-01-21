let rings = [];
let leaves = [];
let shrubs = [];
let THEME = [
  '#0b1e2d','#12344d','#1b4965','#2c699a',
  '#5fa8d3','#89c2d9','#bee9e8','#e0fbfc'
];
function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(2);
  noStroke();
  generateScene();
  noLoop();
}

function draw() {
  background(220, 226, 249);
  drawLeafBackground();
  drawShrubBackground();

  for (let r of rings) drawRing(r);
}

function generateScene() {
  rings = [];
  leaves = [];
  shrubs = [];
  let total = 30;
  let sx = width / 7;
  let sy = height / 4;

  for (let x = sx/2; x <= width; x += sx) {
    for (let y =sy/2; y <= height; y += sy) {
      for (let i = 0; i < total; i++) {
        rings.push({
          cx: x,
          cy: y,
          radius: map(i, 0, total, 30, min(width, height) * 0.1),
          thickness: 12,
          waveAmp: 8,
          waveFreq: 5,
          phase: random(TWO_PI),
          color: color(THEME[i % THEME.length])
        });
      }
    }
  }

  let leafCount = 120;
  for (let i = 0; i < leafCount; i++) {
    leaves.push({
      x: random(width),
      y: random(height * 0.05, height * 0.95),   // spread all over
      size: random(18, 48),
      rot: random(TWO_PI),
      color: color(THEME[floor(random(THEME.length))])
    });
  }

  let shrubCount = 80;
  for (let i = 0; i < shrubCount; i++) {
    shrubs.push({
      x: random(width),
      y: random(height),  // bottom area only
      w: random(50, 100),
      h: random(2, 4),
       rot: random(TWO_PI),
      color: color(THEME[floor(random(THEME.length))])
    });
  }
}

function drawLeafBackground() {
  for (let l of leaves) {
    push();
    translate(l.x, l.y);
    rotate(l.rot);
    fill(l.color);
    drawLeafShape(0, 0, l.size, l.size * 0.35);
    pop();
  }
}
function drawShrubBackground() {
  for (let s of shrubs) {
    push();
    translate(s.x, s.y);
    fill(s.color);
rotate(s.rot);
    let bumps = 60;
    for (let i = 0; i < bumps; i++) {
      let t = i / (bumps - 1);
      let x = lerp(-s.w * 0.5, s.w * 0.5, t);
      let r = s.h * 0.95;

      ellipse(x, 0, r * 1.25, r);
      ellipse(x + 5, -r * 0.18, r, r * 0.9);
    }
    pop();
  }
}
function drawLeafShape(x, y, len, w) {
  let topY = y - len * 0.5;
  let botY = y + len * 0.5;
  let cpY1 = y - len * 0.3;
  let cpY2 = y + len * 0.3;

  beginShape();
  vertex(x, topY);
  bezierVertex(x + w, cpY1, x + w, cpY2, x, botY);
  bezierVertex(x - w, cpY2, x - w, cpY1, x, topY);
  endShape(CLOSE);
  noStroke();
}

function drawRing(cfg) {
  fill(cfg.color);
  beginShape();

  let steps = 400;

  for (let i = 0; i < steps+5; i++) {
    let t = i / steps;
    let a = t * TWO_PI;
    let wave = sin(a * cfg.waveFreq + cfg.phase) * cfg.waveAmp;
    let r = cfg.radius + cfg.thickness + wave;

    vertex(
      cfg.cx + cos(a) * r,
      cfg.cy + sin(a) * r
    );
  }

  for (let i = steps+5; i >= 0; i--) {
    let t = i / steps;
    let a = t * TWO_PI;
    let wave = sin(a * cfg.waveFreq + cfg.phase) * cfg.waveAmp;
    let r = cfg.radius - cfg.thickness + wave;

    vertex(
      cfg.cx + cos(a) * r,
      cfg.cy + sin(a) * r
    );
  }

  endShape(CLOSE);
}

