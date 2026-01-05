let t = 0;
let scaleFactor = 0.005; // bigger so noise is visible

// 🌊 Deep sea / dark cyan-blue palette
let palette = [
  [2, 8, 20],      // almost black
  [0, 50, 70],     // dark cyan
  [0, 100, 120],   // teal-blue
  [0, 150, 180],   // cyan-blue
  [50, 180, 220],  // lighter highlights
  [100, 210, 240]  // shimmering highlights
];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noStroke();
}

function draw() {
  background(0, 5, 20); // deep ocean background

  loadPixels();

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {

      let nx = x * scaleFactor;
      let ny = y * scaleFactor;

      // domain warping
      let qx = noise(nx + t, ny + t);
      let qy = noise(nx + 5 + t, ny + 5 + t);

      let rx = noise(nx + 4 * qx + t, ny + 4 * qy + t);
      let ry = noise(nx + 4 * qx + 10 + t, ny + 4 * qy + 10 + t);

      let warped = noise(nx + 4 * rx, ny + 4 * ry, t * 0.5);

      // mild contrast shaping
      warped = pow(warped, 1.2);

      // palette interpolation
      let scaled = warped * (palette.length - 1);
      let index = floor(scaled);
      let amt = scaled - index;

      let c1 = palette[index];
      let c2 = palette[(index + 1) % palette.length];

      let r = lerp(c1[0], c2[0], amt);
      let g = lerp(c1[1], c2[1], amt);
      let b = lerp(c1[2], c2[2], amt);

      // subtle glow (don’t overdo for dark palette)
      r = constrain(r * 1.1, 0, 255);
      g = constrain(g * 1.1, 0, 255);
      b = constrain(b * 1.1, 0, 255);

      let i = (x + y * width) * 4;
      pixels[i] = r;
      pixels[i + 1] = g;
      pixels[i + 2] = b;
      pixels[i + 3] = 255;
    }
  }

  updatePixels();

  t += 0.01;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}