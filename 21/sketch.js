let rings = [];
let leaves = [];
let shrubs = [];
let THEME = [
  '#1e2a38','#2a3f5f','#3b5b92','#5c7cfa',
  '#91a7ff','#bac8ff','#dbe4ff','#edf2ff'
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

let totalFlowers = 80;
let noiseScale = 0.005;

for (let f = 0; f < totalFlowers; f++) {

  let x = random(width);
  let y = random(height);

  let baseNoise = noise(x * noiseScale, y * noiseScale);

  let petals = floor(map(baseNoise, 0, 1, 6, 14));
  let size = map(baseNoise, 0, 1, 40, 140);

  for (let i = 0; i < petals; i++) {

    let angle = map(i, 0, petals, 0, TWO_PI);

    let n = noise(
      x * noiseScale,
      y * noiseScale,
      i * 0.2
    );

    let r = size * (0.6 + n * 0.6);

    rings.push({
      cx: x + cos(angle) * r * 0.3,
      cy: y + sin(angle) * r * 0.3,

      radius: r,

      thickness: map(n, 0, 1, 6, 14),

      waveAmp: map(n, 0, 1, 4, 10),
      waveFreq: floor(map(n, 0, 1, 3, 7)),

      phase: map(n, 0, 1, 0, TWO_PI),

      color: color(THEME[floor(random(THEME.length))])
    });
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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateScene();
  redraw();
}