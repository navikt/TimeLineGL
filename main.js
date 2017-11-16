
"use strict";

var vertexShaderSourceTEX = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec3 a_positionTEX;

in vec2 a_texcoordTEX;

out float colorValueTEX;

// a varying to pass the texture coordinates to the fragment shader
out vec2 v_texcoordTEX;


// Resolution of canvas
uniform vec2 u_resolutionTEX;

// Extent of content, range 0:inclusive -> value: exclusive.
uniform vec2 u_contents_sizeTEX;

uniform vec2 pixel_offsetTEX;

uniform float y_scaleTEX;

// all shaders have a main function
void main() {
 
  vec2 offsetpixel = a_positionTEX.xy - pixel_offsetTEX;

  offsetpixel.y *= y_scaleTEX;

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = offsetpixel / u_resolutionTEX;


  zeroToOne = zeroToOne * u_contents_sizeTEX;

  // vec2 zeroToOne = u_contents_size * offsetpixel;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  colorValueTEX = a_positionTEX.z;

  // Pass the texcoord to the fragment shader.
  v_texcoordTEX = a_texcoordTEX;
}
`;


var vertexShaderSourceBASIC = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec3 a_position;


out float colorValue;

// Resolution of canvas
uniform vec2 u_resolution;

// Extent of content, range 0:inclusive -> value: exclusive.
uniform vec2 u_contents_size;

uniform vec2 pixel_offset;

uniform float y_scale;

// all shaders have a main function
void main() {
 
  vec2 offsetpixel = a_position.xy - pixel_offset;

  offsetpixel.y *= y_scale;

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = offsetpixel / u_resolution;


  zeroToOne = zeroToOne * u_contents_size;

  // vec2 zeroToOne = u_contents_size * offsetpixel;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

  colorValue = a_position.z;
}
`;

var fragmentShaderSourceBASIC = `#version 300 es

precision mediump float;


// we need to declare an output for the fragment shader
out vec4 outColor;

in float colorValue;

void main() {
  if (colorValue < 0.3)
  {
   outColor = vec4(colorValue, colorValue * .1,0, 0.7);
  }
  else if (colorValue < 0.6)
  {
    outColor = vec4(0, colorValue, 0, 0.4);
  }
  else
  {
    outColor = vec4(0, 0, colorValue, 0.7);
  }
  
}
`;

var fragmentShaderSourceTEX = `#version 300 es

precision mediump float;

// Passed in from the vertex shader.
in vec2 v_texcoordTEX;

// The texture.
uniform sampler2D u_textureTEX;



// we need to declare an output for the fragment shader
out vec4 outColor;

in float colorValueTEX;

void main() {
  outColor = texture(u_textureTEX, v_texcoordTEX);
}
`;


var gl;
var canvas;

var program;
var positionAttributeLocation;
var resolutionUniformLocation;
var contentsizeUniformLocation;
var offsetLocation;
var y_scaleLocation;

var rectangleBuffer;
var vao;
var lineBuffer;

var programTex;
var rectangleBufferTexTex;
var rectangleBufferPosTex;
var vaoTex;
var positionAttributeLocationTex;
var texAttributeLocationTex;

var resolutionUniformLocationTex;
var contentsizeUniformLocationTex;
var offsetLocationTex;
var y_scaleLocationTex;
var usamplerTex;



var offsetX = 0;
var offsetY = 0;

var offsetY_anim = offsetY;

var W = 300;

var y_scale = 1;
var row_size = 12;
var rectangle_thickness = 7;

var nRectangleCount = 0;

var nMaxChunk = 5;


///////////////////////////////////////////////////////////////////////////////////////
//
//     GetUniformLocation
//

function GetUniformLocation(p, string, isWarn)
{
  var
    location = gl.getUniformLocation(p, string);

  if (isWarn && location == null)
  {
    alert("GetUniformLocation: '" + string + "' not found");
  }

  return location;
}


var xmlhttp;
var loading_state = 0;
var json_raw = [];



///////////////////////////////////////////////////////////////////////////////////////
//
//     getNumberOfRectangles
//

