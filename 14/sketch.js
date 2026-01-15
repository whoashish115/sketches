let numBlades = 15;

function setup() {
  createCanvas(800, 800);
  noLoop();
}

function draw() {
  background(180); // Gray background like the reference
  
  // Draw a subtle border
  noFill();
  stroke(120);
  strokeWeight(20);
  rect(0, 0, width, height);

  for (let i = 0; i < numBlades; i++) {
    drawBlade();
  }
}
function drawBlade() {
  let margin = 60; // Increase this to keep shapes further from the edge
  
  // Constrain random points to be within the margin
  let x1 = random(margin, width - margin);
  let y1 = random(margin, height - margin);
  let x2 = random(margin, width - margin);
  let y2 = random(margin, height - margin);
  
  // Control points also need to stay inside (mostly) to prevent loops hitting the edge
  let cx1 = random(margin, width - margin);
  let cy1 = random(margin, height - margin);
  let cx2 = random(margin, width - margin);
  let cy2 = random(margin, height - margin);

  let steps = 200; 
  
  for (let i = 0; i <= steps; i++) {
    let t = i / steps;
    
    let x = bezierPoint(x1, cx1, cx2, x2, t);
    let y = bezierPoint(y1, cy1, cy2, y2, t);
    
    let tx = bezierTangent(x1, cx1, cx2, x2, t);
    let ty = bezierTangent(y1, cy1, cy2, y2, t);
    let angle = atan2(ty, tx) + HALF_PI;
    
    let maxWidth = 80;
    let w = sin(t * PI) * maxWidth; 

    // DRAWING THE BLADE... (rest of your code remains the same)
    push();
    translate(x, y);
    rotate(angle);
    for (let j = -w/2; j < w/2; j++) {
      let inter = map(j, -w/2, w/2, 0, 1);
      let c = lerpColor(color(0), color(255), sin(inter * PI));
      stroke(c);
      line(j, 0, j + 1, 0);
    }
    pop();
  }
}
function mousePressed() {
  redraw();
}