let seed;
let blooms = [];
let embers = [];
let threads = [];
let fogPatches = [];

const PALETTE = [310, 320, 330, 340, 350]; 

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  colorMode(HSB, 360, 100, 100, 255);
  angleMode(RADIANS);
  noLoop();

  seed = floor(random(1e9));
  regenerate();
}

function regenerate() {
  randomSeed(seed);
  noiseSeed(seed);

  blooms = [];
  embers = [];
  threads = [];
  fogPatches = [];

  let step = max(700, floor(min(width, height) / 10));
  let margin = step * 1.25;

  // Main bloom field: noise-driven, full-screen, clustered like growth zones
  for (let gx = -margin; gx <= width + margin; gx += step) {
    for (let gy = -margin; gy <= height + margin; gy += step) {
      let n1 = noise(gx * 0.0023, gy * 0.0023);
      let n2 = noise(gx * 0.0067 + 80, gy * 0.0067 - 80);
      let n3 = noise(gx * 0.0125 - 120, gy * 0.0125 + 120);

      let density = pow(constrain((n1 - 0.26) * 1.55, 0, 1), 1.7);
      let texture = map(n2, 0, 1, 0.15, 1.0);
      let chaos = n3 > 0.63 ? 1 : 0;

      let spawnCount = 0;
      if (random() < density * 0.95 + chaos * 0.22) spawnCount = 1;
      if (density > 0.58 && random() < 0.58) spawnCount++;
      if (density > 0.78 && random() < 0.35) spawnCount++;

      for (let i = 0; i < spawnCount; i++) {
        let jx = random(-step * 0.42, step * 0.42);
        let jy = random(-step * 0.42, step * 0.42);

        blooms.push(createBloom(
          gx + jx,
          gy + jy,
          density,
          texture,
          floor(random(3))
        ));
      }
    }
  }

  // Secondary micro blooms to remove empty space and add richness
  let microCount = floor((width * height) / 10000);
  for (let i = 0; i < microCount; i++) {
    let x = random(-40, width + 40);
    let y = random(-40, height + 40);
    let n = noise(x * 0.008, y * 0.008);
    if (n > 0.34 || random() < 0.14) {
      blooms.push(createBloom(x, y, 0.22 + n * 0.5, n, 2));
    }
  }

  blooms.sort((a, b) => (a.depth - b.depth) || (a.y - b.y));

  // Flow-field threads: tree-like background structure
  let threadCount = floor(width * height * 0.0028);
  for (let i = 0; i < threadCount; i++) {
    let x = random(width);
    let y = random(height);
    let n = noise(x * 0.0028, y * 0.0028);
    let h = PALETTE[floor(n * PALETTE.length) % PALETTE.length];
    threads.push({
      x,
      y,
      len: random(10, 42),
      w: random(0.35, 1.45),
      hue: h,
      phase: random(1000),
      alpha: random(8, 30),
      layer: floor(random(3))
    });
  }

  // Dust / embers
  let emberCount = floor(width * height * 0.0032);
  for (let i = 0; i < emberCount; i++) {
    let x = random(width);
    let y = random(height);
    let n = noise(x * 0.003, y * 0.003);
    embers.push({
      x,
      y,
      r: random(0.5, 2.8) * map(n, 0, 1, 0.7, 1.35),
   hue: random([320, 330, 340, 350]),
      s: random(18, 90),
      b: random(45, 100),
      a: random(16, 120)
    });
  }

  // Fog patches
  for (let i = 0; i < 16; i++) {
    fogPatches.push({
      x: random(width),
      y: random(height),
      r: random(min(width, height) * 0.12, min(width, height) * 0.38),
      hue:random([310, 320, 330, 340, 350]),
      a: random(8, 28)
    });
  }
}

