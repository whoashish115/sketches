/**
 * Recursive Bitwise Glitch Art
 * Advanced Pixel Manipulation
 */

let colors = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  noLoop();
  colors = [
    color(10, 15, 20),  
    color(0, 255, 150),   
    color(255, 0, 100), 
    color(200, 200, 220)  
  ];
  
  generateArt();
}

function generateArt() {
  loadPixels();
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let pattern = (x ^ y) % (x & y || 1); 
      let noiseVal = (x * 0.05) ^ (y * 0.05);
      let index = 4 * (y * width + x);
      let selectedColor;

      // Logic gates to determine shape and color placement
      if ((x ^ y) % 64 < 32 && (x & y) % 16 > 8) {
        selectedColor = (x + y) % 128 > 64 ? colors[1] : colors[0];
      } else if (pattern > 2) {
        selectedColor = random(1) > 0.95 ? colors[2] : colors[0];
      } else {
        selectedColor = colors[0];
      }
      pixels[index] = red(selectedColor);
      pixels[index + 1] = green(selectedColor);
      pixels[index + 2] = blue(selectedColor);
      pixels[index + 3] = 255;
    }
  }
  
  updatePixels();
  drawMacroStructures();
}

function drawMacroStructures() {
  noStroke();
  let blocks =500;
  
  for (let i = 0; i < blocks; i++) {
    let w = 20;
    let h = 20;
    let x = floor(random(width) / 20) * 20;
    let y = floor(random(height) / 20) * 20;
    
    fill(random(1) > 0.5 ? colors[2] : colors[3]);
    rect(x, y, w, h);
    fill(colors[0]);
    rect(x + 5, y + 5, w - 10, h - 10);
  }
}

function mousePressed() {
  // Regenerate on click
  generateArt();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  generateArt();
}