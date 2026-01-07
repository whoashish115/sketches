let palette;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
  angleMode(DEGREES);

  // Dark orange + fire palette
  palette = [
    color(120, 30, 0),   // deep burnt
    color(180, 50, 0),   // dark orange
    color(255, 80, 0),   // bright orange
    color(255, 140, 0),  // amber
    color(255, 200, 40), // golden
    color(200, 40, 20)   // deep red-orange
  ];
}

function draw() {
  drawBackground();

  // BIG soft glowing circles
  for (let i = 0; i < 20; i++) {
    drawGradientCircle(
      random(width),
      random(height),
      random(150, 320)
    );
  }

  // MEDIUM circles
  for (let i = 0; i < 40; i++) {
    drawGradientCircle(
      random(width),
      random(height),
      random(60, 160)
    );
  }

  // ARC FLOW (more dramatic)
  for (let i = 0; i < 140; i++) {
    drawArcFlow(
      random(width),
      random(height),
      random(50, 220)
    );
  }
}

// 🔥 BACKGROUND (vertical + radial blend)
function drawBackground() {
  // vertical gradient
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(
      color(80, 20, 0),
      color(255, 120, 0),
      inter
    );
    stroke(c);
    line(0, y, width, y);
  }

  // radial glow overlay
  for (let r = width; r > 0; r -= 10) {
    let alpha = map(r, 0, width, 0, 80);
    noStroke();
    fill(255, 120, 0, alpha);
    ellipse(width / 2, height / 2, r);
  }
}

// 🟠 GRADIENT CIRCLE (stronger glow)
function drawGradientCircle(x, y, size) {
  let c1 = random(palette);
  let c2 = random(palette);

  for (let r = size; r > 0; r -= 2) {
    let inter = map(r, 0, size, 0, 1);
    let c = lerpColor(c1, c2, inter);

    stroke(red(c), green(c), blue(c), 180);
    strokeWeight(2);

    fill(red(c), green(c), blue(c), 25);

    ellipse(x, y, r);
  }
}

// 🌙 ARC FLOW (fire wave style)
function drawArcFlow(x, y, size) {
  push();
  translate(x, y);
  rotate(random(360));

  let c1 = random(palette);
  let c2 = color(255, 200, 100); // highlight glow

  let start = random(360);
  let end = start + random(80, 200);

  for (let r = size; r > 0; r -= 3) {
    let inter = map(r, 0, size, 0, 1);
    let c = lerpColor(c1, c2, inter);

    stroke(red(c), green(c), blue(c), 200);
    strokeWeight(2);
    noFill();

    arc(0, 0, r, r, start, end);
  }

  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}