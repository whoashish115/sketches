let seed = Math.floor(Math.random() * 1000000);
let shapes = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(2);
  noLoop();
  randomSeed(seed);
  noiseSeed(seed);
  noiseDetail(10, 0.65);
  colorMode(HSB, 360, 100, 100, 1);
  background(0, 0, 8); // deep charcoal
  
  generateArtwork();
}

// ------------------------------------------------------------
// MAIN GENERATION ENGINE
// ------------------------------------------------------------
function generateArtwork() {
  // 1. Background gradient wash (large radial gradient)
  let bgGrad = new RadialGradient(width/2, height/2, width*0.85, [
    { offset: 0, color: color(200, 30, 18) },
    { offset: 0.4, color: color(260, 45, 12) },
    { offset: 0.7, color: color(320, 55, 8) },
    { offset: 1, color: color(0, 0, 5) }
  ]);
  shapes.push({ type: 'rect', gradient: bgGrad, blend: BLEND });
  
  // 2. Generate a recursive structure of overlapping abstract shapes
  let rootDepth = 6;
  recursiveShapeGrid(width/2, height/2, min(width, height) * 0.9, rootDepth, 0);
  
  // 3. Add floating organic "islands" (curved polygons)
  let numIslands = 28;
  for (let i = 0; i < numIslands; i++) {
    let center = createVector(random(width), random(height));
    let radius = random(40, 180);
    let complexity = floor(random(4, 12));
    let verts = generateOrganicShape(center, radius, complexity);
    let grad = buildIslandGradient(center, radius);
    shapes.push({ type: 'polygon', vertices: verts, gradient: grad, blend: BLEND });
  }
  
  // 4. Fine geometric lines (accent strokes)
  addAccentLines();
  
  // 5. Draw everything
  drawAllShapes();
  
  // 6. Post-processing: micro-contrast grain & soft vignette
  applyGrain(4);
  applyVignette();
  
  console.log("Artwork complete | seed:", seed);
}

// ------------------------------------------------------------
// RECURSIVE SHAPE SUBDIVISION (fractal-like)
// ------------------------------------------------------------
function recursiveShapeGrid(x, y, size, depth, variant) {
  if (depth <= 0 || size < 12) return;
  
  let shapeType = (variant + depth) % 5;
  let rotation = noise(x * 0.002, y * 0.002, seed * 0.0001) * TWO_PI;
  let vertices = [];
  
  if (shapeType === 0) {
    // polygon with varying sides
    let sides = floor(map(noise(x*0.003, y*0.003, depth), 0, 1, 3, 10));
    for (let i = 0; i < sides; i++) {
      let angle = (i / sides) * TWO_PI + rotation;
      let rad = size * (0.7 + noise(x*0.01, y*0.01, angle)*0.3);
      let vx = x + cos(angle) * rad;
      let vy = y + sin(angle) * rad;
      vertices.push(createVector(vx, vy));
    }
  } 
  else if (shapeType === 1) {
    // star shape
    let points = floor(random(5, 12));
    let innerRad = size * 0.4;
    let outerRad = size;
    for (let i = 0; i < points * 2; i++) {
      let angle = (i / (points*2)) * TWO_PI + rotation;
      let rad = (i % 2 === 0) ? outerRad : innerRad;
      let vx = x + cos(angle) * rad;
      let vy = y + sin(angle) * rad;
      vertices.push(createVector(vx, vy));
    }
  }
  else if (shapeType === 2) {
    // smooth bezier blob
    let ctrlPoints = floor(random(4, 10));
    for (let i = 0; i < ctrlPoints; i++) {
      let angle = (i / ctrlPoints) * TWO_PI + rotation;
      let rad = size * (0.8 + noise(x*0.008, y*0.008, angle)*0.4);
      let vx = x + cos(angle) * rad;
      let vy = y + sin(angle) * rad;
      vertices.push(createVector(vx, vy));
    }
    // close smoothly (we'll draw as polygon anyway)
  }
  else if (shapeType === 3) {
    // rounded rectangle with twist
    let w = size;
    let h = size * random(0.6, 1.4);
    let rx = x - w/2, ry = y - h/2;
    let corners = 4;
    for (let i = 0; i < corners; i++) {
      let angle = (i / corners) * TWO_PI + rotation;
      let vx = rx + (i===0||i===3 ? 0 : w);
      let vy = ry + (i<2 ? 0 : h);
      vertices.push(createVector(vx, vy));
    }
  }
  else {
    // crescent-like arc shape
    let rad1 = size * 0.6;
    let rad2 = size * 0.3;
    let startAngle = rotation;
    let endAngle = rotation + PI * 1.4;
    for (let t = startAngle; t <= endAngle; t += 0.1) {
      let rad = rad1 + sin(t * 3) * rad2;
      let vx = x + cos(t) * rad;
      let vy = y + sin(t) * rad;
      vertices.push(createVector(vx, vy));
    }
    vertices.push(createVector(x, y));
  }
  
  if (vertices.length >= 3) {
    let grad = buildSubdivisionGradient(x, y, size, depth);
    shapes.push({ type: 'polygon', vertices: vertices, gradient: grad, blend: BLEND });
  }
  
  // Recursive children: offset and smaller
  let childCount = floor(map(noise(x*0.005, y*0.005, depth*0.3), 0, 1, 2, 5));
  for (let i = 0; i < childCount; i++) {
    let angleChild = random(TWO_PI);
    let distChild = size * random(0.4, 0.8);
    let nx = x + cos(angleChild) * distChild;
    let ny = y + sin(angleChild) * distChild;
    let newSize = size * random(0.35, 0.6);
    recursiveShapeGrid(nx, ny, newSize, depth-1, variant + i);
  }
}

