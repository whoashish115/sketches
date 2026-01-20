let ribbons = [];
let blobs = [];

let THEME = [
  '#ffb5e0',
  '#ff6eaa',
  '#ff4aba',
  '#bd266a',
  '#ba093e',
  '#8f2855',
  '#2e0215',
  '#570629'
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(2);
  smooth();
  noStroke();
  generateScene();
  noLoop();
}

function draw() {
  drawBackground();

  const items = [];

  for (const b of blobs) items.push({ type: 'blob', depth: b.depth, data: b });
  for (const r of ribbons) items.push({ type: 'ribbon', depth: r.depth, data: r });

  items.sort((a, b) => a.depth - b.depth);

  for (const item of items) {
    if (item.type === 'blob') drawBlob(item.data);
    else drawRibbon(item.data);
  }
}

function generateScene() {
  ribbons = [];
  blobs = [];

  const ribbonCount = int(random(10, 16));
  const blobCount = int(random(28, 52));

  for (let i = 0; i < ribbonCount; i++) {
    ribbons.push({
      cx: random(width),
      cy: random(height),
      rx: random(width * 0.14, width * 0.34),
      ry: random(height * 0.14, height * 0.34),
      thick: random(120, 240),
      steps: int(random(420, 700)),
      seed: random(1000),
      twist: random(1.4, 4.2),
      bendX: random(30, 120),
      bendY: random(30, 120),
      rot: random(TWO_PI),
      phase1: random(TWO_PI),
      phase2: random(TWO_PI),
      phase3: random(TWO_PI),
      gradAngle: random(TWO_PI),
      stops: generatePaletteVariant(),
      depth: random(0.15, 0.85)
    });
  }

  for (let i = 0; i < blobCount; i++) {
    const pal = generatePaletteVariant();
    blobs.push({
      x: random(width),
      y: random(height),
      r: random(18, 110),
      depth: random(0, 1),
      stops: pal,
      alpha: random(0.16, 0.55),
      stretchX: random(0.7, 1.5),
      stretchY: random(0.7, 1.5),
      rot: random(TWO_PI),
      seed: random(1000)
    });
  }
}

function generatePaletteVariant() {
  const arr = shuffleArray([...THEME]);
  const keep = int(random(4, min(8, arr.length + 1)));
  const out = [];

  for (let i = 0; i < keep; i++) {
    const c = color(arr[i]);
    out.push(color(
      constrain(red(c) + random(-18, 18), 0, 255),
      constrain(green(c) + random(-18, 18), 0, 255),
      constrain(blue(c) + random(-18, 18), 0, 255)
    ));
  }

  return out;
}

