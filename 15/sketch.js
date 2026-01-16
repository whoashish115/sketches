let numBlades = 45; // High count to ensure the canvas feels "filled"

function setup() {
  createCanvas(800, 800);
  colorMode(HSB, 360, 100, 100, 255);
  noLoop();
}

function draw() {
  drawGradientBackground();
  
  for (let i = 0; i < numBlades; i++) {
    drawRevolvingBlade(i);
  }
  
  drawFrame();
}

function drawGradientBackground() {
  for (let y = 0; y < height; y++) {
    let inter = map(y, 0, height, 0, 1);
    let c = lerpColor(color(210, 40, 15), color(25, 50, 12), inter);
    stroke(c);
    line(0, y, width, y);
  }
}

function drawRevolvingBlade(index) {
  let margin = 100;
  let x = random(margin, width - margin);
  let y = random(margin, height - margin);
  
  let steps = 600; 
  let maxWidth = random(40, 110);
  let twistFactor = random(3, 8); 
  let speed = random(0.01, 0.03);

  let palette = [
    {h: 205, s: 80, b: 95}, // Blue
    {h: 30, s: 95, b: 98},  // Orange
    {h: 22, s: 70, b: 45},  // Deep Brown
    {h: 18, s: 65, b: 75}   // Copper
  ];
  let choice = random(palette);
  let noiseOff = random(1000);

  for (let i = 0; i <= steps; i++) {
    let t = i / steps;
    let angle = noise(noiseOff + i * speed) * TWO_PI * twistFactor;
    x += cos(angle) * 2;
    y += sin(angle) * 2;
    let drawAngle = angle + HALF_PI;
    let w = (t < 0.2 ? map(t, 0, 0.2, 0, 1) : map(t, 0.2, 1, 1, 0)) * maxWidth;

    push();
    translate(x, y);
    rotate(drawAngle);
    for (let j = -w/2; j < w/2; j++) {
      let inter = map(j, -w/2, w/2, 0, 1);
      let light = sin(inter * PI + (t * twistFactor)); 
      
      let h = (choice.h + t * 20) % 360;
      let s = choice.s - (light * 20);
      let b = map(light, -1, 1, choice.b * 0.1, choice.b);
      if (abs(j) > w/2 - 1) stroke(0, 0, 0, 150);
      else stroke(h, s, b, 240); 
      
      line(j, 0, j + 1, 0);
    }
    pop();
  }
}

function drawFrame() {
  noFill();
  stroke(20, 60, 8); 
  strokeWeight(70);
  rect(0, 0, width, height);
  
  stroke(30, 90, 100, 180);
  strokeWeight(2);
  rect(35, 35, width - 70, height - 70);
}

function mousePressed() {
  noiseSeed(millis());
  redraw();
}