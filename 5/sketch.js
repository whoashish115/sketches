let centers = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(5, 0, 15);
  noFill();
  generate();
}

function generate() {
  centers = [];

  // RANDOM centers (not grid)
  let count = int(width * height / 30000); // density control

  for (let i = 0; i < count; i++) {
    centers.push({
      x: random(width),
      y: random(height),
      dir: random() > 0.5 ? 1 : -1,
      strength: random(50, 200),  // size of swirl
      influence: random(80, 250)  // how far it affects
    });
  }

  drawSnakes();
}

function getFlow(x, y) {
  let vx = 0;
  let vy = 0;

  for (let c of centers) {
    let dx = x - c.x;
    let dy = y - c.y;
    let d = sqrt(dx * dx + dy * dy);

    if (d < c.influence) {
      let power = (1 - d / c.influence);

      // swirl force
      let tx = -dy / (d + 0.0001) * c.dir;
      let ty = dx / (d + 0.0001) * c.dir;

      vx += tx * power * c.strength * 0.05;
      vy += ty * power * c.strength * 0.05;

      // inward spiral
      vx += -dx * 0.002 * power;
      vy += -dy * 0.002 * power;
    }
  }

  return createVector(vx, vy);
}

function drawSnakes() {

  let total = int(width * height / 1500); // fills whole screen

  for (let i = 0; i < total; i++) {

    let x = random(width);
    let y = random(height);

    strokeWeight(random(3, 10));
    stroke(
      150 + random(105),
      50 + random(150),
      255,
      random(60, 140)
    );

    beginShape();

    for (let j = 0; j < 150; j++) {
      vertex(x, y);

      let flow = getFlow(x, y);

      // fallback tiny motion if no influence
      if (flow.mag() < 0.1) {
        flow = p5.Vector.random2D().mult(0.5);
      }

      x += flow.x;
      y += flow.y;

      // stop if out of screen
      if (x < 0 || x > width || y < 0 || y > height) break;
    }

    endShape();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(5, 0, 15);
  generate();
}