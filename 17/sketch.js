let seed;
let voids = [];
let seeds = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  colorMode(HSB, 360, 100, 100, 255);
  angleMode(RADIANS);
  strokeCap(ROUND);
  strokeJoin(ROUND);
  noLoop();

  seed = floor(random(1e9));
  generate();
}

function generate() {
  randomSeed(seed);
  noiseSeed(seed);
  noiseDetail(5, 0.48);

  voids = [];
  seeds = [];

  buildVoids();
  buildSeeds();
  redraw();
}

function draw() {
  drawDeepBackground();
  drawVoidRims();
  drawFlowField();
  drawVoidCenters();
  drawDust();
}

// -------------------------
// STRUCTURE
// -------------------------

function buildVoids() {
  let cx = width * 0.5;
  let cy = height * 0.5;
  let count = 10;

  for (let i = 0; i < count; i++) {
    let a = i * 2.39996323 + random(-0.35, 0.35);
    let r = lerp(70, 360, i / (count - 1));
    let x = cx + cos(a) * r + random(-35, 35);
    let y = cy + sin(a) * r + random(-35, 35);

    voids.push({
      x,
      y,
      r: random(75, 165),
      spin: random() < 0.5 ? -1 : 1,
      pull: random(0.8, 1.8),
      hue: random([165, 180, 194, 208, 280, 296, 20, 34])
    });
  }

  // edge holes so the composition feels endless, not framed
  for (let i = 0; i < 8; i++) {
    voids.push({
      x: random([-120, width + 120, random(width)]),
      y: random([-120, height + 120, random(height)]),
      r: random(55, 130),
      spin: random() < 0.5 ? -1 : 1,
      pull: random(0.7, 1.4),
      hue: random([170, 190, 205, 290, 310])
    });
  }
}

function buildSeeds() {
  // dense base grid
  let cols = 16;
  let rows = 16;
  let cellW = width / cols;
  let cellH = height / rows;

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      if (random() < 0.10) continue;

      seeds.push({
        x: gx * cellW + cellW * 0.5 + random(-cellW * 0.45, cellW * 0.45),
        y: gy * cellH + cellH * 0.5 + random(-cellH * 0.45, cellH * 0.45),
        len: random(120, 380),
        w: random(0.7, 3.2),
        hue: random([18, 26, 34, 42, 164, 176, 188, 202, 282, 300]),
        sat: random(35, 95),
        bri: random(65, 100),
        alpha: random(60, 180),
        drift: random(0.65, 1.55),
        phase: random(1000),
        kind: random() < 0.55 ? "blade" : "ribbon"
      });
    }
  }

  // halo seeds around voids
  for (let v of voids) {
    let n = floor(random(18, 38));
    for (let i = 0; i < n; i++) {
      let a = TWO_PI * i / n + random(-0.18, 0.18);
      let rr = v.r + random(12, 92);
      seeds.push({
        x: v.x + cos(a) * rr,
        y: v.y + sin(a) * rr,
        len: random(160, 520),
        w: random(0.8, 3.8),
        hue: random([v.hue, (v.hue + 18) % 360, (v.hue + 162) % 360]),
        sat: random(55, 100),
        bri: random(70, 100),
        alpha: random(70, 210),
        drift: random(0.7, 1.7),
        phase: random(1000),
        kind: random() < 0.7 ? "blade" : "ribbon"
      });
    }
  }

  // off-canvas seeds to fill corners and edges
  for (let i = 0; i < 120; i++) {
    seeds.push({
      x: random(-80, width + 80),
      y: random(-80, height + 80),
      len: random(90, 420),
      w: random(0.5, 3.0),
      hue: random([16, 28, 38, 150, 168, 182, 196, 282, 306]),
      sat: random(35, 100),
      bri: random(60, 100),
      alpha: random(45, 165),
      drift: random(0.55, 1.5),
      phase: random(1000),
      kind: random() < 0.5 ? "blade" : "ribbon"
    });
  }
}

// -------------------------
// BACKGROUND
// -------------------------

