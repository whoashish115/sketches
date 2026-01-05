let palette = [
  [0, 40, 80],
  [0, 120, 200],
  [100, 200, 255],
  [180, 240, 255],
  [220, 255, 255]
];
// palette = [
//   [0, 30, 60],
//   [0, 80, 140],
//   [0, 150, 200],
//   [80, 200, 255],
//   [150, 240, 255]
// ];
let points = [];
let triangles = [];

function setup() {
  createCanvas(window.innerWidth, window.innerHeight);
  noStroke();

  generate();
  noLoop();
}

function draw() {
  background(10, 0, 0);

  let light = createVector(-0.5, -0.5, 1).normalize();

  for (let t of triangles) {
    drawTriangle(t, light);
  }
}

function generate() {
  points = [];

  let margin = 200; // EXTEND OUTSIDE SCREEN

  // random points (extended area)
  for (let i = 0; i < 250; i++) {
    points.push(
      createVector(
        random(-margin, width + margin),
        random(-margin, height + margin)
      )
    );
  }

  // strong boundary cage (prevents holes)
  for (let x = -margin; x <= width + margin; x += 100) {
    points.push(createVector(x, -margin));
    points.push(createVector(x, height + margin));
  }

  for (let y = -margin; y <= height + margin; y += 100) {
    points.push(createVector(-margin, y));
    points.push(createVector(width + margin, y));
  }

  triangles = delaunay(points);
}

function delaunay(pts) {
  let tris = [];

  // super triangle (huge)
  let st = [
    createVector(-10000, -10000),
    createVector(10000, -10000),
    createVector(0, 10000)
  ];

  tris.push([st[0], st[1], st[2]]);

  for (let p of pts) {
    let bad = [];

    for (let t of tris) {
      if (inCircle(p, t)) {
        bad.push(t);
      }
    }

    let edges = [];

    for (let t of bad) {
      let e = [
        [t[0], t[1]],
        [t[1], t[2]],
        [t[2], t[0]]
      ];

      for (let ed of e) {
        let shared = false;

        for (let ot of bad) {
          if (t === ot) continue;

          let oe = [
            [ot[0], ot[1]],
            [ot[1], ot[2]],
            [ot[2], ot[0]]
          ];

          for (let o of oe) {
            if (sameEdge(ed, o)) shared = true;
          }
        }

        if (!shared) edges.push(ed);
      }
    }

    tris = tris.filter(t => !bad.includes(t));

    for (let e of edges) {
      tris.push([e[0], e[1], p]);
    }
  }
  return tris.filter(t =>
    !t.includes(st[0]) &&
    !t.includes(st[1]) &&
    !t.includes(st[2])
  );
}

function sameEdge(e1, e2) {
  return (
    (e1[0] === e2[0] && e1[1] === e2[1]) ||
    (e1[0] === e2[1] && e1[1] === e2[0])
  );
}

function inCircle(p, t) {
  let ax = t[0].x - p.x;
  let ay = t[0].y - p.y;
  let bx = t[1].x - p.x;
  let by = t[1].y - p.y;
  let cx = t[2].x - p.x;
  let cy = t[2].y - p.y;

  let det =
    (ax * ax + ay * ay) * (bx * cy - cx * by) -
    (bx * bx + by * by) * (ax * cy - cx * ay) +
    (cx * cx + cy * cy) * (ax * by - bx * ay);

  return det > 0;
}

function drawTriangle(t, light) {
  let [a, b, c] = t;

  let v1 = p5.Vector.sub(b, a);
  let v2 = p5.Vector.sub(c, a);

  let normal = createVector(
    v1.y - v2.y,
    v2.x - v1.x,
    150
  ).normalize();

  let intensity = constrain(p5.Vector.dot(normal, light), 0, 1);
  intensity = pow(intensity,3); 

  let base = random(palette); // pick random color

let intensityMapped = map(intensity, 0, 1, 0.3, 1); 

let r = base[0] * intensityMapped;
let g = base[1] * intensityMapped;
let bi = base[2] * intensityMapped;

fill(r, g, bi);
  beginShape();
  vertex(a.x, a.y);
  vertex(b.x, b.y);
  vertex(c.x, c.y);
  endShape(CLOSE);
}

function windowResized() {
  resizeCanvas(window.innerWidth, window.innerHeight);
  generate();
}