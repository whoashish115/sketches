/**
 * Advanced Penrose Tiling (P3 Rhombus)
 * Uses recursive subdivision of Golden Triangles 
 * to create aperiodic 5-fold symmetry.
 */

let triangles = [];
const PHI = (1 + Math.sqrt(5)) / 2; // The Golden Ratio
let palette = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  generateNewPalette();
  initialState();
  
  // Perform 7-8 subdivisions for a high-detail "quasicrystal" look
  for (let i = 0; i < 7; i++) {
    subdivideTriangles();
  }
  noLoop();
}

function draw() {
  background(palette[0]);
  strokeJoin(ROUND);
  
  for (let t of triangles) {
    t.display();
  }
}

function initialState() {
  triangles = [];
  let r = max(width, height) * 1.5;
  let cx = width / 2;
  let cy = height / 2;

  // Create the initial "Sun" pattern (10 thin triangles around center)
  for (let i = 0; i < 10; i++) {
    let a1 = (i - 1) * PI / 5;
    let a2 = i * PI / 5;
    let v1 = createVector(cx, cy);
    let v2 = createVector(cx + r * cos(a1), cy + r * sin(a1));
    let v3 = createVector(cx + r * cos(a2), cy + r * sin(a2));
    
    // Alternate orientation to form the base rhombs
    if (i % 2 === 0) {
      triangles.push(new Triangle(v1, v2, v3, 0)); // Type 0: Thin
    } else {
      triangles.push(new Triangle(v1, v3, v2, 0)); 
    }
  }
}

function subdivideTriangles() {
  let nextGen = [];
  for (let t of triangles) {
    let newTris = t.subdivide();
    for (let nt of newTris) {
      nextGen.push(nt);
    }
  }
  triangles = nextGen;
}

class Triangle {
  constructor(v1, v2, v3, type) {
    this.v1 = v1; // Apex
    this.v2 = v2;
    this.v3 = v3;
    this.type = type; // 0 for Thin (Robinson), 1 for Thick
  }

  subdivide() {
    let result = [];
    if (this.type === 0) {
      // Thin Triangle subdivision
      let p = p5.Vector.lerp(this.v1, this.v2, 1 / PHI);
      result.push(new Triangle(this.v3, p, this.v2, 1));
      result.push(new Triangle(p, this.v3, this.v1, 0));
    } else {
      // Thick Triangle subdivision
      let q = p5.Vector.lerp(this.v2, this.v1, 1 / PHI);
      let r = p5.Vector.lerp(this.v2, this.v3, 1 / PHI);
      result.push(new Triangle(r, q, this.v2, 0));
      result.push(new Triangle(q, r, this.v3, 1));
      result.push(new Triangle(q, this.v3, this.v1, 1));
    }
    return result;
  }

display() {
  noStroke();
  // Remove the random lerpColor to keep colors perfectly flat/consistent
  if (this.type === 0) fill(palette[1]); 
  else fill(palette[2]);
  
  beginShape();
  vertex(this.v1.x, this.v1.y);
  vertex(this.v2.x, this.v2.y);
  vertex(this.v3.x, this.v3.y);
  endShape(CLOSE);
}
}

function generateNewPalette() {
  // Generates a sophisticated "Cyber" or "Organic" palette
  palette = [
    color(10, 15, 30),   // Background (Deep Navy)
    color(0, 200, 200),  // Thin Rhomb (Cyan)
    color(0, 100, 150),  // Thick Rhomb (Blue)
    color(255, 255, 255, 50) // Edge lines (Faint white)
  ];
}

function mousePressed() {
  // Randomize colors and regenerate
  palette[1] = color(random(100, 255), random(100, 255), random(100, 255));
  palette[2] = color(red(palette[1]) * 0.5, green(palette[1]) * 0.5, blue(palette[1]) * 0.5);
  initialState();
  for (let i = 0; i < 7; i++) subdivideTriangles();
  redraw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initialState();
  for (let i = 0; i < 7; i++) subdivideTriangles();
  redraw();
}