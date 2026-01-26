// sketch.js - Ethereal Flux: Advanced Generative Abstract Art

let canvasWidth = 800;
let canvasHeight = 800;
let timeFactor = 0.0;
let mouseAura = 0.5;
let prevMouseX = 0, prevMouseY = 0;
let warpIntensity = 2.8;
let trailsInitialized = false;
let trailPoints = [];
const NUM_TRAILS = 55;

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  pixelDensity(1);
  frameRate(36);
  noiseDetail(8, 0.65);
  randomSeed(1984);
  noiseSeed(982357);
  prevMouseX = width / 2;
  prevMouseY = height / 2;
  noStroke();
  colorMode(HSB, 360, 100, 100, 1);
  background(0);
}

function computeAdvancedColor(x, y, t, mxNorm, myNorm) {
  let nx = x / width;
  let ny = y / height;

  // Domain warping layers (3 octaves)
  let warpX1 = noise(x * 0.0032, y * 0.0032, t * 0.27) * 2.2;
  let warpY1 = noise(x * 0.0032 + 123.7, y * 0.0032 - 89.3, t * 0.31) * 2.2;
  let warpX2 = noise(x * 0.0087 + warpX1, y * 0.0087 + warpY1, t * 0.54 + 2.0) * 1.6;
  let warpY2 = noise(x * 0.0091 - 41.2, y * 0.0091 + warpX1, t * 0.48 + 1.2) * 1.6;
  let warpX3 = noise(x * 0.018 + warpX2, y * 0.018 + warpY2, t * 0.82 + 3.7) * 0.9;
  let warpY3 = noise(x * 0.019 + 77.0, y * 0.019 + warpX2, t * 0.76 + 5.2) * 0.9;

  let warpFieldX = (warpX1 * 1.4 + warpX2 * 1.0 + warpX3 * 0.7);
  let warpFieldY = (warpY1 * 1.4 + warpY2 * 1.0 + warpY3 * 0.7);
  let mouseWarpFactor = 0.8 + mxNorm * 1.7;
  let finalWarpX = warpFieldX * warpIntensity * mouseWarpFactor * 0.9;
  let finalWarpY = warpFieldY * warpIntensity * mouseWarpFactor * 0.9;

  let warpNX = nx + finalWarpX * 0.12;
  let warpNY = ny + finalWarpY * 0.12;
  let warpNX2 = nx + warpFieldX * 0.22 + noise(x * 0.024, y * 0.024, t * 0.33) * 0.15;
  let warpNY2 = ny + warpFieldY * 0.22 + noise(x * 0.027 + 45.0, y * 0.027 + 12.0, t * 0.35) * 0.15;

  let angleWarped = atan2(warpNY - 0.5, warpNX - 0.5);
  let radialWarped = sqrt(sq(warpNX - 0.5) + sq(warpNY - 0.5)) * 2.2;

  let colorNoise1 = noise(x * 0.0057 + finalWarpX, y * 0.0057 + finalWarpY, t * 0.21);
  let colorNoise2 = noise(x * 0.0123 + finalWarpY * 0.5, y * 0.0123 - finalWarpX * 0.3, t * 0.43 + 2.0);
  let colorNoise3 = noise(x * 0.0254 + warpFieldX, y * 0.0254 + warpFieldY, t * 0.67 + 1.8);
  let colorNoise4 = noise(x * 0.048 + warpNX2 * 2.0, y * 0.048 + warpNY2 * 2.0, t * 0.92);

  let angleHarmonic = sin(angleWarped * 5.0 + t * 1.2) * 18.0 
                    + cos(angleWarped * 9.0 - t * 0.9) * 12.0
                    + sin(angleWarped * 23.0 + t * 2.4) * 6.0;
  let radialMod = sin(radialWarped * 12.0 - t * 1.5) * 20.0 + cos(radialWarped * 27.0 + t) * 12.0;
  let noiseHueShift = (colorNoise1 * 65.0 + colorNoise2 * 45.0 + colorNoise3 * 30.0 + colorNoise4 * 20.0);
  let mouseHueShift = (mxNorm - 0.5) * 55.0 + (myNorm - 0.5) * 30.0;
  let timeHue = t * 22.0;

  let hue = (angleHarmonic + radialMod + noiseHueShift + mouseHueShift + timeHue + 180.0) % 360.0;
  let satBase = 55.0 + colorNoise2 * 35.0 + sin(radialWarped * 9.0 - t * 1.8) * 12.0;
  let saturation = constrain(satBase + (myNorm * 28.0), 65.0, 98.0);
  let brightBase = 68.0 + colorNoise3 * 22.0 + sin(angleWarped * 14.0 + t * 3.2) * 14.0;
  let brightness = constrain(brightBase + (mxNorm * 12.0) + (colorNoise4 * 18.0), 70.0, 98.0);
  let microContrast = sin((warpFieldX * 22.0 + warpFieldY * 22.0) * 3.14) * 0.08;
  brightness = constrain(brightness + microContrast * 8.0, 68.0, 98.0);

  return [hue, saturation, brightness];
}

