let particles = [];
let total = 480;

let mouseField = {
  active: false,
  radius: 200
};

let bgGfx;
let grid = {};
let cellSize = 110;

function setup() {
  createCanvas(windowWidth, windowHeight);
  strokeCap(ROUND);

  bgGfx = createGraphics(windowWidth, windowHeight);
  makeBG(bgGfx);

  for (let i = 0; i < total; i++) {
    particles.push(new Particle());
  }
}

function draw() {
  image(bgGfx, 0, 0);

  updateGrid();

  blendMode(ADD);

  connectParticles();

  for (let p of particles) {
    p.update();
    p.show();
  }

  blendMode(BLEND);
}

function makeBG(g) {
  for (let y = 0; y < g.height; y++) {
    let t = y / g.height;
    let c = lerpColor(color(18, 6, 20), color(50, 16, 34), t);
    g.stroke(c);
    g.line(0, y, g.width, y);
  }
}

class Particle {
  constructor() {
    this.kind = floor(random(4)); 

    this.pos = createVector(random(width), random(height));
    this.vel = p5.Vector.random2D().mult(random(0.5, 1.4));
    this.push = createVector(0, 0);

    this.friction = 0.93;
    this.seed = random(1000);

    if (this.kind === 0) this.size = random(40, 160);   

    else if (this.kind === 1) this.size = random(12, 40);
    else if (this.kind === 2) this.size = random(14, 34);
    else this.size = random(2, 6);

    this.col = random([
      color(255, 180, 205),
      color(255, 210, 225),
      color(255, 235, 242),
      color(255, 155, 190),
      color(245, 245, 245)
    ]);
  }

  update() {

    if (mouseField.active) {
      let dx = this.pos.x - mouseX;
      let dy = this.pos.y - mouseY;
      let d = sqrt(dx * dx + dy * dy);

      if (d < mouseField.radius && d > 0) {
        let force = (mouseField.radius - d) / mouseField.radius;
        let ang = atan2(dy, dx);

        this.push.x += cos(ang) * force * 2;
        this.push.y += sin(ang) * force * 2;
      }
    }

    let n1 = noise(this.seed, frameCount * 0.003);
    let n2 = noise(this.seed + 999, frameCount * 0.003);

    this.vel.x += map(n1, 0, 1, -0.02, 0.02);
    this.vel.y += map(n2, 0, 1, -0.02, 0.02);

    this.vel.limit(this.kind === 0 ? 2 : 1.6);

    this.pos.add(this.vel);
    this.pos.add(this.push);
    this.push.mult(this.friction);

    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.y > height) this.pos.y = 0;
  }

  show() {
    push();

    if (this.kind !== 3) {
      drawingContext.shadowBlur = this.kind === 0 ? 35 : 18;
      drawingContext.shadowColor = color(
        red(this.col),
        green(this.col),
        blue(this.col),
        120
      );
    }

    if (this.kind === 0) {

      noStroke();
      fill(red(this.col), green(this.col), blue(this.col), 70);
      circle(this.pos.x, this.pos.y, this.size);

      fill(255, 90);
      circle(this.pos.x, this.pos.y, this.size * 0.3);
    } 
    else if (this.kind === 1) {

      noStroke();
      fill(red(this.col), green(this.col), blue(this.col), 150);
      circle(this.pos.x, this.pos.y, this.size);

      fill(255, 80);
      circle(this.pos.x, this.pos.y, this.size * 0.3);
    } 
    else if (this.kind === 2) {

      noFill();
      stroke(255, 220);
      strokeWeight(1.5);
      circle(this.pos.x, this.pos.y, this.size);

      stroke(red(this.col), green(this.col), blue(this.col), 80);
      strokeWeight(5);
      circle(this.pos.x, this.pos.y, this.size * 0.65);
    } 
    else {

      noStroke();
      fill(255, 220);
      circle(this.pos.x, this.pos.y, this.size);
    }

    pop();
  }
}

function updateGrid() {
  grid = {};

  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    let gx = floor(p.pos.x / cellSize);
    let gy = floor(p.pos.y / cellSize);
    let key = gx + "," + gy;

    if (!grid[key]) grid[key] = [];
    grid[key].push(i);
  }
}

function connectParticles() {
  let maxDist = 110;
  let maxDistSq = maxDist * maxDist;

  for (let i = 0; i < particles.length; i++) {
    let a = particles[i];

    let gx = floor(a.pos.x / cellSize);
    let gy = floor(a.pos.y / cellSize);

    for (let x = gx - 1; x <= gx + 1; x++) {
      for (let y = gy - 1; y <= gy + 1; y++) {

        let bucket = grid[x + "," + y];
        if (!bucket) continue;

        for (let j of bucket) {
          if (j <= i) continue;

          let b = particles[j];

          if (a.kind === 3 || b.kind === 3) continue;

          let dx = a.pos.x - b.pos.x;
          let dy = a.pos.y - b.pos.y;
          let dSq = dx * dx + dy * dy;

          if (dSq < maxDistSq) {
            let d = sqrt(dSq);
            let alpha = map(d, 0, maxDist, 90, 0);

            stroke(255, 185, 215, alpha);
            strokeWeight(1);
            line(a.pos.x, a.pos.y, b.pos.x, b.pos.y);
          }
        }
      }
    }
  }
}

function mousePressed() {
  mouseField.active = true;
}

function mouseReleased() {
  mouseField.active = false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  bgGfx = createGraphics(windowWidth, windowHeight);
  makeBG(bgGfx);
}