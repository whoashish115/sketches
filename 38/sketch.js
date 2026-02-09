let t = 0;

const palette = {
  soilDark: "#050505",
  soilMid: "#121212",
  soilLight: "#242424",
  moss: "#2A2A2A",
  lichen: "#3A3A3A",
  amber: "#FF4D00",
  bone: "#D9D9D9",
  ink: "#000000",
  glow: "#FF7A18",
  acid: "#FF2E00"
};

let cells = [];
let links = [];
let debris = [];
let fire = [];   

let groundLayer;
let fireparticle_count = 300
const CFG = {
  initialCells: 34,
  maxCells: 72,
  neighborDist: 170,
  spring: 0.0025,
  maxLinkLength: 600,
  drag: 0.985,
  noiseForce: 0.12,
  cellGrowChance: 0.0018,
  splitChance: 0.0024,
  collapseAge: 900
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  angleMode(RADIANS);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  noFill();
  buildScene();

  for (let i = 0; i < 300; i++) {
    fire.push(makeFire());
  }
}

function makeFire() {
  return {
    x: random(width),
    y: random(height),
    vx: random(-0.2, 0.2),
    vy: random(-0.6, -1.8),
    r: random(1, 3),
    life: random(40, 120),
    age: 0
  };
}

function updateFire() {
  for (let f of fire) {
    f.age++;

    let n = noise(f.x * 0.002, f.y * 0.002, t * 0.5);
    f.vx += (n - 0.5) * 0.2;

    f.x += f.vx;
    f.y += f.vy;

    f.vx *= 0.98;

    if (f.y < 0 || f.age > f.life) {
      f.x = random(width);
      f.y = height + random(20, 80);
      f.age = 0;
      f.vy = random(-1.5, -0.5);
    }
  }
}

function drawFire() {
  blendMode(ADD);
  noStroke();

  for (let f of fire) {
    let a = map(f.age, 0, f.life, 180, 0);

    fill(255, 80, 0, a * 0.25);
    circle(f.x, f.y, f.r * 6);

    fill(255, 140, 40, a * 0.4);
    circle(f.x, f.y, f.r * 3);

    fill(255, 60, 0, a);
    circle(f.x, f.y, f.r);
  }

  blendMode(BLEND);
}

function buildScene() {
  cells = [];
  links = [];
  debris = [];

  buildGround();

  let cols = ceil(width / 150) + 2;
  let rows = ceil(height / 120) + 2;

  for (let j = -1; j < rows; j++) {
    for (let i = -1; i < cols; i++) {
      if (random() < 0.25) continue;

      let ox = (j % 2 === 0) ? 0 : 75;
      let x = i * 150 + ox + random(-30, 30);
      let y = j * 120 + random(-24, 24);

      let c = createCell(x, y, random(0.65, 1.15));
      c.vx = random(-0.6, 0.6);
      c.vy = random(-0.6, 0.6);
      cells.push(c);
    }
  }

  for (let k = 0; k < CFG.initialCells; k++) {
    cells.push(
      createCell(
        random(width * 0.12, width * 0.88),
        random(height * 0.16, height * 0.84),
        random(0.7, 1.3)
      )
    );
  }

  rebuildLinks(true);
}

function createCell(x, y, energy = 1) {
  return {
    x,
    y,
    vx: random(-0.5, 0.5),
    vy: random(-0.5, 0.5),
    r: random(9, 16),
    energy,
    age: floor(random(1000)),
    seed: random(10000),
    hueShift: random(1),
    linkCount: 0,
    kind: floor(random(4))
  };
}

