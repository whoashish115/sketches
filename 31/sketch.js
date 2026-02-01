
let tiles = [];
let palette = [];        // vibrant colors on black background
globalColorSeed = 0;

const phi = (1 + Math.sqrt(5)) / 2;

class Rhombus {
  constructor(v0, v1, v2, v3, type) {
    this.v0 = v0.copy();
    this.v1 = v1.copy();
    this.v2 = v2.copy();
    this.v3 = v3.copy();
    this.type = type; // 0: thick (72° acute), 1: thin (36° acute)
  }
  getVertices() { return [this.v0, this.v1, this.v2, this.v3]; }
  getCenter() {
    return p5.Vector.add(this.v0, this.v1)
      .add(this.v2).add(this.v3).mult(0.25);
  }
}

function rotateVec(v, ang) {
  let c = cos(ang), s = sin(ang);
  return createVector(v.x*c - v.y*s, v.x*s + v.y*c);
}

function createSunSeed(rot) {
  let tiles = [];
  let center = createVector(0,0);
  let len = 1.0;
  let angleStep = TWO_PI/5;
  for (let i=0; i<5; i++) {
    let a = i*angleStep + rot;
    let e1 = rotateVec(createVector(len,0), a);
    let e2 = rotateVec(createVector(len,0), a+angleStep);
    tiles.push(new Rhombus(center, e1, p5.Vector.add(e1,e2), e2, 0));
  }
  return tiles;
}

function createStarSeed(rot) {
  let tiles = [];
  let center = createVector(0,0);
  let len = 1.0;
  let acute36 = TWO_PI/10; // 36°
  for (let i=0; i<5; i++) {
    let a = i*acute36*2 + rot; // every 72°, but thin rhombus uses 36° edge
    let e1 = rotateVec(createVector(len,0), a);
    let e2 = rotateVec(createVector(len*phi,0), a+acute36); // thin rhombus has longer diagonal
    tiles.push(new Rhombus(center, e1, p5.Vector.add(e1,e2), e2, 1));
  }
  return tiles;
}

