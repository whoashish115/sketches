let circles = [];

let zones = [];
let zoneColors = [];
let numZones = 12;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noLoop();
  noStroke();
  noiseSeed(floor(random(10000)));

  generateCircles();
}

function generateCircles() {
  circles = [];
  zones = [];
  zoneColors = [];

  // 🎯 ZONES
  for (let i = 0; i < numZones; i++) {
    zones.push({
      x: random(width),
      y: random(height)
    });

    let palettes = [
      [40, 80, 220],
      [220, 40, 40],
      [255, 255, 255],
      [20, 20, 20],
      [240, 180, 40],
      [30, 200, 160]
    ];

    let p = random(palettes);

    zoneColors.push(
      color(
        p[0] + random(-20, 20),
        p[1] + random(-20, 20),
        p[2] + random(-20, 20)
      )
    );
  }

  // 🔥 MANY BIG CIRCLES FIRST (composition anchors)
  let bigCount = 120;

  for (let i = 0; i < bigCount; i++) {
    let tries = 0;
    let placed = false;

    while (!placed && tries < 80) {
      let x = random(width);
      let y = random(height);

      let r = random(150, 400) * pow(random(6), 5); // bias toward large

      let valid = true;

      for (let other of circles) {
        let d = dist(x, y, other.x, other.y);

        // allow overlap but not full destruction
        if (d < (r + other.r) * 0.6) {
          valid = false;
          break;
        }
      }

      if (valid) {
        circles.push({
          x,
          y,
          r,
          layers: floor(map(r, 20, 400, 3, 9)),
          jitter: random(0.85, 1.2)
        });
        placed = true;
      }

      tries++;
    }
  }

  // 🔶 MEDIUM + SMALL
  let attempts = 5000;

  for (let i = 0; i < attempts; i++) {
    let x = random(width);
    let y = random(height);

    let t = random();
    let r;

    if (t < 0.4) {
      r = random(60, 140);
    } else if (t < 0.75) {
      r = random(20, 60);
    } else {
      r = random(3, 20);
    }

    r *= pow(random(), 0.7);

    circles.push({
      x,
      y,
      r,
      layers: floor(map(r, 3, 200, 2, 6)),
      jitter: random(0.8, 1.25)
    });
  }

  // draw big first
  circles.sort((a, b) => b.r - a.r);
}

function draw() {
  background(255);

  for (let c of circles) {
    drawStack(c);
  }
}

// 🧠 polygon zoning (Voronoi-style + distortion)
function getZoneColor(x, y, jitter) {
  let closestDist = Infinity;
  let index = 0;

  for (let i = 0; i < zones.length; i++) {
    let dx = x - zones[i].x;
    let dy = y - zones[i].y;

    let d = sqrt(dx * dx + dy * dy);

    let distortion = noise(x * 0.01, y * 0.01) * 120;

    d = d * jitter + distortion;

    if (d < closestDist) {
      closestDist = d;
      index = i;
    }
  }

  return zoneColors[index];
}

function drawStack(c) {
  let baseCol = getZoneColor(c.x, c.y, c.jitter);

  for (let i = c.layers; i > 0; i--) {
    let t = i / c.layers;
    let r = c.r * t;

    // shadow
    fill(0, 0, 0, 16 * t);
    ellipse(c.x + 5 * t, c.y + 5 * t, r * 1.05);

    // main
    fill(
      red(baseCol) * (0.65 + 0.35 * t),
      green(baseCol) * (0.65 + 0.35 * t),
      blue(baseCol) * (0.65 + 0.35 * t)
    );
    ellipse(c.x, c.y, r);

    // highlight
    fill(255, 255, 255, 30 * (1 - t));
    ellipse(c.x - r * 0.25, c.y - r * 0.25, r * 0.5);
  }
}

