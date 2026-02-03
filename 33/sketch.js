let particles = [];
let clusters = [];
let clusterCount = 6;

const flowScale = 0.008;
let radiusLimt;

const tones = [
  "#0B132B",
  "#1C2541",
  "#3A506B",
  "#5BC0BE",
  "#CDEDF6"
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  rectMode(CENTER);
  noStroke();

  radiusLimit = max(width, height) * 0.7;

  for (let i = 0; i < clusterCount; i++) {
    clusters.push(new Cluster());
  }

  background(10);
}

function draw() {
  let drift = 120;
  let cx = width / 2 + map(noise(frameCount * 0.002, 1), 0, 1, -drift, drift);
  let cy = height / 2 + map(noise(frameCount * 0.002, 2), 0, 1, -drift, drift);

  push();
  translate(cx, cy);
  rotate(map(noise(frameCount * 0.001), 0, 1, -180, 180));

  clusters.forEach(c => c.emit());

  for (let i = particles.length - 1; i >= 0; i--) {
    particles[i].update();
    particles[i].render();

    if (particles[i].dead()) {
      particles.splice(i, 1);
    }
  }

  pop();
}
class Cluster {
  constructor() {
    this.seed = random(1000);
    this.rSeed = random(1000);
    this.aSeed = random(1000);
    this.speed = random(0.5, 1.2);
  }

  emit() {
    let r = map(noise(this.seed * 0.01, this.rSeed), 0, 1, -radiusLimit * 0.2, radiusLimit);
    let a = map(noise(this.seed * 0.002, this.aSeed), 0, 1, -360, 360);

    let px = r * cos(a);
    let py = r * sin(a);

    if (frameCount % 2 === 0) {
      particles.push(new Particle(px, py));
    }

    this.seed += this.speed;
  }
}
class Particle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);

    this.lifeSpan = random(50, 90);
    this.life = this.lifeSpan;

    this.noiseOffset = random(1000);
    this.sizeMax = random(20, min(width, height) * 0.12);

    this.color = color(random(tones));
    this.color.setAlpha(80);

    this.rotation = random(360);
    this.decay = random(0.2, 0.6);
  }

  update() {
    let angle = map(
      noise(this.position.x * flowScale, this.position.y * flowScale, this.noiseOffset),
      0, 1,
      -360, 360
    );

    this.velocity.x = cos(angle);
    this.velocity.y = sin(angle);

    this.position.add(this.velocity);

    this.rotation += map(noise(this.noiseOffset), 0, 1, -2, 2);

    this.life -= this.decay;
  }

  dead() {
    return this.life <= 0;
  }

  render() {
    let phase = map(this.life, this.lifeSpan, 0, 0, 180);
    let h = this.sizeMax * sin(phase);

    push();
    translate(this.position.x, this.position.y);
    rotate(this.rotation);

    fill(this.color);
    rect(0, 0, 4, h, 4);

    pop();
  }
}