function createBloom(cx, cy, density, texture, depth) {
  let n = noise(cx * 0.004, cy * 0.004);
  let baseSize = lerp(22, 92, pow(constrain(density + texture * 0.22, 0, 1), 0.85));
  let size = baseSize * random(0.7, 1.35);

 let huePool = [310, 320, 330, 340, 350];

  let h = random(huePool);
  let petals = floor(map(n, 0, 1, 18, 58));
  if (size < 32) petals = floor(map(n, 0, 1, 8, 22));

  let bladeCount = petals + floor(random(8, 26));
  let flow = fieldAngle(cx, cy, random(1000));

  let blades = [];
  for (let i = 0; i < bladeCount; i++) {
    let a = random(TWO_PI);
    let radial = pow(random(), 0.58) * size * 0.52;
    let localHue = h + random(-22, 22);

    blades.push({
      angle: a,
      radius: radial,
      len: random(size * 0.7, size * 2.2),
      thick: random(size * 0.06, size * 0.22),
      curve: random(0.18, 1.65),
      twist: random(-1.7, 1.7),
      wobble: random(0.5, 2.7),
      phase: random(1000),
      hueShift: localHue - h,
      layer: floor(random(3)),
      glow: random(0.3, 1.0)
    });
  }

  return {
    x: cx,
    y: cy,
    size,
    hue: h,
    petals,
    depth,
    flow,
    glow: random(0.6, 1.5),
    blades
  };
}

function draw() {
  randomSeed(seed);
  noiseSeed(seed);

  drawBackground();
  drawFog();
  drawThreads();
  drawEmbers();

  blendMode(ADD);
  for (let b of blooms) {
    drawBloom(b);
  }
  blendMode(BLEND);

  drawTopGlow();
  drawFrame();
}

function drawBackground() {
  let ctx = drawingContext;
  let g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, "hsla(228, 42%, 7%, 1)");
  g.addColorStop(0.42, "hsla(245, 38%, 9%, 1)");
  g.addColorStop(1, "hsla(24, 36%, 7%, 1)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);

  noStroke();

  // Big ambient glows
  for (let i = 0; i < 12; i++) {
    let x = width * 0.5 + random(-width * 0.35, width * 0.35);
    let y = height * 0.5 + random(-height * 0.35, height * 0.35);
    let r = random(min(width, height) * 0.18, min(width, height) * 0.62);
    let h =    random([310, 320, 330, 340, 350])
    fill(h, 30, 18, 10);
    ellipse(x, y, r * 2.1, r * 1.6);
  }

  // Fine grain
  for (let i = 0; i < 1800; i++) {
    let x = random(width);
    let y = random(height);
    let n = noise(x * 0.01, y * 0.01);
    fill(210 + 20 * sin(n * TAU), 18, 18 + n * 12, 5);
    rect(x, y, 1, 1);
  }
}

function drawFog() {
  noStroke();
  for (let f of fogPatches) {
    for (let i = 0; i < 5; i++) {
      let rr = f.r * (0.35 + i * 0.25);
      fill(f.hue, 18, 30 + i * 6, f.a * (0.35 - i * 0.04));
      ellipse(f.x, f.y, rr * 2, rr * 1.4);
    }
  }
}

function drawThreads() {
  strokeCap(ROUND);
  strokeJoin(ROUND);
  for (let t of threads) {
    let x = t.x;
    let y = t.y;
    let steps = floor(t.len / 5);

    for (let i = 0; i < steps; i++) {
      let p = i / max(1, steps);
      let a = fieldAngle(x, y, t.phase + p * 1.35);
      let stepSize = lerp(3.2, 1.1, p);

      stroke(t.hue, 32, 80, t.alpha * (1 - p) * 0.42);
      strokeWeight(t.w * (1.2 - p * 0.55));
      point(x, y);

      let nx = x + cos(a) * stepSize;
      let ny = y + sin(a) * stepSize;

      stroke(t.hue + 10, 24, 92, t.alpha * (1 - p) * 0.12);
      strokeWeight(max(0.25, t.w * 0.45));
      line(x, y, nx, ny);

      x = nx;
      y = ny;
    }
  }
}

function drawEmbers() {
  noStroke();
  for (let e of embers) {
    fill(e.hue, e.s, e.b, e.a * 0.2);
    ellipse(e.x, e.y, e.r * 7, e.r * 7);

    fill((e.hue + 18) % 360, min(100, e.s + 8), min(100, e.b + 10), e.a * 0.38);
    ellipse(e.x, e.y, e.r * 2.1, e.r * 2.1);
  }
}

