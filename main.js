
"use strict";


var shader_source = [];

var gl;
var canvas;

var program_rect;
var positionAttributeLocation;
var resolutionUniformLocation;
var contentsizeUniformLocation;
var offsetLocation;
var y_scaleLocation;

var rectangleBuffer;
var vao_rectangles;


// Text resources begin

var program_text;

var textPosAttributeLocation;
var textTextureAttributeLocation;
var textureLocation;

var textResolutionUniformLocation;
var textPosBuffer;
var texturePosBuffer;

var vao_text;

var text_image;

// Text resources end

// Radar resources begin

var program_radar;
var radarPosAttributeLocation;

var radarBuffer;

var vao_radar;

var f_radar;

// Radar resources end


var offsetX = 0;
var offsetY = 0;

var offsetY_anim = offsetY;

var W = 300;

var y_scale = 1;
var row_size = 15;
var rectangle_thickness = 7;

var bar_thickness = 14;

var nRectangleCount = 0;

var nTextRectangleCount = 0;

var nMaxChunk = 5;

var isYearLines = true;

var person_offset;

///////////////////////////////////////////////////////////////////////////////////////
//
//     createShader
//

function createShader(gl, type, source) {
  var shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     createProgram
//

function createProgram(gl, vertexShader, fragmentShader) {
  var program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (success) {
    return program;
  }

  console.log(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);
}


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



function getNumberOfYearLines()
{
  var
    nYearLines = 0;

  for (var iYear = 1996; iYear < 2018; iYear++) {
    nYearLines++;
  }

  return nYearLines;

}

///////////////////////////////////////////////////////////////////////////////////////
//
//     getNumberOfRectangles
//

function getNumberOfRectangles()
{
  var
    nRectangles = 0;

  // Year bars

  nRectangles += getNumberOfYearLines();
  

  // Intervals

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


  person_offset = new Int32Array(getNumberOfPersons());



  var
    iOffset = 0;

  // Year bars

 
  for (var iYear = 1996; iYear < 2018; iYear++) {

    var time = (iYear - 1970) * 365.242199;

    if (iYear == 2002 || iYear == 2005 || iYear == 2015)
    {
      color = 0.99;
    }

    build_bar_rectangle(cpu_data, iOffset, time, time + bar_thickness, color, w);

    iOffset += nElementsPerRectangle;

  }

  


  // Intervals

  for (var iChunk = 0; iChunk < nMaxChunk; iChunk++) {

    var
      i = json_raw[iChunk];

    console.log("Elements found : " + i.length);

    for (var iPerson = 0; iPerson < i.length; iPerson++) {

      var q = i[iPerson];
      var id = q.id;
      var events = q.E;
      var nEvents = events.length;

      person_offset[id] = iOffset / nElementsPerVertex;


      var time0 = (1995 - 1970) * 365.242199;
      var time1 = (2018 - 1970) * 365.242199;

      build_interval_rectangle(cpu_data, iOffset, id, time0, time1, 0.8, w);
      iOffset += nElementsPerRectangle;
      
      for (var iEvent = 0; iEvent < nEvents; iEvent++)
      {
        var begin = events[iEvent];
        var end = begin - 14;
        var color = 0.6;

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
      loading_state++;
      LoadData();
    }
    else
    {
      LoadShaders();
    }
}


///////////////////////////////////////////////////////////////////////////////////////
//
//     updateProgress
//

function updateProgress(oEvent) {
    if (oEvent.lengthComputable) {
        
        var percentComplete = oEvent.loaded / oEvent.total;
        // console.log("loading... (" + (100.0 * percentComplete).toPrecision(2) + " %)");

    } else {
        // console.log("loading...");
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

    xmlhttp.onreadystatechange = function () {
        // console.log("readyState = " + this.readyState + ", status = " + this.status);
    };

    xmlhttp.open("GET", data_url, true);
    xmlhttp.send();

}

///////////////////////////////////////////////////////////////////////////////////////
//
//     addTextTriangles
//

function addTextTriangles(f, offset, x0, y0, x1, y1)
{
  f[offset + 0] = x0;
  f[offset + 1] = y0;

  f[offset + 2] = x1;
  f[offset + 3] = y0;

  f[offset + 4] = x0;
  f[offset + 5] = y1;

  f[offset + 6] = x0;
  f[offset + 7] = y1;

  f[offset + 8] = x1;
  f[offset + 9] = y0;

  f[offset + 10] = x1;
  f[offset + 11] = y1;

  return offset + 12;

}

///////////////////////////////////////////////////////////////////////////////////////
//
//     addTextTextureCoords
//

function addTextTextureCoords(g, offset, u_min, v_min, u_max, v_max)
{

  g[offset + 0] = u_min;
  g[offset + 1] = v_min;

  g[offset + 2] = u_max;
  g[offset + 3] = v_min;

  g[offset + 4] = u_min;
  g[offset + 5] = v_max;

  g[offset + 6] = u_min;
  g[offset + 7] = v_max;

  g[offset + 8] = u_max;
  g[offset + 9] = v_min;

  g[offset + 10] = u_max;
  g[offset + 11] = v_max;

  return offset + 12;
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     setupRadar
//

function setupRadar() {

  var vertexShader   = createShader(gl, gl.VERTEX_SHADER,   shader_source[4]);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, shader_source[5]);

  program_radar = createProgram(gl, vertexShader, fragmentShader);

  radarPosAttributeLocation = gl.getAttribLocation(program_radar, "radar_position");

  radarBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, radarBuffer);

  var
    x0 = -0.99,
    y0 = -0.9,
    x1 = -0.98,
    y1 = 0.9,

    x0_ = -1.0,
    y0_ = 0.1,     // Low window
    x1_ = -0.97,
    y1_ = 0.2;     // High window


  var positions = [
    x0,  //  0
    y0,  //  1
    x1,  //  2
    y0,  //  3
    x0,  //  4
    y1,  //  5
    x0,  //  6
    y1,  //  7
    x1,  //  8
    y0,  //  9
    x1,  // 10
    y1,  // 11

    x0_, // 12
    y0_, // 13   low window
    x1_, // 14
    y0_, // 15   low window
    x0_, // 16
    y1_, // 17   High window
    x0_, // 18
    y1_, // 19    High window
    x1_, // 20
    y0_, // 21    low window
    x1_, // 22
    y1_, // 23    High window

  ];
  
  f_radar = new Float32Array(positions);

  gl.bufferData(gl.ARRAY_BUFFER, f_radar, gl.DYNAMIC_DRAW);

  
  vao_radar = gl.createVertexArray();

  gl.bindVertexArray(vao_radar);

  gl.enableVertexAttribArray(radarPosAttributeLocation);

  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(radarPosAttributeLocation, size, type, normalize, stride, offset);

  

}

///////////////////////////////////////////////////////////////////////////////////////
//
//     setupText
//

function setupText()
{

  var vertexShader = createShader(gl, gl.VERTEX_SHADER, shader_source[2]);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, shader_source[3]);

  program_text = createProgram(gl, vertexShader, fragmentShader);

  textPosAttributeLocation = gl.getAttribLocation(program_text, "quad_position");
  textTextureAttributeLocation = gl.getAttribLocation(program_text, "quad_texcoord");

  textureLocation = gl.getUniformLocation(program_text, "u_texture");

  textResolutionUniformLocation = gl.getUniformLocation(program_text, "u_resolution");

  textPosBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, textPosBuffer);

  var
    image_w = text_image.width,
    image_h = text_image.height;

  nTextRectangleCount = 1* 22;
  

  var f = new Float32Array(nTextRectangleCount * 12);
  var g = new Float32Array(nTextRectangleCount * 12);

  var fOffset = 0;
  var gOffset = 0;

  var
    iPart = 1;    // Skip first (1995)

  var
    imageParts = 24;


  for (var iYear = 1996; iYear < 2018; iYear++) {

    var
      time = (iYear - 1970.35) * 365.242199;

    var
      u_min = 0.0,
      u_max = 1.0,
      v_min = iPart / imageParts,
      v_max = (iPart + 1) / imageParts;

    var
      x0 = get_x_from_time(1600, time),
      y0 = 100,
      x1 = x0 + image_w,
      y1 = y0 + image_h / imageParts;

    gOffset = addTextTextureCoords(g, gOffset, u_min, v_min, u_max, v_max);
    fOffset = addTextTriangles(f, fOffset, x0, y0, x1, y1);

/*
    x0 = get_x_from_time(1600, time),
    y0 = 1000,
    x1 = x0 + image_w,
    y1 = y0 + image_h / imageParts;

    gOffset = addTextTextureCoords(g, gOffset, u_min, v_min, u_max, v_max);
    fOffset = addTextTriangles(f, fOffset, x0, y0, x1, y1);
*/
    iPart++;
  }

  gl.bufferData(gl.ARRAY_BUFFER, f, gl.STATIC_DRAW);

  vao_text = gl.createVertexArray();
  gl.bindVertexArray(vao_text);

  gl.enableVertexAttribArray(textPosAttributeLocation);

  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer

  gl.vertexAttribPointer(textPosAttributeLocation, size, type, normalize, stride, offset)
  
  texturePosBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, texturePosBuffer);

 

  gl.bufferData(gl.ARRAY_BUFFER, g, gl.STATIC_DRAW);

  gl.enableVertexAttribArray(textTextureAttributeLocation);

  var size = 2;          // 2 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
    textTextureAttributeLocation, size, type, normalize, stride, offset)


  // Create a texture.
  var texture = gl.createTexture();

  // make unit 0 the active texture uint
  // (ie, the unit all other texture commands will affect
  gl.activeTexture(gl.TEXTURE0 + 0);

  // Bind it to texture unit 0' 2D bind point
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the parameters so we don't need mips and so we're not filtering
  // and we don't repeat
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Upload the image into the texture.
  var mipLevel = 0;               // the largest mip
  var internalFormat = gl.RGBA;   // format we want in the texture
  var srcFormat = gl.RGBA;        // format of data we are supplying
  var srcType = gl.UNSIGNED_BYTE  // type of data we are supplying
  gl.texImage2D(gl.TEXTURE_2D,
    mipLevel,
    internalFormat,
    srcFormat,
    srcType,
    text_image);



}


