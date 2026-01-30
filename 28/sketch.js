function setup() {

  createCanvas(windowWidth  ,windowHeight);
  background(0);
  noLoop(); 

  noStroke();
}

function draw() {
  let dotSpacing = 4; 

  let noiseScale = 0.005; 

  let flowScale = 0.02;  

  for (let x = 0; x < width; x += dotSpacing) {
    for (let y = 0; y < height; y += dotSpacing) {

      let n_color = noise(x * noiseScale, y * noiseScale);
      let n_flow = noise(x * flowScale, y * flowScale, 100);
      let n_detail = noise(x * 0.05, y * 0.05, 200);

      let finalColor;
      let dotSize = map(n_detail, 0, 1, 2, 5);

      let distToEdge = min(min(x, width - x), min(y, height - y));

      if (distToEdge < 40 + noise(x * 0.1, y * 0.1) * 30) {

        if (x < 100 && y < 200) {
          finalColor = color(0, 50, 200); 

        } else if (y > height - 50 || x > width - 50) {
          finalColor = color(200, 20, 20); 

        } else {
          finalColor = color(100, 0, 150); 

        }
      } 

      else {

        if (n_flow > 0.6) {
          let brightness = map(n_flow, 0.6, 1, 150, 255);
          finalColor = color(brightness);
          dotSize *= 1.2; 

        } 

        else if (n_color > 0.4 && n_color < 0.6) {
          let g = map(n_color, 0.4, 0.6, 100, 255);
          finalColor = color(0, g, 0);
        } 

        else {
          let gray = map(n_color, 0, 1, 10, 80);
          finalColor = color(gray);
        }
      }

      if (n_flow > 0.58 && n_flow < 0.62 && random() > 0.5) {
        finalColor = color(0, 255, 0);
      }

      fill(finalColor);
      ellipse(x, y, dotSize, dotSize);
    }
  }
}

function keyPressed() {
  if (key === 's') {
    saveCanvas('generative_art', 'png');
  }
}