function drawBloom(b) {
  push();
  translate(b.x, b.y);

  // Base aura
  noStroke();
  for (let i = 0; i < 4; i++) {
    let rr = b.size * (1.6 + i * 0.55);
    fill(b.hue + i * 3, 26, 90, 10 - i * 1.5);
    ellipse(0, 0, rr * 2, rr * 1.6);
  }

  // Blades, layered for depth
  for (let layer = 0; layer < 3; layer++) {
    for (let blade of b.blades) {
      if (blade.layer !== layer) continue;
      drawBlade(b, blade, layer);
    }
  }

  // Core glow
  noStroke();
  for (let i = 0; i < 7; i++) {
    let rr = 6 + i * 6 + b.size * 0.05;
    fill((b.hue + 14) % 360, 36, 100, 20 - i * 1.6);
    ellipse(0, 0, rr * 2, rr * 2);
  }

  pop();
}

function drawBlade(bloom, blade, layer) {
  let cx = cos(blade.angle) * blade.radius;
  let cy = sin(blade.angle) * blade.radius;

  let startX = bloom.x + cx;
  let startY = bloom.y + cy;

  let localFlow = fieldAngle(startX, startY, bloom.hue * 0.01 + blade.phase * 0.002);
  let baseA = blade.angle + blade.twist * 0.22 + localFlow * 0.08;

  let len = blade.len * (0.72 + bloom.size / 160);
  let thick = blade.thick * (0.8 + bloom.size / 140);
  let steps = floor(map(layer, 0, 2, 42, 84));

  let x = startX;
  let y = startY;
  let spine = [];

  for (let i = 0; i <= steps; i++) {
    let t = i / steps;
    let taper = sin(PI * constrain(t, 0, 1));

    let n1 = noise(blade.phase + t * 1.45, bloom.x * 0.002 + bloom.y * 0.002);
    let n2 = noise(startX * 0.005 + t * 0.5, startY * 0.005 - t * 0.5, blade.phase * 0.01);

    let curl = (n1 - 0.5) * 2.0 * blade.curve;
    let sway = sin(t * PI * (1.1 + blade.twist * 0.18) + blade.phase * 0.01) * blade.wobble;

    let field = fieldAngle(x, y, blade.phase * 0.003 + t * 0.7);
    let ang = baseA
      + curl * 0.36
      + field * 0.05
      + sway * 0.018
      + sin((t + layer * 0.12) * TAU * 1.3 + bloom.flow * 0.01) * 0.04;

    let stepLen = len / steps;
    x += cos(ang) * stepLen;
    y += sin(ang) * stepLen;

    spine.push({
      x,
      y,
      t,
      w: thick * (0.18 + 0.98 * taper),
      ang
    });
  }

  let baseHue = (bloom.hue + blade.hueShift) % 360;
  let sat = [82, 90, 68][layer];
  let bri = [82, 94, 78][layer];

  // Glow pass
  for (let k = 0; k < 3; k++) {
    stroke((baseHue + k * 8) % 360, sat, bri, 18 - k * 4);
    strokeWeight(thick * (2.4 + k * 1.35) * blade.glow * 0.65);
    noFill();
    beginShape();
    for (let p of spine) {
      let off = sin(p.t * PI * 2 + blade.phase * 0.01) * 1.25 * bloom.glow;
      vertex(
        p.x + cos(p.ang + HALF_PI) * off,
        p.y + sin(p.ang + HALF_PI) * off
      );
    }
    endShape();
  }

  // Blade body
  for (let i = 0; i < spine.length - 1; i++) {
    let p0 = spine[i];
    let p1 = spine[i + 1];

    let dx = p1.x - p0.x;
    let dy = p1.y - p0.y;
    let magv = max(0.0001, sqrt(dx * dx + dy * dy));
    dx /= magv;
    dy /= magv;

    let nx = -dy;
    let ny = dx;

    let w0 = p0.w;
    let w1 = p1.w;

    let h0 = (baseHue + 22 * p0.t + 8 * sin(p0.t * TAU + blade.phase * 0.01)) % 360;
    let h1 = (baseHue + 22 * p1.t + 8 * sin(p1.t * TAU + blade.phase * 0.01 + 0.5)) % 360;

    let s0 = sat + 8 * sin(p0.t * TAU * 2.2 + blade.phase);
    let s1 = sat + 10 * sin(p1.t * TAU * 2.2 + blade.phase + 0.7);

    let b0 = bri * (0.34 + 0.72 * sin(p0.t * PI));
    let b1 = bri * (0.34 + 0.72 * sin(p1.t * PI));

    let lx0 = p0.x + nx * w0 * 0.5;
    let ly0 = p0.y + ny * w0 * 0.5;
    let rx0 = p0.x - nx * w0 * 0.5;
    let ry0 = p0.y - ny * w0 * 0.5;

    let lx1 = p1.x + nx * w1 * 0.5;
    let ly1 = p1.y + ny * w1 * 0.5;
    let rx1 = p1.x - nx * w1 * 0.5;
    let ry1 = p1.y - ny * w1 * 0.5;

    let c = lerpColor(
      color(h0, s0, b0, 220),
      color(h1, s1, b1, 220),
      0.5
    );

    stroke(hue(c), saturation(c), brightness(c), 150);
    strokeWeight(1.0 + layer * 0.1);
    fill(hue(c), saturation(c), brightness(c), 48);

    beginShape();
    vertex(lx0, ly0);
    vertex(lx1, ly1);
    vertex(rx1, ry1);
    vertex(rx0, ry0);
    endShape(CLOSE);

    if (i % 4 === 0) {
      stroke((h0 + 18) % 360, min(100, s0 + 12), min(100, b0 + 10), 90);
      strokeWeight(0.65);
      line(
        p0.x + nx * w0 * 0.14,
        p0.y + ny * w0 * 0.14,
        p1.x + nx * w1 * 0.14,
        p1.y + ny * w1 * 0.14
      );
    }
  }

  let tip = spine[spine.length - 1];
  noStroke();
  fill((baseHue + 12) % 360, 24, 100, 58);
  ellipse(tip.x, tip.y, thick * 0.85, thick * 0.85);
}

