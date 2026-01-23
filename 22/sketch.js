let blobs = [];
let BG = '#050805';

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(2);
  noStroke();
  noiseDetail(5, 0.5);
  generateScene();
  noLoop();
}

function draw() {
  background(BG);
  drawAmbientGlow();
  for (let b of blobs) drawBlob(b);
}

function generateScene() {
  blobs = [];

  const count = floor(random(150, 300));


  for (let i = 0; i < count; i++) {
    blobs.push({
      x: random(-width * 0.1, width * 1.1),
      y: random(-height * 0.1, height * 1.1),
      w: random(width * 0.12, width * 0.42),
      h: random(height * 0.10, height * 0.38),
      rot: random(-PI, PI),
      seed: random(1000),
      wobble: random(1.2, 3.8),
      alpha: random(0.45, 0.95),
      shadowBlur: random(18, 90),
      shadowX: random(-15, 18),
      shadowY: random(12, 40),
      layer: i,
      greenTone: random([
        [90, 255, 130],
        [40, 220, 110],
        [20, 140, 70],
        [10, 80, 40],
        [160, 255, 180]
      ])
    });
  }
  blobs.sort((a, b) => (a.w * a.h) - (b.w * b.h));
}

function drawBlob(b) {
  const ctx = drawingContext;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.75)';
  ctx.shadowBlur = b.shadowBlur;
  ctx.shadowOffsetX = b.shadowX;
  ctx.shadowOffsetY = b.shadowY;

  push();
  translate(b.x, b.y);
  rotate(b.rot);

  beginShape();
  const steps = 80;

  for (let i = 0; i < steps + 3; i++) {
    const a = map(i, 0, steps, 0, TWO_PI);

    const nx = cos(a) * b.wobble + b.seed;
    const ny = sin(a) * b.wobble + b.seed * 1.3;
    const n = noise(nx, ny);

    const bulge = 0.68 + n * 0.72 + sin(a * 3.0 + b.seed) * 0.08;
    const rx = cos(a) * b.w * 0.5 * bulge;
    const ry = sin(a) * b.h * 0.5 * bulge;

    curveVertex(rx, ry);
  }
  endShape(CLOSE);

  const g = ctx.createLinearGradient(
    -b.w * 0.5, -b.h * 0.5,
    b.w * 0.5, b.h * 0.5
  );

  const [r, g1, b1] = b.greenTone;
  g.addColorStop(0, `rgba(${r}, ${g1}, ${b1}, ${b.alpha})`);
  g.addColorStop(0.45, `rgba(${Math.max(0, r - 45)}, ${Math.max(0, g1 - 70)}, ${Math.max(0, b1 - 40)}, ${b.alpha * 0.95})`);
  g.addColorStop(1, `rgba(0, 0, 0, ${Math.min(0.95, b.alpha + 0.15)})`);

  ctx.fillStyle = g;
  ctx.fill();

  pop();
  ctx.restore();
}

function drawAmbientGlow() {
  const ctx = drawingContext;
  for (let i = 0; i < 5; i++) {
    const gx = random(width * 0.2, width * 0.8);
    const gy = random(height * 0.2, height * 0.8);
    const gr = random(width * 0.15, width * 0.42);

    const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
    glow.addColorStop(0, 'rgba(50, 255, 120, 0.08)');
    glow.addColorStop(0.4, 'rgba(20, 120, 60, 0.05)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = glow;
    rect(0, 0, width, height);
  }

  const vignette = ctx.createRadialGradient(
    width * 0.5, height * 0.5, min(width, height) * 0.10,
    width * 0.5, height * 0.5, max(width, height) * 0.82
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.7, 'rgba(0,0,0,0.10)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.75)');

  ctx.fillStyle = vignette;
  rect(0, 0, width, height);
}

function mousePressed() {
  generateScene();
  redraw();
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    generateScene();
    redraw();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateScene();
  redraw();
}