function createCartwheelSeed(rot) {
  let tiles = [];
  let center = createVector(0,0);
  let r = 1.0;
  let angles = [0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map(d => radians(d) + rot);
  for (let i=0; i<angles.length; i+=2) {
    let a1 = angles[i];
    let a2 = angles[(i+1)%angles.length];
    let e1 = rotateVec(createVector(r,0), a1);
    let e2 = rotateVec(createVector(r,0), a2);
    tiles.push(new Rhombus(center, e1, p5.Vector.add(e1,e2), e2, 0));
    let e3 = rotateVec(createVector(r*phi,0), a1+radians(18));
    tiles.push(new Rhombus(e1, e2, p5.Vector.add(e2,e3), e3, 1));
  }
  return tiles;
}

function createRandomSeed(rot) {
  let type = floor(random(3));
  let base;
  if (type === 0) base = createSunSeed(rot);
  else if (type === 1) base = createStarSeed(rot);
  else base = createCartwheelSeed(rot);
  if (random() > 0.65) {
    let extra = new Rhombus(createVector(0.5,0.5), createVector(1.2,0), createVector(1.5,0.7), createVector(0.8,1.2), floor(random(2)));
    base.push(extra);
  }
  return base;
}

function inflateThick(r) {
  let v0=r.v0, v1=r.v1, v2=r.v2, v3=r.v3;
  let invPhi = 1/phi;
  let split = p5.Vector.add(v0, p5.Vector.mult(p5.Vector.sub(v2,v0), invPhi));
  let p01 = p5.Vector.add(v0, p5.Vector.mult(p5.Vector.sub(v1,v0), invPhi));
  let p03 = p5.Vector.add(v0, p5.Vector.mult(p5.Vector.sub(v3,v0), invPhi));
  return [new Rhombus(v0, p01, split, p03, 0), new Rhombus(p01, v1, v2, split, 1)];
}

function inflateThin(r) {
  let v0=r.v0, v1=r.v1, v2=r.v2, v3=r.v3;
  let invPhi = 1/phi;
  let split = p5.Vector.add(v0, p5.Vector.mult(p5.Vector.sub(v2,v0), invPhi));
  let p01 = p5.Vector.add(v0, p5.Vector.mult(p5.Vector.sub(v1,v0), invPhi));
  let p03 = p5.Vector.add(v0, p5.Vector.mult(p5.Vector.sub(v3,v0), invPhi));
  return [new Rhombus(v0, p01, split, p03, 0), new Rhombus(p01, v1, v2, split, 1)];
}

function inflateList(list) {
  let out = [];
  for (let t of list) {
    if (t.type === 0) out.push(...inflateThick(t));
    else out.push(...inflateThin(t));
  }
  return out;
}

function generateRawPatch(iter, seedRot, seedTypeMix = true) {
  let patch = seedTypeMix ? createRandomSeed(seedRot) : createSunSeed(seedRot);
  for (let i=0; i<iter; i++) patch = inflateList(patch);
  return patch;
}

function getBBox(patch) {
  let minX=Infinity, minY=Infinity, maxX=-Infinity, maxY=-Infinity;
  for (let t of patch) {
    for (let v of t.getVertices()) {
      minX = min(minX, v.x); minY = min(minY, v.y);
      maxX = max(maxX, v.x); maxY = max(maxY, v.y);
    }
  }
  return {w: maxX-minX, h: maxY-minY};
}

function transformPatch(patch, scale, rot, tx, ty) {
  let out = [];
  for (let t of patch) {
    let verts = t.getVertices().map(v => {
      let s = p5.Vector.mult(v, scale);
      let r = rotateVec(s, rot);
      r.x += tx; r.y += ty;
      return r;
    });
    out.push(new Rhombus(verts[0], verts[1], verts[2], verts[3], t.type));
  }
  return out;
}

function generateVibrantPalette() {
  let pal = [];
  let baseHue = random(360);
  let count = floor(random(7, 14));
  for (let i=0; i<count; i++) {
    let hue = (baseHue + i*37 + random(-15,15)) % 360;
    pal.push(color(`hsl(${hue}, ${random(70,100)}%, ${random(55,85)}%)`));
  }
  pal.push(color(`hsl(${(baseHue+180)%360}, 95%, 65%)`));
  pal.push(color(`hsl(${(baseHue+90)%360}, 90%, 70%)`));
  pal.push(color(`hsl(${(baseHue+270)%360}, 85%, 60%)`));
  for (let i=pal.length-1; i>0; i--) {
    let j = floor(random(i+1));
    [pal[i], pal[j]] = [pal[j], pal[i]];
  }
  return pal;
}

function getTileColor(tile, pal, seed) {
  let c = tile.getCenter();
  let hash = (floor(c.x*17.3) + floor(c.y*41.7)*2 + tile.type*131 + seed) % pal.length;
  return pal[floor(abs(hash))];
}

function drawRhombus(tile, fillCol, strokeCol) {
  let verts = tile.getVertices();
  beginShape();
  for (let v of verts) vertex(v.x, v.y);
  endShape(CLOSE);
  stroke(strokeCol);
  strokeWeight(1.1);
  fill(fillCol);
  beginShape();
  for (let v of verts) vertex(v.x, v.y);
  endShape(CLOSE);
}

function generateChaos() {
  tiles = [];
  globalColorSeed = random(10000);
  palette = generateVibrantPalette();
  
  background(0);
  
  let numClusters = floor(random(55, 140));
  for (let i=0; i<numClusters; i++) {
    let depth = floor(random(3, 6));       // inflation levels 3-5
    let seedRot = random(TWO_PI);
    let useMix = random() > 0.2;           // 80% random seed, 20% pure sun for variety
    let raw = generateRawPatch(depth, seedRot, useMix);
    if (raw.length === 0) continue;
    
    let bbox = getBBox(raw);
    let maxDim = max(bbox.w, bbox.h);
    if (maxDim < 0.01) continue;
    
    let targetSize = random(45, 320);
    let scale = targetSize / maxDim * random(0.7, 1.4);
    let rot = random(TWO_PI);
    let x = random(-90, width+90);
    let y = random(-90, height+90);
    
    let world = transformPatch(raw, scale, rot, x, y);
    tiles.push(...world);
  }
  
  let extraCount = floor(random(20, 50));
  for (let i=0; i<extraCount; i++) {
    let shallow = floor(random(2, 4));
    let tinyRaw = generateRawPatch(shallow, random(TWO_PI), true);
    let b = getBBox(tinyRaw);
    let sc = random(30, 180) / max(b.w, b.h);
    let r = random(TWO_PI);
    let xp = random(-30, width+30);
    let yp = random(-30, height+30);
    tiles.push(...transformPatch(tinyRaw, sc, r, xp, yp));
  }
  
  for (let i=tiles.length-1; i>0; i--) {
    let j = floor(random(i+1));
    [tiles[i], tiles[j]] = [tiles[j], tiles[i]];
  }
  redraw();
}

function drawSparkles() {
  push();
  noStroke();
  let step = max(1, floor(tiles.length / 2000));
  for (let i=0; i<tiles.length; i+=step) {
    let c = tiles[i].getCenter();
    let sz = 1.8 + sin(c.x*0.04 + c.y*0.03) * 1.2;
    let alpha = 70 + cos(c.x*0.05)*25;
    fill(255, 220, 140, alpha);
    ellipse(c.x, c.y, sz, sz);
  }
  pop();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(RGB);
  background(0);
  noLoop();
  generateChaos();
}

function draw() {
  background(0);
  if (!tiles.length) return;
  let strokeCol = color(10, 8, 18, 200);
  for (let t of tiles) {
    let col = getTileColor(t, palette, globalColorSeed);
    drawRhombus(t, col, strokeCol);
  }
  drawSparkles();
}

function mousePressed() { generateChaos(); }
function keyPressed() {
  if (key === 'r' || key === 'R') generateChaos();
  if (key === 's' || key === 'S') saveCanvas('penrose_chaos_black', 'png');
}
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateChaos();
}