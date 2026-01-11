let palette = [
  [248, 208, 122], // sand
  [242, 132, 55],  // orange
  [214, 83, 38],   // burnt orange
  [77, 64, 74],    // dark plum
  [0, 0, 0],       // black
  [0, 0, 0],       // black
  [0, 0, 0],       // black
  [96, 185, 178],  // teal
  [235, 223, 182]  // pale beige
];

let minSize = 60;
let maxSize = 120;

let noiseScale = 0.005;
let cellSize = 28;
let threshold = 0.42;

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  rectMode(CENTER);
  noLoop();

  noiseSeed(random(7));
  randomSeed(7);

  background(232, 217, 184);

  drawSoftNoiseBase();
  drawPerlinShapes();
  drawFlowAccents();
}

function pick(arr) {
  return arr[floor(random(arr.length))];
}

function rgba(c, aMin = 120, aMax = 255) {
  return color(c[0], c[1], c[2], random(aMin, aMax));
}

function drawSoftNoiseBase() {
  noStroke();

  for (let y = 0; y < height; y += 18) {
    for (let x = 0; x < width; x += 18) {
      let n = noise(x * 0.01, y * 0.01);
      if (n < 0.42) continue;

      let c = pick(palette);
      let s = map(n, 0.42, 1, 2, 10);
      fill(c[0], c[1], c[2], map(n, 0.42, 1, 12, 45));

      push();
      translate(
        x + map(noise(x * 0.02 + 50, y * 0.02 + 50), 0, 1, -6, 6),
        y + map(noise(x * 0.02 + 80, y * 0.02 + 80), 0, 1, -6, 6)
      );
      rotate(map(noise(x * 0.02 + 100, y * 0.02 + 100), 0, 1, 0, 360));

      let t = floor(map(noise(x * 0.03 + 10, y * 0.03 + 10), 0, 1, 0, 3));
      if (t === 0) triangle(-s, s, 0, -s, s, s);
      else if (t === 1) rect(0, 0, s, s * random(0.5, 1.4));
      else beginShape(), vertex(-s, -s), vertex(s, -s), vertex(s * 0.7, s), endShape(CLOSE);
      pop();
    }
  }
}

function drawPerlinShapes() {
  for (let y = 0; y <= height; y += cellSize) {
    for (let x = 0; x <= width; x += cellSize) {
      let n1 = noise(x * noiseScale, y * noiseScale);
      let n2 = noise((x + 300) * noiseScale * 1.7, (y + 300) * noiseScale * 1.7);

      // only draw where the noise field is "strong enough"
      if (n1 < threshold) continue;

      let cx = x + map(noise((x + 100) * noiseScale * 2.2, (y + 100) * noiseScale * 2.2), 0, 1, -cellSize * 0.45, cellSize * 0.45);
      let cy = y + map(noise((x + 200) * noiseScale * 2.2, (y + 200) * noiseScale * 2.2), 0, 1, -cellSize * 0.45, cellSize * 0.45);

      let s = map(n1, threshold, 1, minSize, maxSize);
      s *= map(n2, 0, 1, 0.75, 1.35);
      s = constrain(s, minSize * 0.7, maxSize);

      let c1 = pick(palette);
      let c2 = pick(palette);
      let mode = floor(map(n2, 0, 1, 0, 4));

      push();
      translate(cx, cy);

      // noise-driven rotation
      rotate(map(noise(x * 0.02 + 500, y * 0.02 + 500), 0, 1, 0, 360));

      if (mode === 0) {
        fill(rgba(c1, 110, 220));
        stroke(rgba(c2, 140, 255));
        strokeWeight(map(n1, threshold, 1, 1, 6));
        triangle(-s * 0.8, s * 0.8, 0, -s, s * 0.8, s * 0.8);
      } 
      else if (mode === 1) {
        fill(rgba(c1, 100, 210));
        stroke(rgba(c2, 140, 255));
        strokeWeight(map(n1, threshold, 1, 1, 7));
        rect(0, 0, s, s * map(n2, 0, 1, 0.45, 1.6));
      } 
      else if (mode === 2) {
        noFill();
        stroke(rgba(c1, 150, 255));
        strokeWeight(map(n1, threshold, 1, 1, 5));
        line(-s, 0, s, map(n2, 0, 1, -s * 0.6, s * 0.6));
      } 
      else {
        noFill();
        stroke(rgba(c2, 150, 255));
        strokeWeight(map(n1, threshold, 1, 1, 4));
        bezier(
          -s, s * 0.2,
          -s * 0.5, -s,
          s * 0.5, s,
          s, -s * 0.2
        );
      }

      pop();
    }
  }
}

function drawFlowAccents() {
  noFill();

  for (let i = 0; i < 45; i++) {
    let y0 = random(height);
    let amp = random(25, 120);
    let freq = random(0.002, 0.008);
    let strokeC = pick(palette);

    stroke(strokeC[0], strokeC[1], strokeC[2], random(40, 120));
    strokeWeight(random(1, 3));

    beginShape();
    for (let x = 0; x <= width; x += 22) {
      let y = y0 + map(noise(x * freq, y0 * freq + 999), 0, 1, -amp, amp);
      vertex(x, y);
    }
    endShape();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(232, 217, 184);
  drawSoftNoiseBase();
  drawPerlinShapes();
  drawFlowAccents();
}