// ------------------------------------------------------------
// ORGANIC SHAPE GENERATION (noise-driven)
// ------------------------------------------------------------
function generateOrganicShape(center, radius, complexity) {
  let verts = [];
  for (let i = 0; i < complexity; i++) {
    let angle = (i / complexity) * TWO_PI;
    let rad = radius * (0.7 + noise(center.x*0.008 + angle, center.y*0.008 + angle, seed*0.0002) * 0.6);
    let vx = center.x + cos(angle) * rad;
    let vy = center.y + sin(angle) * rad;
    verts.push(createVector(vx, vy));
  }
  return verts;
}

// ------------------------------------------------------------
// GRADIENT BUILDERS (multi-stop, dynamic)
// ------------------------------------------------------------
function buildSubdivisionGradient(x, y, size, depth) {
  let hueBase = noise(x*0.0015, y*0.0015, depth*0.2) * 360;
  let satBase = 65 + noise(x*0.002, y*0.002, depth*0.5) * 30;
  let briBase = 55 + noise(x*0.003, y*0.003, depth*0.8) * 35;
  
  let stops = [];
  let numStops = 4;
  for (let i = 0; i < numStops; i++) {
    let t = i / (numStops - 1);
    let hueShift = sin(t * TWO_PI * 2 + depth) * 25;
    let satShift = cos(t * TWO_PI * 1.3) * 15;
    let briShift = sin(t * TWO_PI * 1.8) * 12;
    stops.push({
      offset: t,
      color: color((hueBase + hueShift) % 360, constrain(satBase + satShift, 50, 95), constrain(briBase + briShift, 55, 92))
    });
  }
  let gradType = (depth % 2 === 0) ? 'radial' : 'linear';
  if (gradType === 'radial') {
    return new RadialGradient(x, y, size * 0.9, stops);
  } else {
    let angle = random(TWO_PI);
    let vec = p5.Vector.fromAngle(angle);
    let p1 = createVector(x - vec.x * size*0.7, y - vec.y * size*0.7);
    let p2 = createVector(x + vec.x * size*0.7, y + vec.y * size*0.7);
    return new LinearGradient(p1, p2, stops);
  }
}

