let palette;

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(2);
  smooth();
  noLoop();
  noiseDetail(4, 0.55);

  palette = [
    color(23, 179, 150), // Green
    color(56, 106, 255)  // Blue
  ];
}

function draw() {
  drawBackground();

  // Soft coverage blobs first, so nothing feels empty
  for (let i = 0; i < 42; i++) {
    let x = random(-width * 0.2, width * 1.2);
    let y = random(-height * 0.2, height * 1.2);
    let size = random(min(width, height) * 0.18, min(width, height) * 0.7);
    drawCoverBlob(x, y, size, random(palette), random(palette));
  }

  // Main spiral ribbons
  for (let i = 0; i < 72; i++) {
    let x = random(-width * 0.25, width * 1.25);
    let y = random(-height * 0.25, height * 1.25);
    let size = random(min(width, height) * 0.16, min(width, height) * 0.55);
    drawRibbonSpiral(x, y, size);
  }

  // Extra organic shapes to fill gaps
  for (let i = 0; i < 60; i++) {
    let x = random(-width * 0.15, width * 1.15);
    let y = random(-height * 0.15, height * 1.15);
    let w = random(100, 360);
    let h = random(60, 220);
    drawFloatingForm(x, y, w, h, random(TWO_PI), random(palette));
  }

  applyGrain(8);
}

function drawBackground() {
  background(6, 7, 10);

  let ctx = drawingContext;
  let g = ctx.createRadialGradient(
    width * 0.5, height * 0.45, 0,
    width * 0.5, height * 0.5, max(width, height) * 0.9
  );
  g.addColorStop(0, "#16181f");
  g.addColorStop(0.55, "#090a0d");
  g.addColorStop(1, "#000000");

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
}
function drawRibbonSpiral(cx, cy, maxSize) {
  push();
  translate(cx, cy);
  rotate(random(TWO_PI));

  let ctx = drawingContext;

  let base = random(palette);
  let light = lighten(base, 100);
  let dark = darken(base, 120);

  let turns = random(4, 7);
  let steps = 220;

  // REAL shadow (this is what you were missing)
  ctx.shadowBlur = maxSize * 0.25;
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowOffsetX = maxSize * 0.05;
  ctx.shadowOffsetY = maxSize * 0.05;

  for (let i = 0; i < steps; i++) {
    let t = i / steps;

    let angle = t * TWO_PI * turns;
    let r = maxSize * (0.05 + t * 0.55);

    let x = cos(angle) * r;
    let y = sin(angle) * r;

    let thickness = map(t, 0, 1, maxSize * 0.35, maxSize * 0.06);

    push();
    translate(x, y);
    rotate(angle + PI / 2);

    // STRONG SOLID GRADIENT (no transparency)
    let grad = ctx.createLinearGradient(
      -thickness / 2,
      0,
      thickness / 2,
      0
    );

    grad.addColorStop(0, rgba(light, 1));
    grad.addColorStop(0.5, rgba(base, 1));
    grad.addColorStop(1, rgba(dark, 1));

    ctx.fillStyle = grad;

    noStroke();
    rect(
      -thickness / 2,
      0,
      thickness,
      thickness * 0.42,
      thickness * 0.2
    );

    pop();
  }

  // reset shadow so it doesn't affect everything else
  ctx.shadowBlur = 0;

  pop();
}

function drawCoverBlob(cx, cy, size, c1, c2) {
  let ctx = drawingContext;
  let lightColor = lighten(c1, 80);
  let darkColor = darken(c2, 65);

  let g = ctx.createRadialGradient(
    cx, cy, size * 0.04,
    cx, cy, size * 0.62
  );

  g.addColorStop(0, rgba(lightColor, 0.72));
  g.addColorStop(0.45, rgba(c1, 0.42));
  g.addColorStop(0.8, rgba(darkColor, 0.18));
  g.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(
    cx, cy,
    size * 0.68,
    size * 0.48,
    random(TWO_PI),
    0,
    TWO_PI
  );
  ctx.fill();
}

function drawFloatingForm(cx, cy, w, h, rot, baseColor) {
  push();
  translate(cx, cy);
  rotate(rot);

  let ctx = drawingContext;
  let lightColor = lighten(baseColor, 70);
  let darkColor = darken(baseColor, 70);

  let g = ctx.createLinearGradient(-w * 0.5, -h * 0.5, w * 0.5, h * 0.5);
  g.addColorStop(0, rgba(lightColor, 0.55));
  g.addColorStop(0.5, rgba(baseColor, 0.34));
  g.addColorStop(1, rgba(darkColor, 0.18));

  ctx.fillStyle = g;
  noStroke();

  beginShape();
  let pts = 28;
  for (let i = 0; i < pts; i++) {
    let a = map(i, 0, pts, 0, TWO_PI);
    let rx = w * 0.5 + noise(cos(a) * 1.4, sin(a) * 1.4, cx * 0.002) * w * 0.12;
    let ry = h * 0.5 + noise(sin(a) * 1.4, cos(a) * 1.4, cy * 0.002) * h * 0.12;
    vertex(cos(a) * rx, sin(a) * ry);
  }
  endShape(CLOSE);

  pop();
}

function lighten(c, amt) {
  return color(
    min(255, red(c) + amt),
    min(255, green(c) + amt),
    min(255, blue(c) + amt)
  );
}

function darken(c, amt) {
  return color(
    max(0, red(c) - amt),
    max(0, green(c) - amt),
    max(0, blue(c) - amt)
  );
}

function rgba(c, a) {
  return `rgba(${red(c)},${green(c)},${blue(c)},${a})`;
}

function applyGrain(intensity) {
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    let n = random(-intensity, intensity);
    pixels[i] += n;
    pixels[i + 1] += n;
    pixels[i + 2] += n;
  }
  updatePixels();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}