function drawDeepBackground() {
  background(230, 25, 3);

  // huge black radial depth
  noStroke();
  let cx = width * 0.5;
  let cy = height * 0.5;

  for (let i = 0; i < 30; i++) {
    let t = i / 29;
    let r = lerp(80, 980, t);
    fill(230, 20, lerp(12, 2, t), lerp(30, 8, t));
    ellipse(cx, cy, r, r);
  }

  // side darkness blooms
  blendMode(MULTIPLY);
  for (let i = 0; i < 16; i++) {
    fill(random([220, 240, 280]), random(8, 22), random(4, 12), 55);
    ellipse(
      random(-40, width + 40),
      random(-40, height + 40),
      random(180, 620),
      random(180, 620)
    );
  }
  blendMode(BLEND);

  // faint black gradient bands
  for (let y = 0; y < height; y += 2) {
    let t = y / height;
    stroke(220, 15, map(t, 0, 1, 10, 3), 10);
    line(0, y, width, y);
  }
}

function drawDust() {
  strokeWeight(1);
  for (let i = 0; i < 3800; i++) {
    let x = random(width);
    let y = random(height);
    let n = noise(x * 0.01, y * 0.01, seed * 0.000001);

    stroke(0, 0, 100, map(n, 0, 1, 3, 18));
    point(x, y);
  }
}

// -------------------------
// VOID SYSTEM
// -------------------------

function drawVoidRims() {
  blendMode(SCREEN);
  noStroke();

  for (let v of voids) {
    // outer glow
    for (let i = 6; i >= 1; i--) {
      let t = i / 6;
      fill(v.hue, 80, 100, 10 * t);
      ellipse(v.x, v.y, (v.r + 50 * i) * 2, (v.r + 36 * i) * 2);
    }

    // ring of fragments
    let pieces = floor(map(v.r, 55, 165, 16, 28, true));
    for (let i = 0; i < pieces; i++) {
      let a = TWO_PI * i / pieces + random(-0.12, 0.12);
      let rr = v.r + random(6, 22);
      let px = v.x + cos(a) * rr;
      let py = v.y + sin(a) * rr;

      push();
      translate(px, py);
      rotate(a + HALF_PI);

      fill((v.hue + random(-15, 15) + 360) % 360, 75, 100, random(18, 60));
      beginShape();
      vertex(0, 0);
      vertex(random(8, 18), random(-3, 3));
      vertex(random(16, 34), random(2, 10));
      vertex(random(6, 16), random(12, 24));
      endShape(CLOSE);

      pop();
    }
  }

  blendMode(BLEND);
}

function drawVoidCenters() {
  // repaint the interiors so they read as real holes
  noStroke();
  for (let v of voids) {
    for (let i = 0; i < 14; i++) {
      let t = i / 13;
      let rr = lerp(v.r * 0.05, v.r * 1.02, t);
      fill(230, 20, lerp(0, 8, t), lerp(255, 8, t));
      ellipse(v.x, v.y, rr * 2, rr * 2);
    }

    // subtle inner rim
    noFill();
    stroke(v.hue, 35, 95, 24);
    strokeWeight(1);
    ellipse(v.x, v.y, v.r * 1.65, v.r * 1.65);
  }
}

// -------------------------
// FLOW FIELD
// -------------------------

function fieldAngle(x, y) {
  let cx = width * 0.5;
  let cy = height * 0.5;

  let dx = x - cx;
  let dy = y - cy;
  let d = sqrt(dx * dx + dy * dy) + 0.001;

  // primary vortex
  let tx = -dy / d;
  let ty = dx / d;

  // inward sink to create cave tunnel pressure
  tx += (-dx / d) * 0.18;
  ty += (-dy / d) * 0.18;

  // perlin drift
  let n1 = noise(x * 0.0021, y * 0.0021, seed * 0.000001);
  let n2 = noise(x * 0.0051 + 50, y * 0.0051 + 50, seed * 0.000002);

  let a1 = n1 * TWO_PI * 3.6;
  let a2 = n2 * TWO_PI * 2.2;

  tx += cos(a1) * 0.95;
  ty += sin(a1) * 0.95;
  tx += cos(a2 + d * 0.01) * 0.35;
  ty += sin(a2 + d * 0.01) * 0.35;

  // void swirls and repulsion
  for (let v of voids) {
    let ox = x - v.x;
    let oy = y - v.y;
    let od = sqrt(ox * ox + oy * oy) + 0.001;

    let swirlX = -oy / od;
    let swirlY = ox / od;

    let influence = (v.r * v.r) / (od * od + v.r * v.r * 0.7);
    influence = constrain(influence * v.pull, 0, 2.2);

    tx += swirlX * influence * v.spin * 0.95;
    ty += swirlY * influence * v.spin * 0.95;

    // push away from the void center
    tx += (-ox / od) * influence * 0.22;
    ty += (-oy / od) * influence * 0.22;
  }

  return atan2(ty, tx);
}