function buildIslandGradient(center, radius) {
  let hue = noise(center.x*0.002, center.y*0.002, seed*0.0003) * 360;
  let sat = 70 + noise(center.x*0.003+12, center.y*0.003-7) * 25;
  let bri = 65 + noise(center.x*0.004, center.y*0.004+3) * 30;
  let stops = [
    { offset: 0, color: color((hue+15)%360, sat+10, bri+15) },
    { offset: 0.4, color: color(hue, sat, bri) },
    { offset: 0.8, color: color((hue-25)%360, sat-8, bri-10) },
    { offset: 1, color: color((hue-45)%360, sat-15, bri-20) }
  ];
  return new RadialGradient(center.x, center.y, radius*1.1, stops);
}

// ------------------------------------------------------------
// ACCENT LINES (geometric calligraphy)
// ------------------------------------------------------------
function addAccentLines() {
  let numLines = 180;
  for (let i = 0; i < numLines; i++) {
    let start = createVector(random(width), random(height));
    let angle = noise(start.x*0.004, start.y*0.004, seed*0.0002) * TWO_PI * 2;
    let length = random(20, 150);
    let end = createVector(start.x + cos(angle)*length, start.y + sin(angle)*length);
    let col = color(
      (noise(start.x*0.01, start.y*0.01)*360) % 360,
      80,
      85,
      0.45
    );
    shapes.push({
      type: 'line',
      start: start,
      end: end,
      strokeColor: col,
      weight: random(0.8, 3.5),
      blend: ADD
    });
  }
}

// ------------------------------------------------------------
// RENDERING ENGINE
// ------------------------------------------------------------
function drawAllShapes() {
  for (let s of shapes) {
    push();
    if (s.blend) blendMode(s.blend);
    else blendMode(BLEND);
    noStroke();
    
    if (s.type === 'rect') {
      // fill whole canvas with gradient
      s.gradient.apply(drawingContext, null);
      rect(0, 0, width, height);
    }
    else if (s.type === 'polygon' && s.vertices && s.vertices.length >= 3) {
      s.gradient.apply(drawingContext, s.vertices);
      beginShape();
      for (let v of s.vertices) vertex(v.x, v.y);
      endShape(CLOSE);
    }
    else if (s.type === 'line') {
      stroke(s.strokeColor);
      strokeWeight(s.weight);
      line(s.start.x, s.start.y, s.end.x, s.end.y);
    }
    pop();
  }
}

// Gradient helper classes
class LinearGradient {
  constructor(p1, p2, stops) {
    this.p1 = p1; this.p2 = p2; this.stops = stops;
  }
  apply(ctx, _) {
    let grad = ctx.createLinearGradient(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
    for (let s of this.stops) grad.addColorStop(s.offset, s.color.toString());
    ctx.fillStyle = grad;
  }
}
class RadialGradient {
  constructor(cx, cy, r, stops) {
    this.cx = cx; this.cy = cy; this.r = r; this.stops = stops;
  }
  apply(ctx, _) {
    let grad = ctx.createRadialGradient(this.cx, this.cy, 5, this.cx, this.cy, this.r);
    for (let s of this.stops) grad.addColorStop(s.offset, s.color.toString());
    ctx.fillStyle = grad;
  }
}

// Post-processing
function applyGrain(intensity) {
  loadPixels();
  for (let i = 0; i < pixels.length; i += 4) {
    let grain = (noise(i, frameCount) - 0.5) * intensity;
    pixels[i] = constrain(pixels[i] + grain, 0, 255);
    pixels[i+1] = constrain(pixels[i+1] + grain, 0, 255);
    pixels[i+2] = constrain(pixels[i+2] + grain, 0, 255);
  }
  updatePixels();
}

function applyVignette() {
  push();
  blendMode(MULTIPLY);
  noStroke();
  let grad = drawingContext.createRadialGradient(width/2, height/2, width*0.25, width/2, height/2, width*0.85);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.55)');
  drawingContext.fillStyle = grad;
  rect(0, 0, width, height);
  pop();
}

// Regenerate on 'r'
function keyPressed() {
  if (key === 'r' || key === 'R') {
    seed = Math.floor(Math.random() * 1000000);
    randomSeed(seed);
    noiseSeed(seed);
    shapes = [];
    background(0,0,8);
    generateArtwork();
  }
}

function draw() { } // static, no loop