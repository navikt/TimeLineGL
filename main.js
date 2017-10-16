"use strict";

var vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

// all shaders have a main function
void main() {

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

var fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec4 u_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = u_color;
}
`;

var gl;
var canvas;

var program;
var positionAttributeLocation;
var resolutionUniformLocation;
var colorLocation;

var positionBuffer;
var vao;


function main() {
  // Get A WebGL context
  canvas = document.getElementById("c");
  gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }


  window.addEventListener('resize', resizeXXX, false);

  canvas.onmousedown = handleMouseDown;

  canvas.onmousewheel = handleMouseWheel;

  resizeXXX(null);

  // Use our boilerplate utils to compile the shaders and link into a program
  program = webglUtils.createProgramFromSources(gl,
    [vertexShaderSource, fragmentShaderSource]);

  // look up where the vertex data needs to go.
  positionAttributeLocation = gl.getAttribLocation(program, "a_position");

  // look up uniform locations
  resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
  colorLocation = gl.getUniformLocation(program, "u_color");

  // Create a buffer
  positionBuffer = gl.createBuffer();

  // Create a vertex array object (attribute state)
  vao = gl.createVertexArray();

  render();

}

function render() {

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset);

  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  // Clear the canvas
  gl.clearColor(1, 1, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao);

  // Pass in the canvas resolution so we can convert from
  // pixels to clipspace in the shader
  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

  // draw 50 random rectangles in random colors
  for (var ii = 0; ii < 50; ++ii) {
    // Put a rectangle in the position buffer
    setRectangle(
      gl, randomInt(300), randomInt(300), randomInt(600), 3);

    // Set a random color.
    gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);

    // Draw the rectangle.
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
  }

  // Draw content border frame
  var x0 = 0;
  var y0 = 0;
  var x1 = 900;
  var y1 = 400;

  var thickness = 3;

  // Red
  gl.uniform4f(colorLocation, 1.0, 0, 0, 1);

  setRectangle(gl, x0, y0, x1 - x0, thickness);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  setRectangle(gl, x0, y1 - thickness, x1 - x0, thickness);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  setRectangle(gl, x0, y0, thickness, y1 - y0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);

  setRectangle(gl, x1 - thickness, y0, thickness, y1 - y0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);




}


function resizeXXX(event) {
  

  console.log('resizeXXX');

  gl.canvas.width = window.innerWidth;
  gl.canvas.height = window.innerHeight;

  render();

}

function logCanvasSize()
{
  var x = gl.canvas.width;
  var y = gl.canvas.height;

  console.log('gl.canvas size = (' + x + ',' + y + ')');
}


function handleMouseDown(event) {
  
  var x = event.clientX;
  var y = event.clientY;

  logCanvasSize();

  console.log('handleMouseDown at (' + x + ',' + y + ')');

  var xw = window.innerWidth;
  var yw = window.innerHeight;

}

function handleMouseWheel(event) {

  var x = event.clientX;
  var y = event.clientY;

  var d = event.wheelDelta;

  console.log('handleMouseWheel: delta ' + d + ' at (' + x + ',' + y + ')');
}



// Returns a random integer from 0 to range - 1.
function randomInt(range) {
  return Math.floor(Math.random() * range);
}

// Fill the buffer with the values that define a rectangle.
function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2,
  ]), gl.STATIC_DRAW);
}

main();