function shuffleArray(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = floor(random(i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function drawBackground() {
  background(255, 176, 229);

  const ctx = drawingContext;

  const g1 = ctx.createRadialGradient(
    width * 0.2, height * 0.2, 10,
    width * 0.2, height * 0.2, width * 0.95
  );
  g1.addColorStop(0, 'rgba(255,255,255,0.05)');
  g1.addColorStop(0.35, 'rgba(255,255,255,0.02)');
  g1.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, width, height);

  const g2 = ctx.createRadialGradient(
    width * 0.8, height * 0.72, 10,
    width * 0.8, height * 0.72, width * 0.85
  );
  g2.addColorStop(0, 'rgba(255,80,0,0.06)');
  g2.addColorStop(0.4, 'rgba(255,120,20,0.03)');
  g2.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, width, height);
}

function drawRibbon(cfg) {
  const center = buildPath(cfg);
  const { upper, lower } = buildEdges(center, cfg);

  drawShape(upper, lower, cfg, true, 12, 16);
  drawShape(upper, lower, cfg, false, 0, 0);

  blendMode(ADD);
  drawHighlight(upper, lower, center);
  blendMode(BLEND);
}

function buildPath(cfg) {
  const pts = [];

  for (let i = 0; i < cfg.steps; i++) {
    const t = i / cfg.steps;
    const a = t * TWO_PI;

    const n = noise(cfg.seed + cos(a) * 0.8, cfg.seed + sin(a) * 0.8);

    const rX = cfg.rx + n * 150;
    const rY = cfg.ry + n * 150;

    let x = cfg.cx + cos(a + cfg.rot) * rX + sin(a * 3 + cfg.phase1) * cfg.bendX;
    let y = cfg.cy + sin(a + cfg.rot) * rY + cos(a * 2 + cfg.phase2) * cfg.bendY;

    x += cos(a * 4 + cfg.phase3) * 10;
    y += sin(a * 4 + cfg.phase1) * 10;

    pts.push(createVector(x, y));
  }

  return pts;
}

function buildEdges(center, cfg) {
  const upper = [];
  const lower = [];

  for (let i = 0; i < center.length; i++) {
    const p = center[i];
    const next = center[(i + 1) % center.length];

    const tangent = p5.Vector.sub(next, p).normalize();
    const normal = createVector(-tangent.y, tangent.x);

    const t = i / center.length;
    const w = cfg.thick * (0.72 + 0.28 * sin(t * TWO_PI * cfg.twist + cfg.phase1));

    upper.push(p5.Vector.add(p, p5.Vector.mult(normal, w * 0.5)));
    lower.push(p5.Vector.add(p, p5.Vector.mult(normal, -w * 0.5)));
  }

  return { upper, lower };
}

function drawShape(upper, lower, cfg, shadow, ox, oy) {
  const ctx = drawingContext;

  ctx.save();
  ctx.translate(ox, oy);

  ctx.beginPath();
  ctx.moveTo(upper[0].x, upper[0].y);
  for (let i = 1; i < upper.length; i++) ctx.lineTo(upper[i].x, upper[i].y);
  for (let i = lower.length - 1; i >= 0; i--) ctx.lineTo(lower[i].x, lower[i].y);
  ctx.closePath();
  ctx.clip();

  if (shadow) {
    ctx.filter = 'blur(12px)';
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, width, height);
    ctx.filter = 'none';
  } else {
    const span = max(width, height) * 1.6;
    const x0 = cfg.cx - cos(cfg.gradAngle) * span;
    const y0 = cfg.cy - sin(cfg.gradAngle) * span;
    const x1 = cfg.cx + cos(cfg.gradAngle) * span;
    const y1 = cfg.cy + sin(cfg.gradAngle) * span;

    const g = ctx.createLinearGradient(x0, y0, x1, y1);

    const offset = random(); // shifts the rainbow mix per ribbon
    for (let i = 0; i < cfg.stops.length; i++) {
      const stop = (i / (cfg.stops.length - 1) + offset) % 1;
      g.addColorStop(stop, rgba(cfg.stops[i], 1));
    }

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}

function drawHighlight(upper, lower, center) {
  const ctx = drawingContext;

  const a = [];
  const b = [];

  for (let i = 0; i < center.length; i++) {
    a.push(p5.Vector.lerp(center[i], upper[i], 0.18));
    b.push(p5.Vector.lerp(center[i], upper[i], 0.42));
  }

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(a[0].x, a[0].y);
  for (const p of a) ctx.lineTo(p.x, p.y);
  for (let i = b.length - 1; i >= 0; i--) ctx.lineTo(b[i].x, b[i].y);
  ctx.closePath();
  ctx.clip();

  const g = ctx.createLinearGradient(0, 0, width, height);
  g.addColorStop(0.35, 'rgba(255,255,255,0.00)');
  g.addColorStop(0.48, 'rgba(255,255,255,0.08)');
  g.addColorStop(0.50, 'rgba(255,255,255,0.22)');
  g.addColorStop(0.52, 'rgba(255,255,255,0.08)');
  g.addColorStop(0.65, 'rgba(255,255,255,0.00)');

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function drawBlob(b) {
  const ctx = drawingContext;

  const c = b.stops[floor(random(b.stops.length))];

  const rx = b.r * b.stretchX;
  const ry = b.r * b.stretchY;

  ctx.save();
  ctx.translate(b.x, b.y);
  ctx.rotate(b.rot);

  // ✅ solid color (no transparency)
  fill(red(c), green(c), blue(c));

  beginShape();
  for (let i = 0; i < 50; i++) {
    let angle = map(i, 0, 50, 0, TWO_PI);

    // smooth organic distortion
    let offset = map(
      noise(b.seed + cos(angle), b.seed + sin(angle)),
      0, 1,
      0.9, 1.1
    );

    let x = cos(angle) * rx * offset;
    let y = sin(angle) * ry * offset;

    vertex(x, y);
  }
  endShape(CLOSE);

  ctx.restore();
}

function rgba(c, a) {
  return `rgba(${red(c)},${green(c)},${blue(c)},${a})`;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateScene();
  redraw();
}