function drawTopGlow() {
  noStroke();

  // Central atmospheric bloom to unify the piece
  push();
  translate(width / 2, height / 2);
  for (let i = 0; i < 14; i++) {
    let rr = 30 + i * 20;
   fill(330 + i * 2, 34, 100, 11 - i * 0.55);
    ellipse(0, 0, rr * 2.2, rr * 1.9);
  }
  pop();

  // Edge mist to remove empty borders
  for (let i = 0; i < 10; i++) {
    let x = random(width);
    let y = random(height);
    let rr = random(min(width, height) * 0.12, min(width, height) * 0.22);
    fill(random([190, 205, 286, 300, 34]), 20, 18, 6);
    ellipse(x, y, rr * 2, rr * 1.4);
  }
}

function drawFrame() {
  noFill();

  stroke(25, 20, 18, 230);
  strokeWeight(max(16, min(width, height) * 0.04));
  rect(0, 0, width, height);

  stroke(36, 34, 96, 70);
  strokeWeight(1.4);
  rect(18, 18, width - 36, height - 36);

  stroke(200, 14, 22, 42);
  strokeWeight(7);
  rect(8, 8, width - 16, height - 16);
}

function fieldAngle(x, y, phase) {
  let n1 = noise(x * 0.0028 + phase * 0.004, y * 0.0028 - phase * 0.003);
  let n2 = noise(x * 0.0078 - 100, y * 0.0078 + 100, phase * 0.02);
  let n3 = noise(x * 0.015 + 200, y * 0.015 - 200);

  let a = (n1 - 0.5) * TWO_PI * 2.8;
  a += (n2 - 0.5) * TWO_PI * 1.3;
  a += sin((x + y) * 0.004 + phase * 0.02) * 0.35;
  a += (n3 - 0.5) * 0.9;
  return a;
}

function keyPressed() {
  if (key === 'r' || key === 'R') {
    seed = floor(random(1e9));
    regenerate();
    redraw();
  }
  if (key === 's' || key === 'S') {
    saveCanvas(`blade-flower-${seed}`, 'png');
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  regenerate();
  redraw();
}