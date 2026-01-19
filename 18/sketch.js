let balls = [];
let numBalls = 19; 
let borderWidth = 20; // thickness of border

function setup() {
  createCanvas(600, 600);
  colorMode(HSB, 360, 100, 100);
  noStroke();
  initializeBalls();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initializeBalls();
}

function initializeBalls() {
  balls = [];
  for (let i = 0; i < numBalls; i++) {
    balls.push({
      x: random(width),
      y: random(height),
      vx: random(-2, 2),
      vy: random(-2, 2),
      r: random(80, 150)
    });
  }
}

function draw() {
  background(0, 0, 100); // White background
  loadPixels();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let b of balls) {
        let dx = x - b.x;
        let dy = y - b.y;
        sum += (b.r * b.r) / (dx*dx + dy*dy);
      }

      let sat = constrain(sum * 15, 0, 100);
      let hue = (sum * 50) % 360;
      let col = color(hue, sat, 100);

      let index = (x + y * width) * 4;
      pixels[index] = red(col);
      pixels[index+1] = green(col);
      pixels[index+2] = blue(col);
      pixels[index+3] = 255;
    }
  }

  updatePixels();

  // move balls
  for (let b of balls) {
    b.x += b.vx;
    b.y += b.vy;
    if (b.x < 0 || b.x > width) b.vx *= -1;
    if (b.y < 0 || b.y > height) b.vy *= -1;
  }

  // Draw white border
  noFill();
  stroke(0, 0, 80); // white stroke
  strokeWeight(borderWidth);
  rect(borderWidth / 2, borderWidth / 2, width - borderWidth, height - borderWidth);
}