function buildGround() {
  groundLayer = createGraphics(width, height);
  groundLayer.pixelDensity(1);
  groundLayer.noStroke();

  let s = 6;
  for (let y = 0; y < height; y += s) {
    for (let x = 0; x < width; x += s) {
      let nx = x * 0.0045;
      let ny = y * 0.0055;
      let n1 = noise(nx, ny);
      let n2 = noise(nx * 2.1 + 40, ny * 2.1 + 20);
      let n = n1 * 0.7 + n2 * 0.3;

      let topBias = map(y, 0, height, 0.15, 1.0);
  let cA = color("#0A0705"); 

let cB = color("#1A0E08"); 

let cC = color("#2A140A"); 

      let base = lerpColor(cA, cB, n);
      base = lerpColor(base, cC, pow(n, 2.2) * 0.55);

      let a = 255;
      let rr = red(base) * topBias;
      let gg = green(base) * topBias;
      let bb = blue(base) * topBias;

      groundLayer.fill(rr, gg, bb, a);
      groundLayer.rect(x, y, s + 1, s + 1);
    }
  }

  groundLayer.noFill();
  for (let y = 0; y < height; y += 18) {
    let amp = map(noise(y * 0.01), 0, 1, 2, 12);
    groundLayer.stroke(255, 8);
    groundLayer.strokeWeight(1);

    groundLayer.beginShape();
    for (let x = 0; x <= width; x += 18) {
      let n = noise(x * 0.01, y * 0.018, 10.0);
      let yy = y + (n - 0.5) * amp;
      groundLayer.vertex(x, yy);
    }
    groundLayer.endShape();
  }

  groundLayer.stroke(0, 24);
  for (let i = 0; i < 2400; i++) {
    let x = random(width);
    let y = random(height);
    let len = random(3, 18);
    let ang = noise(x * 0.01, y * 0.01) * TWO_PI * 2;
    groundLayer.line(x, y, x + cos(ang) * len, y + sin(ang) * len);
  }

  groundLayer.noStroke();
  for (let i = 0; i < 9000; i++) {
    let x = random(width);
    let y = random(height);
    let a = random(5, 20);
    groundLayer.fill(255, a);
    groundLayer.circle(x, y, random(0.6, 1.8));
  }

  groundLayer.noFill();
  let maxR = max(width, height) * 0.95;
  for (let r = 0; r < maxR; r += 10) {
    let a = map(r, 0, maxR, 0, 26);
    groundLayer.stroke(0, a);
    groundLayer.circle(width / 2, height / 2, r * 2);
  }
}
function drawEmissionFog() {
  blendMode(ADD);

  noStroke();

  for (let i = 0; i < 6; i++) {
    let x = noise(i * 10, t * 0.3) * width;
    let y = noise(i * 20, t * 0.3) * height;

    let r = 180 + 120 * noise(i, t);

    fill(255, 80, 10, 10);   

    circle(x, y, r);

    fill(255, 40, 0, 6);     

    circle(x + 20, y - 10, r * 1.4);
  }

  blendMode(BLEND);
}
function draw() {
  background(8, 8, 8);

  image(groundLayer, 0, 0);

  updateCells();
  rebuildLinks(false);
  updateLinks();

  updateFire();   

  drawFire();     

  blendMode(ADD);
  drawLinks();
  drawCells();
  drawDebris();
  blendMode(BLEND);

  t += 0.01;
}
function drawAtmosphere() {
  noStroke();
  for (let i = 0; i < 65; i++) {
    let x = noise(i * 0.2, t * 0.2) * width;
    let y = noise(i * 0.2 + 90, t * 0.2) * height;
    let r = 18 + noise(i * 0.2 + 12, t * 0.12) * 42;
    fill(255, 10);
    circle(x, y, r);
  }
}

