let palette;
let cylinders = [];

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  angleMode(DEGREES);
  noLoop();

  palette = [
    color(30, 20, 15),
    color(70, 40, 25),
    color(140, 90, 40),
    color(220, 160, 80),
    color(255, 220, 130),
    color(245, 245, 230)
  ];
}

function draw() {
  drawBackground2D();
  orbitControl();
  ambientLight(150);

  let spacing = 100;
  let cols = floor(width / spacing) + 2;
  let rows = floor(height / spacing) + 2;

  cylinders = [];

  for (let i = -cols / 2; i < cols / 2; i++) {
    for (let j = -rows / 2; j < rows / 2; j++) {

      let attempts = 0;
      let placed = false;

      while (!placed && attempts < 10) {
        let x = i * spacing + random(-20, 20);
        let y = j * spacing + random(-20, 20);
        let z = random(-100, 100);

        let cylRadius = random(15, 35);
        let cylHeight = random(120, 300);

        if (!isColliding(x, y, z, cylRadius, cylHeight)) {
          cylinders.push({ x, y, z, r: cylRadius, h: cylHeight });
          placed = true;
        }

        attempts++;
      }
    }
  }

  // draw cylinders
  for (let c of cylinders) {
    push();
    translate(c.x, c.y, c.z);
    rotateX(-90);
    drawGradientCylinder(c.r, c.h);
    pop();
  }
}

// Check collision with already placed cylinders
function isColliding(x, y, z, r, h) {
  for (let c of cylinders) {
    let dx = x - c.x;
    let dy = y - c.y;
    let dz = z - c.z;
    let distXY = sqrt(dx * dx + dy * dy);
    if (distXY < r + c.r && abs(dz) < (h + c.h) / 2) {
      return true;
    }
  }
  return false;
}

// Hollow gradient cylinder
function drawGradientCylinder(r, h) {
  noFill();
  let rings = h; // reduce for performance
  let detail = 40;

  let c1 = random(palette);
  let c2 = random(palette);

  for (let i = 0; i < rings; i++) {
    let yStep = h / rings;
    let y = -h / 2 + i * yStep * 0.95;

    let inter = i / rings;
    let c = lerpColor(c1, c2, inter);

    stroke(red(c), green(c), blue(c), 200);
    strokeWeight(1.3);

    beginShape();
    for (let a = 0; a <= detail; a++) {
      let angle = map(a, 0, detail, 0, 360);
      let rr = r + sin(angle * 3 + y * 0.5) * 1.2;

      let x = cos(angle) * rr;
      let z = sin(angle) * rr;

      vertex(x, y, z);
    }
    endShape();
  }
}

// Background gradient
function drawBackground2D() {
  push();
  resetMatrix();
  translate(-width / 2, -height / 2);

  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(20, 10, 5), color(220, 160, 80), inter);
    stroke(c);
    line(0, y, width, y);
  }

  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}