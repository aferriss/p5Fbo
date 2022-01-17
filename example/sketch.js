let fbo;
let sh;
let randSh;

const vertexShader = `
attribute vec3 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uModelViewProjectionMatrix;

varying vec2 vTexCoord;

void main() {
  vTexCoord = aTexCoord;

  vec4 positionVec4 = vec4(aPosition, 1.0);

  gl_Position = uModelViewProjectionMatrix * positionVec4;
}`
  ;

const fragmentShader = `
precision mediump float;

varying vec2 vTexCoord;

uniform sampler2D uTex0;

void main() {
  vec2 uv = vTexCoord;
  uv.y = 1.0 - uv.y;

  vec4 tex = texture2D(uTex0, uv);

  gl_FragColor = tex;//vec4(uv, 0.0, 1.0);
//   gl_FragColor.rgb = 1.0 - gl_FragColor.rgb;
}
`;

const randFrag = `
precision highp float;
varying vec2 vTexCoord;

float rand(vec2 co){
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main(){
	float r = rand(floor(vTexCoord * 5.0) / 5.0);
	gl_FragColor = vec4(r);
	gl_FragColor.a = 1.0;
}
`;


function setup() {

  // Framebuffers will only work in webGL mode.
  const canvas = createCanvas(512, 512, WEBGL);
  pixelDensity(1);

  sh = createShader(vertexShader, fragmentShader);
  randSh = createShader(vertexShader, randFrag);

  // Create our fbo
  // It's required to pass in the current renderer, and width and height.
  fbo = new p5Fbo({
    renderer: canvas,
    width: 256,
    height: 256
  });
}

function draw() {

  // Here's out fbo drawing code, separated in its own block for readability
  {
    // Start Drawing into our fbo
    fbo.begin();

    // Clear it out before we draw anything
    clear(0, 0, 0, 1);

    // Render a rotating box with random b&w colors on it
    noStroke();
    background(0, 255, 255);
    shader(randSh);
    push();
    rotateX(frameCount * 0.01);
    rotateY(frameCount * 0.02);
    box(150);
    pop();

    // Finished working in the fbo!
    fbo.end();
  }


  // Start rendering normally in p5
  // We will draw the fbo as a texture onto another box
  {
    background(255, 0, 255);

    // p5Fbo textures can be used with custom shaders
    // shader(sh);
    // sh.setUniform('uTex0', fbo.getTexture());

    texture(fbo.getTexture());
    push();
    translate(-100, -100);
    rotateX(frameCount * -0.003);
    rotateY(frameCount * -0.002);
    box(150);
    pop();

    // Or they can be drawn as images
    image(fbo.getTexture(), 0, 0);
  }

}

function keyPressed() { }