function getNumberOfRectangles()
{
  var
    nRectangles = 0;

  for (var iChunk = 0; iChunk < nMaxChunk; iChunk++) {

    var
      i = json_raw[iChunk];

    for (var iPerson = 0; iPerson < i.length; iPerson++) {

      var q = i[iPerson];


      var events = q.E;
      var nEvents = events.length;

      var aa_intervals = q.AA;
      var nAA = aa_intervals.length;


      nRectangles += nEvents;
      nRectangles += nAA;
    }
  }

  return nRectangles;
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     addLine
//

function addLine(f, i, x0, y0, x1, y1, c) {

  f[i + 0] = x0;
  f[i + 1] = y0;
  f[i + 2] = c;

  f[i + 3] = x1;
  f[i + 4] = y1;
  f[i + 5] = c;
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     getLineCount
//

function getLineCount()
{

  var
    nLines = 0;

  
  // Year lines
  var
    nYearLineCount = 0;

  for (var iYear = 1996; iYear < 2018; iYear++) {
    nYearLineCount++;
  }

  nLines += nYearLineCount;
  
  // Test lines
  nLines += 2;

  return nLines;

}



///////////////////////////////////////////////////////////////////////////////////////
//
//     buildLines
//

function buildLines(f, w)
{

  var
    i = 0;

  // Year lines:

  for (var iYear = 1996; iYear < 2018; iYear++) {


    var time = (iYear - 1970) * 365.242199;

    var x = get_x_from_time(w, time);
   
    addLine(f, i, x, 0, x, 2000, 0.9);
    i += 6;

  }



  // Test lines:

  addLine(f, i, w / 2, 0, w / 2, 2000, 0.9);
  i += 6;

  addLine(f, i, 0, 500, w, 500, 0.3);
  i += 6;

}

///////////////////////////////////////////////////////////////////////////////////////
//
//     buildGLLines
//

function buildGLLines(w)
{
  var nVertexPerLine = 2;

  var nElementsPerVertex = 3;

  var nElementsPerLine = nVertexPerLine * nElementsPerVertex;


  var cpu_data = new Float32Array(getLineCount() * nElementsPerLine);

  buildLines(cpu_data, w);

  gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cpu_data, gl.STATIC_DRAW);

  cpu_data = null;
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     getNumberOfPersons
//

function getNumberOfPersons() {

  var nPersons = 0;

  for (var iChunk = 0; iChunk < nMaxChunk; iChunk++) {

    var
      i = json_raw[iChunk];

    nPersons += i.length;
  }

  return nPersons;
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     buildGLTex
//

function buildGLTex()
{

  
  var f_tex = new Float32Array(1 * 6 * 2);

  var u1 = 0;
  var v1 = 0;

  var u2 = 1;
  var v2 = 1;

  var iOffset = 0;

  f_tex[iOffset + 0] = u1;
  f_tex[iOffset + 1] = v1;
  
  f_tex[iOffset + 2] = u2;
  f_tex[iOffset + 3] = v1;

  f_tex[iOffset + 4] = u1;
  f_tex[iOffset + 5] = v2;

  f_tex[iOffset + 6] = u1;
  f_tex[iOffset + 7] = v2;

  f_tex[iOffset + 8] = u2;
  f_tex[iOffset + 9] = v1;

  f_tex[iOffset + 10] = u2;
  f_tex[iOffset + 11] = v2;

  gl.bindBuffer(gl.ARRAY_BUFFER, rectangleBufferTexTex);
  gl.bufferData(gl.ARRAY_BUFFER, f_tex, gl.STATIC_DRAW);

  f_tex = null;

  var f_pos = new Float32Array(1 * 6 * 3);

  var x1 = 50;
  var y1 = 70;

  var x2 = 200;
  var y2 = 260;

  var c = 0.4;
  
  var iOffset = 0;


  f_pos[iOffset + 0] = x1;
  f_pos[iOffset + 1] = y1;
  f_pos[iOffset + 2] = c;

  f_pos[iOffset + 3] = x2;
  f_pos[iOffset + 4] = y1;
  f_pos[iOffset + 5] = c;

  f_pos[iOffset + 6] = x1;
  f_pos[iOffset + 7] = y2;
  f_pos[iOffset + 8] = c;

  f_pos[iOffset + 9] = x1;
  f_pos[iOffset + 10] = y2;
  f_pos[iOffset + 11] = c;

  f_pos[iOffset + 12] = x2;
  f_pos[iOffset + 13] = y1;
  f_pos[iOffset + 14] = c;

  f_pos[iOffset + 15] = x2;
  f_pos[iOffset + 16] = y2;
  f_pos[iOffset + 17] = c;

  gl.bindBuffer(gl.ARRAY_BUFFER, rectangleBufferPosTex);
  gl.bufferData(gl.ARRAY_BUFFER, f_pos, gl.STATIC_DRAW);


  f_pos = null;
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     buildGLFromData
//

function buildGLFromData(w)
{

  var
    nPrimitives = getNumberOfRectangles();

  var nVertexPerRectangle = 6;

  var nElementsPerVertex = 3;

  var nElementsPerRectangle = nVertexPerRectangle * nElementsPerVertex;

  var cpu_data = new Float32Array(nPrimitives * nElementsPerRectangle);

  var
    iOffset = 0;

  for (var iChunk = 0; iChunk < nMaxChunk; iChunk++) {

    var
      i = json_raw[iChunk];

    console.log("Elements found : " + i.length);

    for (var iPerson = 0; iPerson < i.length; iPerson++) {

      var q = i[iPerson];
      var id = q.id;
      var events = q.E;
      var nEvents = events.length;

      
      for (var iEvent = 0; iEvent < nEvents; iEvent++)
      {
        var begin = events[iEvent];
        var end = begin - 14;
        var color = 0.9;

        build_interval_rectangle(cpu_data, iOffset, id, begin, end, color, w);

        iOffset += nElementsPerRectangle;

      }
      
      var aa_intervals = q.AA;
      var nAA = aa_intervals.length;

      
      for (var iAA = 0; iAA < nAA; iAA += 2)
      {
        var begin = aa_intervals[iAA + 0];
        var end = aa_intervals[iAA + 1];
        var color = 0.3;

        build_interval_rectangle(cpu_data, iOffset, id, begin, end, color, w);

        iOffset += nElementsPerRectangle;
      }

    }

    nRectangleCount = nPrimitives;
  }


  gl.bindBuffer(gl.ARRAY_BUFFER, rectangleBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cpu_data, gl.STATIC_DRAW);

  cpu_data = null;

}


///////////////////////////////////////////////////////////////////////////////////////
//
//     transferComplete
//

function transferComplete(evt) {

    console.log("The transfer is complete for loading# " + loading_state);

    json_raw[loading_state] = JSON.parse(xmlhttp.response);

    if (loading_state < 4)
    {
      console.log("Issuing new load");
      loading_state++;
      LoadData();
    }
    else
    {
      console.log("All loading done. Starting GL");

      // setupGLTex();
      setupGL();

     


      requestAnimationFrame(render);
    }
}


///////////////////////////////////////////////////////////////////////////////////////
//
//     updateProgress
//

function updateProgress(oEvent) {
    if (oEvent.lengthComputable) {
        
        var percentComplete = oEvent.loaded / oEvent.total;
        console.log("loading... (" + (100.0 * percentComplete).toPrecision(2) + " %)");

    } else {
        console.log("loading...");
    }
}


///////////////////////////////////////////////////////////////////////////////////////
//
//     LoadData
//

function LoadData() {

    xmlhttp = new XMLHttpRequest();

    xmlhttp.addEventListener("load", transferComplete);
    xmlhttp.addEventListener("progress", updateProgress);

    var data_url = "data" + loading_state + ".json"; 

    console.log("LoadData()"); 

    xmlhttp.onreadystatechange = function () {
        console.log("readyState = " + this.readyState + ", status = " + this.status);
    };

    xmlhttp.open("GET", data_url, true);
    xmlhttp.send();

}

///////////////////////////////////////////////////////////////////////////////////////
//
//     setupGLTex
//

function setupGLTex() {

  // Create a buffer
  rectangleBufferTexTex = gl.createBuffer();
  rectangleBufferPosTex = gl.createBuffer();

  buildGLTex();

  // Use our boilerplate utils to compile the shaders and link into a program
  programTex = webglUtils.createProgramFromSources(gl,
    [vertexShaderSourceTEX, fragmentShaderSourceTEX]);

  gl.useProgram(programTex);


  // look up where the vertex data needs to go.
  positionAttributeLocationTex = GetUniformLocation(programTex, "a_positionTEX", false);

  texAttributeLocationTex = GetUniformLocation(programTex, "a_texcoordTEX", false);

  resolutionUniformLocationTex = GetUniformLocation(programTex, "u_resolutionTEX", true);
  contentsizeUniformLocationTex = GetUniformLocation(programTex, "u_contents_sizeTEX", true);
  offsetLocationTex = GetUniformLocation(programTex, "pixel_offsetTEX", true);
  y_scaleLocationTex = GetUniformLocation(programTex, "y_scaleTEX", true);

  usamplerTex = GetUniformLocation(programTex, "u_textureTEX", true);
  
  // Create a vertex array object (attribute state)
  vaoTex = gl.createVertexArray();


   // Create a texture.
  var texture = gl.createTexture();
  

  // fill texture with 4x4 pixels
  const level = 0;
  const internalFormat = gl.R8;
  const width = 4;
  const height = 4;
  const border = 0;
  const format = gl.RED;
  const type = gl.UNSIGNED_BYTE;
  const data = new Uint8Array([
    128, 64, 128,   0, 192, 0, 12, 142,
      0, 34, 200, 100, 255, 6, 88, 187 
  ]);

  // bind to the TEXTURE_2D bind point of texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border,
    format, type, data);

  // set the filtering so we don't need mips and it's not filtered
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  gl.activeTexture(gl.TEXTURE0 + 0);
 

}


///////////////////////////////////////////////////////////////////////////////////////
//
//     setupGL
//

function setupGL()
{

  // Create a buffer
  rectangleBuffer = gl.createBuffer();

  lineBuffer = gl.createBuffer();


  buildGLFromData(W);

  buildGLLines(W);

  // Use our boilerplate utils to compile the shaders and link into a program
  program = webglUtils.createProgramFromSources(gl,
    [vertexShaderSourceBASIC, fragmentShaderSourceBASIC]);

  // look up where the vertex data needs to go.
  positionAttributeLocation = GetUniformLocation(program, "a_position", false);

  resolutionUniformLocation = GetUniformLocation(program, "u_resolution", true);
  contentsizeUniformLocation = GetUniformLocation(program, "u_contents_size", true);
  offsetLocation = GetUniformLocation(program, "pixel_offset", true);
  y_scaleLocation = GetUniformLocation(program, "y_scale", true);

  // Create a vertex array object (attribute state)
  vao = gl.createVertexArray();

}



///////////////////////////////////////////////////////////////////////////////////////
//
//     main
//

function main() {

  LoadData();

  console.log("LoadData has been issued");
  // Get A WebGL context
  canvas = document.getElementById("c");
  gl = canvas.getContext("webgl2");
  if (!gl) {
    return;
  }
  

  logCanvasSize();

  window.addEventListener('resize', resizeEventHandler, false);

  canvas.onmousedown = handleMouseDown;
  canvas.onmouseup = handleMouseUp;
  canvas.onmousemove = handleMouseMove;

  canvas.onmousewheel = handleMouseWheel;

}


///////////////////////////////////////////////////////////////////////////////////////
//
//     write_rectangle
//

function write_rectangle(f, iOffset, x1, y1, x2, y2, color)
{
  f[iOffset + 0] = x1;
  f[iOffset + 1] = y1;
  f[iOffset + 2] = color;

  f[iOffset + 3] = x2;
  f[iOffset + 4] = y1;
  f[iOffset + 5] = color;

  f[iOffset + 6] = x1;
  f[iOffset + 7] = y2;
  f[iOffset + 8] = color;

  f[iOffset + 9] = x1;
  f[iOffset + 10] = y2;
  f[iOffset + 11] = color;

  f[iOffset + 12] = x2;
  f[iOffset + 13] = y1;
  f[iOffset + 14] = color;

  f[iOffset + 15] = x2;
  f[iOffset + 16] = y2;
  f[iOffset + 17] = color;
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     get_x_from_time
//

function get_x_from_time(w, time)
{
  var start_time = (1995 - 1970) * 365.242199;
  var end_time = (2018 - 1970) * 365.242199;

  var a = w / (end_time - start_time);

  return a * (time - start_time);
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     build_interval_rectangle
//

function build_interval_rectangle(f, iOffset, id, begin, end, color, w)
{
  var x1 = get_x_from_time(w, begin);
  var x2 = get_x_from_time(w, end);
  
  

  var y1 = id * row_size;
  var y2 = y1 + rectangle_thickness;

  write_rectangle(f, iOffset, x1, y1, x2, y2, color);
}

function resize(canvas) {
  // Lookup the size the browser is displaying the canvas.
  var displayWidth = canvas.clientWidth;
  var displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  if (canvas.width !== displayWidth ||
    canvas.height !== displayHeight) {

    // Make the canvas the same size
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
}


function render_rectangles() {

  // Bind the attribute/buffer set we want.

  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(positionAttributeLocation);

  gl.bindBuffer(gl.ARRAY_BUFFER, rectangleBuffer);

  // Tell the attribute how to get data out of rectangleBuffer (ARRAY_BUFFER)
  var size = 3;          // 3 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer


  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset);

  gl.useProgram(program);


  var
    x_factor = gl.canvas.width / W;

  var
    y = getOffsetY();

  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform2f(contentsizeUniformLocation, x_factor, 1);
  gl.uniform2f(offsetLocation, 0, -y);
  gl.uniform1f(y_scaleLocation, y_scale);

  var offset = 0;

  var count = 6000 * 6; // nRectangleCount * 6;

  gl.drawArrays(gl.TRIANGLES, offset, count);
}

function render_lines() {

  gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);

  // Tell the attribute how to get data out of rectangleBuffer (ARRAY_BUFFER)
  var size = 3;          // 3 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer

  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset);

  gl.drawArrays(gl.LINES, 0, 2 * getLineCount());

}


function render_texture() {

  gl.bindVertexArray(vaoTex);

 

  gl.bindBuffer(gl.ARRAY_BUFFER, rectangleBufferPosTex);


  // Tell the attribute how to get data out of rectangleBuffer (ARRAY_BUFFER)
  var size = 3;          // 3 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer


  gl.vertexAttribPointer(
    positionAttributeLocationTex, size, type, normalize, stride, offset);

  gl.enableVertexAttribArray(positionAttributeLocationTex);

  // Turn on the attribute
 

  gl.bindBuffer(gl.ARRAY_BUFFER, rectangleBufferTexTex);

  // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floating point values
  var normalize = true;  // convert from 0-255 to 0.0-1.0
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next color
  var offset = 0;        // start at the beginning of the buffer

  gl.vertexAttribPointer(
    texAttributeLocationTex, size, type, normalize, stride, offset);

  gl.enableVertexAttribArray(texAttributeLocationTex);

  gl.activeTexture(gl.TEXTURE0 + 0);



 

  gl.useProgram(programTex);

  var
    x_factor = gl.canvas.width / W;

  var
    y = getOffsetY();

  gl.uniform2f(resolutionUniformLocationTex, gl.canvas.width, gl.canvas.height);
  gl.uniform2f(contentsizeUniformLocationTex, x_factor, 1);
  gl.uniform2f(offsetLocationTex, 0, -y);
  gl.uniform1f(y_scaleLocationTex, y_scale);

  gl.uniform1i(usamplerTex, 0);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
}


///////////////////////////////////////////////////////////////////////////////////////
//
//     render
//

function render() {

  resize(gl.canvas);

  animate_y_offset();
  animate_y_scale();

  // Tell WebGL how to convert from clip space to pixels
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(1, 1, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.disable(gl.BLEND);

  // render_texture();

  var is_draw_lines = true;

  if (is_draw_lines) {
     render_lines();
  }

   render_rectangles();
  
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     resizeEventHandler
//

function resizeEventHandler(event) {
  requestAnimationFrame(render);
}


///////////////////////////////////////////////////////////////////////////////////////
//
//     logCanvasSize
//

function logCanvasSize()
{
  var x = gl.canvas.width;
  var y = gl.canvas.height;

  console.log('gl.canvas size = (' + x + ',' + y + ')');
}

var isDragging = false;

var x_down;
var y_down;

var x_current;
var y_current;


///////////////////////////////////////////////////////////////////////////////////////
//
//     handleMouseUp
//

function handleMouseUp(event) {

  if (event.button != 0) {
    return;
  }

  isDragging = false;

  offsetX += (x_current - x_down);
  offsetY += (y_current - y_down);

  console.log('handleMouseUp delta (' + (x_current - x_down) + ',' + (y_current - y_down) + ')');

  requestAnimationFrame(render);
}


///////////////////////////////////////////////////////////////////////////////////////
//
//     getOffsetY
//

function getOffsetY()
{
  if (isDragging) {
    return (offsetY + (y_current - y_down))/ y_scale;
  }
  else {
    return  offsetY/ y_scale;
  }
}


///////////////////////////////////////////////////////////////////////////////////////
//
//     handleMouseMove
//

function handleMouseMove(event) {

  var rect = canvas.getBoundingClientRect();

  x_current = event.clientX - rect.left;
  y_current = event.clientY - rect.top;

  if (isDragging)
  {
    requestAnimationFrame(render);
  }
}


///////////////////////////////////////////////////////////////////////////////////////
//
//     trace
//

function trace(y_mouse) {

  console.log('trace at y=' + y_mouse);

  var
    screen_y = y_mouse;

  var
    content_y = (screen_y - offsetY) / y_scale;

  var
    row = content_y / row_size;

 
  console.log('trace at screen y =' + screen_y + ' gives row = ' + row);
}


///////////////////////////////////////////////////////////////////////////////////////
//
//     handleMouseDown
//

function handleMouseDown(event) {

  if (event.button != 0)
  {
    return;
  }

  var rect = canvas.getBoundingClientRect();

  isDragging = true;

  x_down = event.clientX - rect.left;
  y_down = event.clientY - rect.top;

  trace(y_down);

  x_current = x_down;
  y_current = y_down;

  logCanvasSize();

  console.log('handleMouseDown at (' + x_down + ',' + y_down + ')');
}


///////////////////////////////////////////////////////////////////////////////////////
//
//     animate_y_offset
//

function animate_y_offset() {

  var diff = getOffsetY() - offsetY_anim;
  
  var
    N = 7;

  diff = (N - 1) * diff / N;

  if (Math.abs(diff) < 0.005) {
    offsetY_anim = getOffsetY();
  }
  else {
    offsetY_anim = getOffsetY() - diff;
    requestAnimationFrame(render);
  }
}


///////////////////////////////////////////////////////////////////////////////////////
//
//     set_y_scale_and_adjust_offset
//

function set_y_scale_and_adjust_offset(y_scale_new, y_mouse) {

  var
    content_y0 = (y_mouse - offsetY) / y_scale;

  y_scale = y_scale_new;
  
  offsetY = y_mouse - content_y0 * y_scale;

  // console.log('set_y_scale_and_adjust_offset. scale = ' + y_scale);
}

var y_scale_optimal = 0;
var y_scale_optimal_mouse = 0;


///////////////////////////////////////////////////////////////////////////////////////
//
//     animate_y_end_and_stop
//

function animate_y_end_and_stop()
{
  if (y_scale_optimal == 0) {
    return;
  }
  set_y_scale_and_adjust_offset(y_scale_optimal, y_scale_optimal_mouse);
  y_scale_optimal = 0;

}


///////////////////////////////////////////////////////////////////////////////////////
//
//     animate_y_scale
//

function animate_y_scale()
{
  if (y_scale_optimal == 0)
  {
    return;
  }

  var
    y_diff = y_scale - y_scale_optimal;

  var
    N = 7;

  y_diff = (N-1) * y_diff / N;

  var
    y_scale_new = y_diff + y_scale_optimal;

  if (Math.abs(y_diff) < 0.005)
  {
    // console.log('Animation met threshold');
    animate_y_end_and_stop();
  }
  else
  {
    set_y_scale_and_adjust_offset(y_scale_new, y_scale_optimal_mouse);
    requestAnimationFrame(render);
  }
}


///////////////////////////////////////////////////////////////////////////////////////
//
//     handleMouseWheel
//

function handleMouseWheel(event) {

  var rect = canvas.getBoundingClientRect();

  var y_mouse = event.clientY - rect.top;

  var d = event.wheelDelta;
 
  var y_scale_new;


  var y_scale_current = (y_scale_optimal == 0) ? y_scale : y_scale_optimal;

  if (d > 0) {
    y_scale_new = y_scale_current * 1.1;
  } else {
    y_scale_new = y_scale_current / 1.1;
  }

  y_scale_optimal = y_scale_new;
  y_scale_optimal_mouse = y_mouse;

  requestAnimationFrame(render);
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     setRectangle
//
// Fill the buffer with the values that define a rectangle.

function setRectangle(gl, x, y, width, height, c) {

  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    x1, y1, c,
    x2, y1, c, 
    x1, y2, c, 
    x1, y2, c, 
    x2, y1, c, 
    x2, y2, c,
  ]), gl.STATIC_DRAW);
}

main();