function updateCells() {
  for (let c of cells) {
    c.age++;

    let n1 = noise(c.x * 0.004, c.y * 0.004, t * 0.25);
    let n2 = noise(c.x * 0.006 + 90, c.y * 0.006 + 20, t * 0.22);
    let ang = n1 * TWO_PI * 2.0;
    c.vx += cos(ang) * CFG.noiseForce * 0.015;
    c.vy += sin(ang) * CFG.noiseForce * 0.015;

    c.vx += (n2 - 0.5) * 0.035;
    c.vy += (noise(c.x * 0.005 + 999, c.y * 0.005 + 222, t * 0.19) - 0.5) * 0.035;

    c.r += sin(t * 2 + c.seed) * 0.002;
    c.r = constrain(c.r, 7.5, 18);

    c.energy += c.linkCount * 0.0008 - 0.0012;
    c.energy += (noise(c.seed * 0.01, t * 0.3) - 0.5) * 0.004;
    c.energy = constrain(c.energy, 0.15, 1.65);

    c.vx *= CFG.drag;
    c.vy *= CFG.drag;
    c.x += c.vx;
    c.y += c.vy;

    if (c.x < -50) c.x = width + 50;
    if (c.x > width + 50) c.x = -50;
    if (c.y < -50) c.y = height + 50;
    if (c.y > height + 50) c.y = -50;

    if (
      cells.length < CFG.maxCells &&
      c.energy > 1.28 &&
      random() < CFG.cellGrowChance
    ) {
      budCell(c);
    }
  }
}

function budCell(parent) {
  let a = random(TWO_PI);
  let d = random(18, 38);

  let child = createCell(
    parent.x + cos(a) * d,
    parent.y + sin(a) * d,
    parent.energy * random(0.42, 0.68)
  );

  child.vx = parent.vx + cos(a + HALF_PI) * random(-0.6, 0.6);
  child.vy = parent.vy + sin(a + HALF_PI) * random(-0.6, 0.6);
  child.r = parent.r * random(0.72, 0.92);

  cells.push(child);
  links.push(makeLink(cells.indexOf(parent), cells.length - 1, "growing"));
}

function rebuildLinks(forceAll) {
  for (let c of cells) c.linkCount = 0;

  let maxLinksPerCell = 4;
  let maxDist = CFG.neighborDist;

  let used = new Set();
  for (let L of links) {
    if (L.dead) continue;
    let key = linkKey(L.a, L.b);
    used.add(key);
  }

  if (forceAll || frameCount % 3 === 0) {
    for (let i = 0; i < cells.length; i++) {
      let a = cells[i];
      let countA = 0;

      for (let j = 0; j < links.length; j++) {
        let L = links[j];
        if (L.dead) continue;
        if (L.a === i || L.b === i) countA++;
      }

      if (countA >= maxLinksPerCell) continue;

      for (let j = i + 1; j < cells.length; j++) {
        let b = cells[j];

        let countB = 0;
        for (let k = 0; k < links.length; k++) {
          let L = links[k];
          if (L.dead) continue;
          if (L.a === j || L.b === j) countB++;
        }
        if (countB >= maxLinksPerCell) continue;

        let d = dist(a.x, a.y, b.x, b.y);
        if (d > maxDist) continue;

        let key = linkKey(i, j);
        if (used.has(key)) continue;

        let chance = map(d, 0, maxDist, 0.08, 0.0);
        chance *= 0.8 + 0.6 * min(a.energy, b.energy);

        if (random() < chance) {
          links.push(makeLink(i, j, "growing"));
          used.add(key);
        }
      }
    }
  }
}

function makeLink(a, b, state = "stable") {
  let A = cells[a];
  let B = cells[b];
  let d = dist(A.x, A.y, B.x, B.y);
  return {
    a,
    b,
    rest: d,
    state,
    age: 0,
    seed: random(10000),
    phase: random(TWO_PI),
    timer: 0,
    life: random(520, 1100),
    splitDone: false,
    collapsePull: 0
  };
}

function linkKey(a, b) {
  return a < b ? `${a}:${b}` : `${b}:${a}`;
}