function colorAt(x, y, t, hueBase, satBase, briBase) {
  let n = noise(x * 0.002, y * 0.002, t * 0.9 + seed * 0.000001);
  let h = (hueBase + map(n, 0, 1, -30, 30) + (x / width) * 16 + (y / height) * 10) % 360;
  let s = constrain(satBase + map(n, 0, 1, -12, 14), 0, 100);
  let b = constrain(briBase + map(n, 0, 1, -14, 12), 0, 100);
  return color(h, s, b);
}

// -------------------------
// RIBBONS / BLADES
// -------------------------

function drawFlowField() {
  let sorted = seeds.slice().sort((a, b) => a.len - b.len);

  // broad glow pass
  blendMode(ADD);
  for (let s of sorted) {
    drawTrail(s, 0);
  }

  // main body pass
  blendMode(BLEND);
  for (let s of sorted) {
    drawTrail(s, 1);
  }

  // highlight pass
  blendMode(SCREEN);
  for (let s of sorted) {
    drawTrail(s, 2);
  }

  blendMode(BLEND);
}

function drawTrail(s, pass) {
  let x = s.x;
  let y = s.y;

  let steps = floor(map(s.len, 90, 420, 80, 240, true));
  let step = map(s.len, 90, 420, 2.2, 4.2, true);

  let jitter = s.phase * 0.001;

  for (let i = 0; i < steps; i++) {
    let t = i / steps;
    let fade = pow(1 - t, 1.3);

    let ang = fieldAngle(x, y);
    let wob = (noise(jitter + t * 1.3, x * 0.002, y * 0.002) - 0.5) * 1.2;
    let finalAng = ang + wob * 0.45;

    let nx = x + cos(finalAng) * step * s.drift;
    let ny = y + sin(finalAng) * step * s.drift;

    let c = colorAt(x, y, t, s.hue, s.sat, s.bri);

    // ================= GLOW SYSTEM =================

    let energy = sin(t * PI); // strongest mid curve
    let glowBoost = map(energy, 0, 1, 0.6, 1.8);

    if (pass === 0) {
      // OUTER BLOOM (big soft glow)
      stroke(hue(c), saturation(c), 100, s.alpha * 0.10 * glowBoost * fade);
      strokeWeight(s.w * 10 * fade + 2);
      line(x, y, nx, ny);

      // MID BLOOM
      stroke(hue(c), saturation(c), 100, s.alpha * 0.18 * glowBoost * fade);
      strokeWeight(s.w * 6 * fade + 1.2);
      line(x, y, nx, ny);
    }

    else if (pass === 1) {
      // CORE COLOR BODY
      stroke(hue(c), saturation(c), brightness(c), s.alpha * 0.55 * fade);
      strokeWeight(s.w * 2.2 * fade + 0.4);
      line(x, y, nx, ny);

      // HOT CORE (bright center)
      stroke(hue(c), saturation(c) * 0.6, 100, s.alpha * 0.35 * fade);
      strokeWeight(s.w * 1.0 * fade + 0.2);
      line(x, y, nx, ny);
    }

    else {
      // SHARP HIGHLIGHT
      stroke(0, 0, 100, s.alpha * 0.25 * fade);
      strokeWeight(max(0.4, s.w * 0.6 * fade));
      line(x, y, nx, ny);
    }

    // ================= ENERGY PARTICLES =================

    if (pass === 1 && random() < 0.06) {
      noStroke();
      fill(hue(c), saturation(c), 100, 25 * fade);
      ellipse(x, y, s.w * 6 * energy, s.w * 6 * energy);
    }

    x = nx;
    y = ny;

    if (x < -200 || x > width + 200 || y < -200 || y > height + 200) break;
  }
}

// -------------------------
// INTERACTION
// -------------------------

function mousePressed() {
  seed = floor(random(1e9));
  generate();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  seed = floor(random(1e9));
  generate();
}