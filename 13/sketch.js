let paths = [];
let globalHueShift;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
  colorMode(HSB, 360, 100, 100, 100);
  noStroke();
  noiseSeed(floor(random(10000)));

  globalHueShift = random(360);

  generatePaths();
}

function generatePaths() {
  paths = [];

  let count = 500; // 🔥 more paths

  for (let i = 0; i < count; i++) {
    let x = random(width);
    let y = random(height);

    let path = [];
    let len = random(140, 320);

    for (let j = 0; j < len; j++) {

      let angle = noise(x * 0.002, y * 0.002) * TWO_PI * 2;

      x += cos(angle) * random(2, 5);
      y += sin(angle) * random(2, 5);

      path.push({
        x,
        y,
        t: j / len
      });

      if (x < -100 || x > width + 100 || y < -100 || y > height + 100) break;
    }

    paths.push(path);
  }
}

function draw() {
  // 🎨 slight tint instead of white gaps
  background(0, 0, 98);

  // 🔥 more passes → paint buildup
  for (let pass = 0; pass < 5; pass++) {
    for (let path of paths) {
      drawFlow(path, pass);
    }
  }

  // 🌸 bigger endpoints
  for (let path of paths) {
    let end = path[path.length - 1];
    if (end && random() < 0.6) {
      push();
      translate(end.x, end.y);
      drawBloom(24 + random(20));
      pop();
    }
  }
}

function drawFlow(path, pass) {
  for (let i = 0; i < path.length; i++) {

    let p = path[i];
    let t = p.t;

    // 🌈 global flowing color
    let hue = (globalHueShift + t * 300 + p.x * 0.12 + p.y * 0.08) % 360;

    let sat = 60 + noise(p.x * 0.01, p.y * 0.01) * 30;
    let bri = 85;

    // 🫧 MUCH thicker paint
    let baseSize = map(sin(t * PI), 0, 1, 4, 22);
    let size = baseSize * (1 + pass * 0.5);

    let alpha = 25 - pass * 4;

    fill(hue, sat, bri, alpha);

    ellipse(p.x, p.y, size);

    // 💧 extra blob spread → fills gaps
    if (random() < 0.6) {
      ellipse(
        p.x + random(-3, 3),
        p.y + random(-3, 3),
        size * random(0.5, 1.2)
      );
    }

    // 🔥 micro splatter
    if (random() < 0.2) {
      ellipse(
        p.x + random(-6, 6),
        p.y + random(-6, 6),
        random(2, 6)
      );
    }
  }
}

// 🌸 bigger bloom anchors
function drawBloom(size) {
  let petals = floor(random(6, 14));

  for (let i = 0; i < petals; i++) {
    let angle = (TWO_PI / petals) * i;

    push();
    rotate(angle);

    fill(random(360), 70, 95, 50);
    ellipse(size * 0.7, 0, size, size * 0.7);

    pop();
  }

  fill(50, 80, 100, 80);
  ellipse(0, 0, size * 0.4);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generatePaths();
  redraw();
}