function updateLinks() {

  for (let L of links) {
    if (L.dead) continue;

    let a = cells[L.a];
    let b = cells[L.b];
    if (!a || !b) {
      L.dead = true;
      continue;
    }

    L.age++;
    L.timer++;

    let dx = b.x - a.x;
    let dy = b.y - a.y;
    let d = sqrt(dx * dx + dy * dy) + 0.0001;
if (d > CFG.maxLinkLength) {
  L.dead = true;
  continue;
}
    let nx = dx / d;
    let ny = dy / d;

    let force = (d - L.rest) * CFG.spring;

    if (L.state !== "collapse") {
      a.vx += nx * force;
      a.vy += ny * force;
      b.vx -= nx * force;
      b.vy -= ny * force;
    }

    L.rest = lerp(L.rest, d, 0.006);

    let tension = d / max(1, L.rest);

    if (
      L.state === "stable" &&
      !L.splitDone &&
      a.energy > 1.0 &&
      b.energy > 1.0 &&
      d > 35 &&
      d < CFG.neighborDist * 0.72 &&
      random() < CFG.splitChance
    ) {
      L.state = "splitting";
      L.timer = 0;
      L.splitDone = true;
    }

    if (
      L.state !== "dying" &&
      (
        a.energy < 0.28 ||
        b.energy < 0.28 ||
        d > CFG.neighborDist * 1.12 ||
        L.age > L.life
      )
    ) {
      L.state = "collapse";
      L.timer = 0;
      L.collapsePull = 0;
    }

    if (L.state === "splitting") {
      if (L.timer === 18) {
        splitLink(L);
      }
      if (L.timer > 40) {
        L.state = "dying";
        L.timer = 0;
      }
    } else if (L.state === "collapse") {

      L.collapsePull = min(1, L.collapsePull + 0.04);

      let pull = 0.0008 + L.collapsePull * 0.003;
      a.vx += nx * pull * 12;
      a.vy += ny * pull * 12;
      b.vx -= nx * pull * 12;
      b.vy -= ny * pull * 12;

      a.energy -= 0.0015;
      b.energy -= 0.0015;

      if (L.timer > 42) {
        emitCollapse(a.x + dx * 0.5, a.y + dy * 0.5, d * 0.5);
        L.state = "dying";
        L.timer = 0;
      }
    } else if (L.state === "growing") {
      if (L.timer > 36) L.state = "stable";
    } else if (L.state === "dying") {
      if (L.timer > 24) L.dead = true;
    }

    let health = (a.energy + b.energy) * 0.5;
    if (health < 0.45 && L.state === "stable") L.state = "collapse";
  }

  links = links.filter(L => !L.dead);
}

function splitLink(L) {
  let a = cells[L.a];
  let b = cells[L.b];
  if (!a || !b) return;

  let mx = (a.x + b.x) * 0.5;
  let my = (a.y + b.y) * 0.5;

  let child = createCell(
    mx + random(-6, 6),
    my + random(-6, 6),
    (a.energy + b.energy) * 0.45
  );

  child.vx = (a.vx + b.vx) * 0.5 + random(-0.8, 0.8);
  child.vy = (a.vy + b.vy) * 0.5 + random(-0.8, 0.8);
  child.r = max(7, min(a.r, b.r) * random(0.75, 0.92));

  let idx = cells.length;
  cells.push(child);

  links.push(makeLink(L.a, idx, "growing"));
  links.push(makeLink(idx, L.b, "growing"));

  L.dead = true;
  emitBurst(mx, my, 14, color(palette.acid));
}

function emitBurst(x, y, n, col) {
  for (let i = 0; i < n; i++) {
    debris.push({
      x,
      y,
      vx: random(-2.5, 2.5),
      vy: random(-2.5, 2.5),
      life: random(24, 50),
      age: 0,
      r: random(1.2, 3.6),
      col
    });
  }
}

function emitCollapse(x, y, scale) {
  for (let i = 0; i < 18; i++) {
    debris.push({
      x,
      y,
      vx: random(-3, 3) * 0.7,
      vy: random(-3, 3) * 0.7,
      life: random(18, 34),
      age: 0,
      r: random(0.8, 2.8) * (0.6 + scale * 0.02),
      col: color(255, 210, 160, 180)
    });
  }
}

