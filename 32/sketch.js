let layerGridA, layerGridB, layerStripe;
let shaderMain, shaderGlitch;
let finalTexture;

function setup() {
  createCanvas(1920,1080, WEBGL);
  noStroke();

  // Layers
  layerGridA  = createGraphics(width, height);
  layerGridB  = createGraphics(width, height);
  layerStripe = createGraphics(width, height);

  initLayer(layerGridA);
  initLayer(layerGridB);
  initLayer(layerStripe);

  // Draw patterns
  drawGrid(layerGridA, 60, 0.5);
  drawGrid(layerGridB, 12, 0.7);
  drawStripes(layerStripe, 80, 0.4);

  // Shaders
  shaderMain   = createShader(vertShader, fragMain);
  shaderGlitch = createShader(vertShader, fragGlitch);

  // First render pass
  shader(shaderMain);
  shaderMain.setUniform("texA", layerGridA);
  shaderMain.setUniform("texB", layerGridB);
  shaderMain.setUniform("texStripe", layerStripe);

  rect(-width/2, -height/2, width, height);

  resetShader();
  finalTexture = get();
}

function draw() {
  background(0);

  shader(shaderGlitch);
  shaderGlitch.setUniform("tex", finalTexture);
  shaderGlitch.setUniform("time", millis() * 0.001);

  rect(-width/2, -height/2, width, height);
}

// ==============================
// Pattern helpers
// ==============================

function initLayer(pg) {
  pg.noStroke();
  pg.rectMode(CENTER);
  pg.background(0);
}

function neonColor() {
  const palette = [
    [0.0, 1.0, 1.0],   // cyan
    [0.6, 0.2, 1.0],   // purple
    [0.2, 0.6, 1.0],   // blue
    [1.0, 0.2, 0.8]    // pink
  ];
  return random(palette);
}

function drawGrid(pg, count, scale) {
  let w = width / count;
  let size = w * scale;

  pg.background(0);

  for (let x = 0; x < count; x++) {
    for (let y = 0; y < count; y++) {
      let c = neonColor();
      pg.fill(c[0]*255, c[1]*255, c[2]*255);
      pg.rect(x*w + w/2, y*w + w/2, size, size);
    }
  }
}

function drawStripes(pg, count, scale) {
  let w = width / count;
  let h = w * scale;

  pg.background(0);

  for (let y = 0; y < count; y++) {
    let c = neonColor();
    pg.fill(c[0]*255, c[1]*255, c[2]*255);
    pg.rect(width/2, y*w + w/2, width*2, h);
  }
}

// ==============================
// Shaders
// ==============================

const vertShader = `
precision mediump float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vUv;

uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;

void main() {
  vUv = aTexCoord;
  gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
}
`;

const fragMain = `
precision mediump float;

varying vec2 vUv;

uniform sampler2D texA;
uniform sampler2D texB;
uniform sampler2D texStripe;

float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
}

vec3 glow(vec3 col) {
  float brightness = length(col);
  return col + col * brightness * 2.5;
}

void main() {
  vec2 uv = vUv;

  vec3 a = texture2D(texA, uv).rgb;
  vec3 b = texture2D(texB, uv).rgb;
  vec3 c = texture2D(texStripe, uv).rgb;

  float selector = rand(floor(uv * 20.0));

  vec3 color;

  if (selector < 0.33) {
    color = a;
  } else if (selector < 0.66) {
    color = b;
  } else {
    color = c;
  }

  color = glow(color);
  color *= 0.8;

  gl_FragColor = vec4(color, 1.0);
}
`;

const fragGlitch = `
precision mediump float;

varying vec2 vUv;

uniform sampler2D tex;
uniform float time;

float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;

  float line = floor(uv.y * 80.0);
  float shift = rand(vec2(line, floor(time * 2.0))) * 0.02;

  vec3 col;
  col.r = texture2D(tex, uv + vec2(shift, 0.0)).r;
  col.g = texture2D(tex, uv).g;
  col.b = texture2D(tex, uv - vec2(shift, 0.0)).b;

  col *= 0.9;

  gl_FragColor = vec4(col, 1.0);
}
`;