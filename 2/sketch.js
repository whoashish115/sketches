let particles = [];
let emitters = [];

const palette = ["#00f5d4", "#0bbcd6", "#3a86ff", "#8338ec", "#ff006e"];

let maxR;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  background(5);
  blendMode(LIGHTEST);
  maxR = max(width, height);

  for (let i = 0; i < 6; i++) {
    emitters.push(new Emitter());
  }
}

function draw() {
  // slow fade to dark instead of full white
  noStroke();
  fill(5, 15);
  rect(0, 0, width, height);

  for (let e of emitters) e.update();

  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.update();
    p.show();
    if (p.dead()) particles.splice(i, 1);
  }
}

class Emitter {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.speed = random(0.5, 1.5);
    this.angle = random(360);
    this.turning = random(-3, 3);
  }

  update() {
    this.angle += this.turning * 0.5;
    this.pos.x += cos(this.angle) * this.speed;
    this.pos.y += sin(this.angle) * this.speed;

    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.y > height) this.pos.y = 0;

    if (frameCount % 2 === 0) particles.push(new Particle(this.pos.x, this.pos.y));
  }
}

class Particle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.prev = this.pos.copy();

    this.life = random(500, 1200);
    this.maxLife = this.life;

    this.angle = random(360);
    this.speed = random(0.5, 2);
    this.turning = random(-5, 5);

    this.weight = random(3,6);
    this.col = color(random(palette));
  }

  update() {
    this.prev = this.pos.copy();
    this.angle += this.turning;
    let vx = cos(this.angle) * this.speed;
    let vy = sin(this.angle) * this.speed;
    this.pos.x += vx;
    this.pos.y += vy;
    this.life -= 1;
  }

  dead() {
    return this.life <= 0;
  }

  show() {
    let alpha = map(this.life, 0, this.maxLife, 0, 100); // lower alpha to avoid white
    this.col.setAlpha(alpha);

    stroke(this.col);
    strokeWeight(this.weight);
    line(this.prev.x, this.prev.y, this.pos.x, this.pos.y);

    // subtle glow
    strokeWeight(this.weight * 2);
    stroke(red(this.col), green(this.col), blue(this.col), alpha * 0.15);
    line(this.prev.x, this.prev.y, this.pos.x, this.pos.y);
  }
}


function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  maxR = max(width, height);
  for (let e of emitters) {
    e.pos.x = constrain(e.pos.x, 0, width);
    e.pos.y = constrain(e.pos.y, 0, height);
  }
}