function drawLinks() {
  for (let L of links) {
    let a = cells[L.a];
    let b = cells[L.b];
    if (!a || !b) continue;

    let ax = a.x;
    let ay = a.y;
    let bx = b.x;
    let by = b.y;

    let dx = bx - ax;
    let dy = by - ay;
    let d = sqrt(dx * dx + dy * dy) + 0.0001;

    let nx = -dy / d;
    let ny = dx / d;

    let centerPulse = 0.5 + 0.5 * sin(t * 3 + L.phase);
    let endPulse = 0.5 + 0.5 * sin(t * 6 + L.phase * 1.7);

    let stateBoost = 1;
    if (L.state === "splitting") stateBoost = 1.6;
    if (L.state === "collapse") stateBoost = 0.58;
    if (L.state === "dying") stateBoost = 0.22;

    let amp = (10 + d * 0.10) * stateBoost;
    let splitPinch = 0;
    if (L.state === "splitting") {
      splitPinch = abs(sin(L.timer * 0.22));
      amp *= 1.2 + splitPinch * 0.8;
    }

    let pts = [];
    let steps = 20;
    for (let i = 0; i <= steps; i++) {
      let u = i / steps;
      let x = lerp(ax, bx, u);
      let y = lerp(ay, by, u);

      let waveA = noise(L.seed + u * 2.2, t * 0.8) - 0.5;
      let waveB = sin(u * PI * 2 + t * 2 + L.phase) * 0.55;
      let pinch = sin(u * PI);
      let pinchFactor = 1;

      if (L.state === "splitting") {

        pinchFactor = 1 - pow(1 - abs(u - 0.5) * 2, 1.7) * 0.72;
      } else if (L.state === "collapse") {
        pinchFactor = 0.35 + 0.65 * (1 - min(1, L.collapsePull));
      } else if (L.state === "dying") {
        pinchFactor = 0.15 + 0.25 * endPulse;
      }

      let offset = (waveA * 0.9 + waveB * 0.6) * amp * pinchFactor;
      x += nx * offset;
      y += ny * offset;

      x += cos(t * 8 + u * 16 + L.phase) * 0.35;
      y += sin(t * 7 + u * 14 + L.phase) * 0.35;

      pts.push({ x, y, u });
    }

    let bodyCol = color(56, 62, 66, 90);
    let innerCol = color(210, 220, 210, 110);
    let coreCol = color(160, 200, 155, 120);
    let glowCol = color(245, 230, 180, 65);

    let thick = 4.0 + d * 0.03;
    if (L.state === "splitting") thick *= 1.18;
    if (L.state === "collapse") thick *= 0.78;
    if (L.state === "dying") thick *= 0.45;

    noFill();
    stroke(bodyCol);
    strokeWeight(thick);
    beginShape();
    for (let p of pts) vertex(p.x, p.y);
    endShape();

    stroke(innerCol);
    strokeWeight(max(1.0, thick * 0.45));
    beginShape();
    for (let p of pts) vertex(p.x, p.y);
    endShape();

    let beadCount = 3 + floor(d / 70);
    for (let i = 0; i < beadCount; i++) {
      let u = (i + 1) / (beadCount + 1);
      let idx = floor(u * steps);
      let p = pts[idx];

      let rr = 4 + 5 * (0.5 + 0.5 * sin(t * 4 + L.phase + i));
      if (L.state === "splitting" && abs(u - 0.5) < 0.18) rr *= 1.5;
      if (L.state === "collapse") rr *= 0.75;

      noStroke();
      fill(red(coreCol), green(coreCol), blue(coreCol), 160);
      circle(p.x, p.y, rr);
noStroke();

fill(255, 90, 20, 18);
circle(p.x, p.y, rr * 5.5);

fill(255, 120, 40, 35);
circle(p.x, p.y, rr * 3.2);

fill(255, 80, 0, 160);
circle(p.x, p.y, rr);
    }

    if (L.state === "splitting") {
      let mid = pts[floor(steps * 0.5)];
      noStroke();
      fill(255, 200, 140, 120);
      circle(mid.x, mid.y, 10 + 12 * splitPinch);

      fill(255, 235, 180, 35);
      circle(mid.x, mid.y, 28 + 24 * splitPinch);
    }

    drawAnchor(a, L.state, true);
    drawAnchor(b, L.state, false);
  }
}