function draw() {
  let t = millis() / 1000.0;
  let mouseNormX = constrain(mouseX / width, 0.0, 1.0);
  let mouseNormY = constrain(mouseY / height, 0.0, 1.0);
  let dx = mouseX - prevMouseX;
  let dy = mouseY - prevMouseY;
  let speed = sqrt(dx*dx + dy*dy) / 20.0;
  let dynamicWarpBonus = constrain(speed, 0.0, 1.5);
  warpIntensity = 2.2 + mouseNormX * 2.4 + dynamicWarpBonus * 0.9;
  prevMouseX = mouseX;
  prevMouseY = mouseY;

  loadPixels();
  let idx = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let [h, s, b] = computeAdvancedColor(x, y, t, mouseNormX, mouseNormY);
      let rgbColor = color(h, s, b);
      pixels[idx] = red(rgbColor);
      pixels[idx+1] = green(rgbColor);
      pixels[idx+2] = blue(rgbColor);
      pixels[idx+3] = 255;
      idx += 4;
    }
  }
  updatePixels();

  // Interactive glow halo (mouse)
  push();
  blendMode(ADD);
  noStroke();
  let glowSize = 180 + sin(t * 2.3) * 30;
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    for (let i = 0; i < 2; i++) {
      let gradientGlow = drawingContext.createRadialGradient(mouseX, mouseY, 5, mouseX, mouseY, glowSize * (i+0.6));
      gradientGlow.addColorStop(0, `hsla(${(t * 70 + mouseNormX * 180) % 360}, 80%, 70%, 0.22)`);
      gradientGlow.addColorStop(0.5, `hsla(${(t * 90 + 40) % 360}, 75%, 60%, 0.08)`);
      gradientGlow.addColorStop(1, `hsla(0, 0%, 0%, 0)`);
      drawingContext.fillStyle = gradientGlow;
      drawingContext.fillRect(0, 0, width, height);
    }
  }
  pop();

  drawKineticTrails(t, mouseNormX, mouseNormY);
}

// Kinetic particle trails (flow field resonance)
function initTrails() {
  for (let i = 0; i < NUM_TRAILS; i++) {
    trailPoints.push({
      x: random(width),
      y: random(height),
      vx: random(-0.8, 0.8),
      vy: random(-0.8, 0.8),
      history: [],
      hueOffset: random(360),
      life: random(0.4, 1.0)
    });
  }
}

function drawKineticTrails(t, mxNorm, myNorm) {
  if (!trailsInitialized) {
    initTrails();
    trailsInitialized = true;
  }
  push();
  blendMode(ADD);
  noFill();
  strokeWeight(1.2);
  for (let i = 0; i < NUM_TRAILS; i++) {
    let p = trailPoints[i];
    let angleField = noise(p.x * 0.006, p.y * 0.006, t * 0.23) * TWO_PI * 2.5;
    let angleField2 = noise(p.x * 0.014 + 12.0, p.y * 0.014 + 7.0, t * 0.37 + 1.2) * TWO_PI * 1.8;
    let angleField3 = noise(p.x * 0.033 + 5.0, p.y * 0.033 - 8.0, t * 0.51) * TWO_PI;
    let finalAngle = angleField + angleField2 * 0.6 + angleField3 * 0.4;

    let dxToMouse = mouseX - p.x;
    let dyToMouse = mouseY - p.y;
    let distToMouse = sqrt(dxToMouse*dxToMouse + dyToMouse*dyToMouse);
    if (distToMouse < 150 && distToMouse > 5) {
      let attractAngle = atan2(dyToMouse, dxToMouse);
      finalAngle = lerp(finalAngle, attractAngle, 0.12);
    }
    let speed = 1.6 + noise(p.x * 0.02, p.y * 0.02, t * 0.19) * 1.4;
    p.vx = cos(finalAngle) * speed;
    p.vy = sin(finalAngle) * speed;
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -20) p.x = width + 20;
    if (p.x > width + 20) p.x = -20;
    if (p.y < -20) p.y = height + 20;
    if (p.y > height + 20) p.y = -20;

    p.history.push({x: p.x, y: p.y});
    if (p.history.length > 28) p.history.shift();

    if (p.history.length > 2) {
      for (let j = 0; j < p.history.length - 1; j++) {
        let seg = p.history[j];
        let segNext = p.history[j+1];
        let tNorm = j / p.history.length;
        let hueTrail = (p.hueOffset + t * 35.0 + seg.x * 0.08 + seg.y * 0.05) % 360;
        let satTrail = 70 + sin(seg.x * 0.03 + t) * 20;
        let brightTrail = 85 + cos(seg.y * 0.02 + t * 2.0) * 12;
        stroke(hueTrail, satTrail, brightTrail, 0.65 - tNorm * 0.4);
        line(seg.x, seg.y, segNext.x, segNext.y);
      }
    }
    push();
    blendMode(ADD);
    fill((p.hueOffset + t * 40) % 360, 85, 92, 0.55);
    noStroke();
    circle(p.x, p.y, 2.8);
    pop();
  }
  pop();
}

function windowResized() {
  let maxSize = min(windowWidth * 0.9, windowHeight * 0.9, 1080);
  resizeCanvas(maxSize, maxSize);
}