///////////////////////////////////////////////////////////////////////////////////////
//
//     setupRectangles
//

function setupRectangles()
{

  // Use our boilerplate utils to compile the shaders and link into a program
  var vertexShader = createShader(gl, gl.VERTEX_SHADER, shader_source[0]);
  var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, shader_source[1]);

  program_rect = createProgram(gl, vertexShader, fragmentShader);


  // look up where the vertex data needs to go.
  positionAttributeLocation = GetUniformLocation(program_rect, "a_position", false);

  resolutionUniformLocation = GetUniformLocation(program_rect, "u_resolution", true);
  contentsizeUniformLocation = GetUniformLocation(program_rect, "u_contents_size", true);
  offsetLocation = GetUniformLocation(program_rect, "pixel_offset", true);
  y_scaleLocation = GetUniformLocation(program_rect, "y_scale", true);


  rectangleBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, rectangleBuffer);
  buildGLFromData(W);


  // Create a vertex array object (attribute state)
  vao_rectangles = gl.createVertexArray();

  // and make it the one we're currently working with
  gl.bindVertexArray(vao_rectangles);

  // Turn on the attribute
  gl.enableVertexAttribArray(positionAttributeLocation);

  // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 3;          // 3 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset);

}

function loadImage() {

  console.log("Loading image...");

  text_image = new Image();
  text_image.src = "y2.jpg";
  text_image.onload = function () {
    console.log("Image has been loaded (" + text_image.width + "," + text_image.height + ")");
    main2();
  }
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     main
//

function main() {

  loadImage();
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     main2
//

function main2() {

  LoadData();
}

var
  nCompleted = 0;

///////////////////////////////////////////////////////////////////////////////////////
//
//     signal_loaded
//

function signal_loaded()
{
  nCompleted++;

  if (nCompleted == 6) {
    console.log("All loaded");
    main5();
  }

}

///////////////////////////////////////////////////////////////////////////////////////
//
//     get_asynch
//

function get_asynch(url, index) {

  var request = new XMLHttpRequest();
  request.open("GET", url, true);

  request.onload = function () {

    shader_source[index] = this.responseText;

    console.log("Loaded OK: " + url);

    signal_loaded();
  };
  request.send(null);

}


///////////////////////////////////////////////////////////////////////////////////////
//
//     LoadShaders()
//

function LoadShaders() {

  get_asynch("shaders/rectangles.vert", 0);
  get_asynch("shaders/rectangles.frag", 1);

  get_asynch("shaders/text.vert", 2);
  get_asynch("shaders/text.frag", 3);

  get_asynch("shaders/radar.vert", 4);
  get_asynch("shaders/radar.frag", 5);
}


///////////////////////////////////////////////////////////////////////////////////////
//
//     main5
//

function main5() {

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

  setupRadar();
  setupText();
  setupRectangles();
  requestAnimationFrame(render);
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

function build_bar_rectangle(f, iOffset, begin, end, color, w)
{
  var x1 = get_x_from_time(w, begin);
  var x2 = get_x_from_time(w, end);

  var y1 = 0 * row_size;
  var y2 = 5000 * row_size;

  write_rectangle(f, iOffset, x1, y1, x2, y2, color);
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

///////////////////////////////////////////////////////////////////////////////////////
//
//     resize
//

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


///////////////////////////////////////////////////////////////////////////////////////
//
//     get_row_min
//

function get_row_min() {

  var
    rOffsetYScaled = getOffsetY();


  var
    frow0 = -rOffsetYScaled;

  frow0 = frow0 / row_size;

  var
    row0 = Math.round(frow0) - 1;

  if (row0 < 0) {
    row0 = 0;
  }

  return row0;
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     get_row_max
//

function get_row_max() {

  var
    rOffsetYScaled = getOffsetY();

  var
    frow1 = gl.canvas.height / y_scale - rOffsetYScaled;

  frow1 = frow1 / row_size;

  var
    row1 = Math.round(frow1) + 1;

  if (row1 < 0) {
    row1 = 0;
  }

  return row1;
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     render_radar
//

function render_radar() {

  // Change buffer:


  var
    nRows = getNumberOfPersons();

  var
    nFirstRow = get_row_min();

  var
    nLastRow = get_row_max();

  var
    showingRatio = (nLastRow - nFirstRow) / nRows;

  var
    showingSize = 1.8 * showingRatio;

  var
    nearTop = 0.9 - 1.8 * (nFirstRow / nRows); //  [ 0.5 .. 0]

  var yTop = nearTop;

  var yBottom = nearTop - showingSize;


  gl.bindBuffer(gl.ARRAY_BUFFER, radarBuffer);


  f_radar[13] = yBottom;
  f_radar[15] = yBottom;
  f_radar[21] = yBottom;
 
  f_radar[17] = yTop;
  f_radar[19] = yTop;
  f_radar[23] = yTop;

  gl.bufferSubData(gl.ARRAY_BUFFER, 0, f_radar, 0, f_radar.length);

  gl.useProgram(program_radar);
  gl.bindVertexArray(vao_radar);

  gl.drawArrays(gl.TRIANGLES, 0, 12);

}



///////////////////////////////////////////////////////////////////////////////////////
//
//     render_text
//

function render_text() {

  gl.useProgram(program_text);
  gl.bindVertexArray(vao_text);

  var x = gl.canvas.width;
  var y = gl.canvas.height;

  var resolution_x = 1600.0; //  * (x / 1600);
  var resolution_y = 1024.0; //  * (y / 1600);

  gl.uniform2f(textResolutionUniformLocation, resolution_x, resolution_y);

  gl.uniform1i(textureLocation, 0);

  gl.drawArrays(gl.TRIANGLES, 0, nTextRectangleCount * 6);  // 6 vertices for one rectangle.


}

///////////////////////////////////////////////////////////////////////////////////////
//
//     render_rectangles
//

function render_rectangles() {

  gl.useProgram(program_rect);

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao_rectangles);

  var
    x_factor = gl.canvas.width / W;

  var
    y = getOffsetY();

  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform2f(contentsizeUniformLocation, x_factor, 1);
  gl.uniform2f(offsetLocation, 0, -y);
  gl.uniform1f(y_scaleLocation, y_scale);

  var count = nRectangleCount * 6;
  
  if (isYearLines) {
    gl.drawArrays(gl.TRIANGLES, 0, 6 * getNumberOfYearLines());
  }

  var offset = 6 * getNumberOfYearLines();

  count -= offset;
  
  var
    row0 = get_row_min();

  var
    row1 = get_row_max();

  var
    offset0 = person_offset[row0];

  var
    offset1 = person_offset[row1];

  if (offset0 > count)
  {
    return;
  }

  var
    newCount = offset1 - offset0;

  if (offset0 + newCount > count)
  {
    newCount = count - offset0;
  }

  gl.drawArrays(gl.TRIANGLES, offset0, newCount);
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
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.disable(gl.DEPTH_TEST);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  
  render_rectangles();
  render_text();
  render_radar();
  
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


  // Display height extent in world space:

  var
    row0_new = get_row_min();

  var
    row1_new = get_row_max();

  console.log('Rows on display2: [' + row0_new + ',' + row1_new + ']');


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
