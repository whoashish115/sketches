let circles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
  noStroke();

  generateCircles();
}

function generateCircles() {
  circles = [];

  let attempts = 4000; // high = dense fill

  for (let i = 0; i < attempts; i++) {
    let x = random(width);
    let y = random(height);

    // mix of big + tiny
    let r = random() < 0.2
      ? random(80, 180)   // big
      : random(5, 60);    // small

    circles.push({
      x,
      y,
      r,
      layers: floor(random(2, 6)),
      colorType: floor(random(4)) // 0 white, 1 red, 2 blue, 3 black
    });
  }

  // draw large first → better coverage
  circles.sort((a, b) => b.r - a.r);
}

function draw() {
  background(255); // white base

  for (let c of circles) {
    drawStack(c);
  }
}

function drawStack(c) {
  for (let i = c.layers; i > 0; i--) {
    let t = i / c.layers;
    let r = c.r * t;

    let col;

    // 🎨 limited palette (white, red, blue, black)
    if (c.colorType === 0) col = color(255);
    if (c.colorType === 1) col = color(220, 40, 40);
    if (c.colorType === 2) col = color(40, 80, 220);
    if (c.colorType === 3) col = color(20);

    // 🌫 shadow (subtle depth)
    fill(0, 0, 0, 15 * t);
    ellipse(c.x + 3 * t, c.y + 3 * t, r * 1.05);

    // 🎯 main circle
    fill(
      red(col) * (0.8 + 0.2 * t),
      green(col) * (0.8 + 0.2 * t),
      blue(col) * (0.8 + 0.2 * t)
    );
    ellipse(c.x, c.y, r);

    // ✨ highlight for depth
    fill(255, 255, 255, 25 * (1 - t));
    ellipse(c.x - r * 0.2, c.y - r * 0.2, r * 0.5);
  }
}

