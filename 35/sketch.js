let t = 0;

let bubbles = [];
let fractals = [];

const BUBBLE_COUNT = 500;
const FRACTAL_COUNT = 100;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSL);
  background(0);

  for (let i = 0; i < BUBBLE_COUNT; i++) {
    bubbles.push({
      x: random(width),
      y: random(height),
      r: random(2, 10),
      speed: random(0.5,1),
      drift: random(-3, 3),
      hue: random(180, 300)
    });
  }

  for (let i = 0; i < FRACTAL_COUNT; i++) {
    fractals.push({
      x: random(width),
      y: random(height),
      scale: random(0.3, 0.9),
      rotSpeed: random(-0.01, 0.01),
      angle: random(TWO_PI),
      hueShift: random(360)
    });
  }
}

function draw() {
  noStroke();
  fill(0, 0, 0, 0.25);
  rect(0, 0, width, height);

  drawBubbles();

  for (let f of fractals) {
    f.x += sin(t + f.hueShift) * 0.3;
    f.y += cos(t + f.hueShift) * 0.3;

    drawFractal(f);
  }

  t += 0.015;
}

function drawBubbles() {
  noStroke();

  for (let b of bubbles) {
    b.y -= b.speed;
    b.x += sin(t + b.y * 0.01) * b.drift;

    if (b.y < -10) {
      b.y = height + 10;
      b.x = random(width);
    }
push();

drawingContext.shadowBlur = 20; 

drawingContext.shadowColor = `hsla(${b.hue}, 80%, 70%, 0.8)`;

fill(b.hue, 80, 70, 0.6);
circle(b.x, b.y, b.r);

pop();
  }
}

function drawFractal(f) {
  push();
  translate(f.x, f.y);
  rotate(f.angle + t * f.rotSpeed);
  scale(f.scale);

  let sides = 5;

  for (let i = 0; i < sides; i++) {
    drawBranch(0, f.hueShift);
    rotate(TWO_PI / sides);
  }

  pop();
}

function drawBranch(level, hueShift) {
  if (level > 5) return;

  let len = 90 * pow(0.72, level);

  let hue = (t * 60 + level * 35 + hueShift) % 360;
  stroke(hue, 100, 65);
  strokeWeight(2 * pow(0.75, level));

  line(0, 0, len, 0);

  for (let i = 0; i < 2; i++) {
    push();
    translate(len, 0);

    let angle = 0.5 + sin(t + level) * 0.25;
    rotate(i === 0 ? angle : -angle);
    scale(0.75);

    drawBranch(level + 1, hueShift);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}