function drawAnchor(c, state, isLeft) {
  let s = c.r * (1.45 + c.energy * 0.12);
  let pulse = 0.8 + 0.2 * sin(t * 3 + c.seed);
  let e = c.energy;

  let col1 = lerpColor(color(palette.soilDark), color(palette.lichen), constrain(e / 1.4, 0, 1));
  let col2 = lerpColor(color(palette.bone), color(palette.glow), constrain(e / 1.4, 0, 1));

  if (state === "collapse") {
    col1 = color(70, 55, 48, 220);
    col2 = color(180, 150, 120, 120);
  } else if (state === "splitting") {
    col2 = color(250, 230, 180, 200);
  } else if (state === "dying") {
    col1 = color(45, 40, 38, 180);
    col2 = color(150, 130, 120, 80);
  }

  noStroke();
  fill(red(col1), green(col1), blue(col1), 220);
  circle(c.x, c.y, s * pulse);

  fill(red(col2), green(col2), blue(col2), 95);
  circle(c.x, c.y, s * 1.85);

  fill(20, 18, 16, 180);
  circle(c.x + cos(t + c.seed) * 1.4, c.y + sin(t * 1.3 + c.seed) * 1.4, s * 0.35);
noStroke();
fill(255, 90, 20, 25);
circle(c.x, c.y, s * 3.5);

fill(255, 120, 40, 15);
circle(c.x, c.y, s * 5.5);
  stroke(255, 60);
  strokeWeight(1);
  noFill();
  for (let i = 0; i < 6; i++) {
    let a = (TWO_PI / 6) * i + (isLeft ? 0.1 : -0.1);
    let r1 = s * 0.45;
    let r2 = s * 0.66;
    line(
      c.x + cos(a) * r1,
      c.y + sin(a) * r1,
      c.x + cos(a) * r2,
      c.y + sin(a) * r2
    );
  }
}

function drawCells() {
  for (let c of cells) {
    let bodyWobble = 1 + 0.12 * sin(t * 4 + c.seed);
    let r = c.r * bodyWobble;

    let fillA = lerpColor(color(palette.soilMid), color(palette.lichen), constrain(c.energy / 1.5, 0, 1));
    let fillB = lerpColor(color(palette.bone), color(palette.glow), constrain(c.energy / 1.5, 0, 1));

    noStroke();
    fill(red(fillA), green(fillA), blue(fillA), 230);
    ellipse(c.x, c.y, r * 2.3, r * 1.95);

    noStroke();

fill(255, 80, 0, 20);
ellipse(c.x, c.y, r * 6, r * 6);

fill(255, 110, 30, 40);
ellipse(c.x, c.y, r * 3.8, r * 3.8);

fill(255, 70, 0, 180);
ellipse(c.x, c.y, r * 2.3, r * 1.95);

    let nx = c.x + cos(t * 2 + c.seed) * r * 0.18;
    let ny = c.y + sin(t * 2.3 + c.seed) * r * 0.18;
    fill(20, 18, 16, 190);
    ellipse(nx, ny, r * 0.55, r * 0.45);

    fill(255, 220, 160, 55);
    ellipse(c.x + cos(c.seed) * r * 0.55, c.y + sin(c.seed) * r * 0.35, r * 0.18, r * 0.18);
  }
}

function drawDebris() {
  noStroke();
  for (let i = debris.length - 1; i >= 0; i--) {
    let p = debris[i];
    p.age++;
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.96;
    p.vy *= 0.96;
    p.vy += 0.01;

    let lifeRatio = 1 - p.age / p.life;
    if (lifeRatio <= 0) {
      debris.splice(i, 1);
      continue;
    }

    let c = p.col || color(255);
    fill(red(c), green(c), blue(c), 200 * lifeRatio);
    circle(p.x, p.y, p.r * (1 + (1 - lifeRatio) * 2.2));
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  buildScene();
}