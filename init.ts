
"use strict";

let shader_source : string[] = [];

let gl : any;
let canvas : HTMLCanvasElement;

let program_rect : any;
let positionAttributeLocation : number;
let resolutionUniformLocation : number;
let contentsizeUniformLocation : number;
let offsetLocation : number;
let y_scaleLocation : number;

let rectangleBuffer : number;
let vao_rectangles : number;


// Text resources begin

let program_text : number;

let textPosAttributeLocation : number;
let textTextureAttributeLocation : number;
let textureLocation : number;

let textResolutionUniformLocation : number;
let textPosBuffer : number;
let texturePosBuffer : number;

let vao_text : number;

let text_image : HTMLImageElement;

// Text resources end

// Radar resources begin

let program_radar : number;
let radarPosAttributeLocation : number;

let radarBuffer : number;

let vao_radar : number;

let f_radar : Float32Array;

// Radar resources end


let offsetX : number = 0;
let offsetY : number = 0;

let offsetY_anim = offsetY;

let W : number = 300;

let y_scale : number = 1;
let row_size : number = 15;
let rectangle_thickness : number = 7;

let bar_thickness : number = 14;

let nRectangleCount : number = 0;

let nTextRectangleCount : number = 0;

let nMaxChunk : number = 5;

let isYearLines : boolean = true;

let person_offset : Int32Array;

///////////////////////////////////////////////////////////////////////////////////////
//
//     createShader
//

function createShader(gl : any, type : any, source : string) : number {
  let shader : any = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  let success : number = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success != 0) {
    return shader;
  }

  console.log(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);

  return -1;
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     createProgram
//

function createProgram(gl : any, vertexShader : any, fragmentShader: any) : number {
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

  return -1;
}


///////////////////////////////////////////////////////////////////////////////////////
//
//     GetUniformLocation
//

function GetUniformLocation(p : number, name : string, isWarn : boolean) : number
{
  var
    location = gl.getUniformLocation(p, name);

  if (isWarn && location == null)
  {
    alert("GetUniformLocation: '" + name + "' not found");
  }

  return location;
}


let xmlhttp : XMLHttpRequest;
let loading_state : number = 0;
let json_raw : any[] = [];



function getNumberOfYearLines() : number
{
  let
    nYearLines : number = 0;

  for (var iYear = 1996; iYear < 2018; iYear++) {
    nYearLines++;
  }

  return nYearLines;

}

///////////////////////////////////////////////////////////////////////////////////////
//
//     getNumberOfRectangles
//

function getNumberOfRectangles() : number
{
  let
    nRectangles : number = 0;

  // Year bars

  nRectangles += getNumberOfYearLines();
  

  // Intervals

  for (let iChunk : number = 0; iChunk < nMaxChunk; iChunk++) {

    let
      i : any[] = json_raw[iChunk];

    for (let iPerson : number = 0; iPerson < i.length; iPerson++) {

      const q : any = i[iPerson];

      const nEvents : number = q.E.length;
      const nAA : number = q.AA.length;

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

function getNumberOfPersons() : number {

  let nPersons : number = 0;

  for (let iChunk : number = 0; iChunk < nMaxChunk; iChunk++) {

    let
      i : any = json_raw[iChunk];

    nPersons += i.length;
  }

  return nPersons;
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     buildGLFromData
//

function buildGLFromData(w : number) : void
{

  const
    nPrimitives : number = getNumberOfRectangles();

  const    
    nVertexPerRectangle : number = 6;

  const    
    nElementsPerVertex : number = 3;

  const
    nElementsPerRectangle : number = nVertexPerRectangle * nElementsPerVertex;

  let cpu_data : Float32Array = new Float32Array(nPrimitives * nElementsPerRectangle);

  person_offset = new Int32Array(getNumberOfPersons());

  let
    iOffset : number = 0;

  // Year bars
 
  for (let iYear : number = 1996; iYear < 2018; iYear++) {

    const time : number = (iYear - 1970) * 365.242199;

    let
      colorXXX : number = 0.0;

    if (iYear == 2002 || iYear == 2005 || iYear == 2015)
    {
      colorXXX = 0.99;
    }
    else
    {
      colorXXX = 0.4;
    }

    build_bar_rectangle(cpu_data, iOffset, time, time + bar_thickness, colorXXX, w);

    iOffset += nElementsPerRectangle;

  }


  // Intervals

  for (let iChunk : number = 0; iChunk < nMaxChunk; iChunk++) {

    let
      i : any = json_raw[iChunk];

    console.log("Elements found : " + i.length);

    for (let iPerson : number = 0; iPerson < i.length; iPerson++) {

      const q : any = i[iPerson];
      const id : number = q.id;
      const events : any = q.E;
      const nEvents : number = events.length;

      person_offset[id] = iOffset / nElementsPerVertex;


      const time0 : number = (1995 - 1970) * 365.242199;
      const time1 : number = (2018 - 1970) * 365.242199;

      build_interval_rectangle(cpu_data, iOffset, id, time0, time1, 0.8, w);
      iOffset += nElementsPerRectangle;
      
      for (let iEvent : number = 0; iEvent < nEvents; iEvent++)
      {
        const begin : number = events[iEvent];
        const end : number = begin - 14;
        const color : number = 0.6;

        build_interval_rectangle(cpu_data, iOffset, id, begin, end, color, w);

        iOffset += nElementsPerRectangle;

      }
      
      const aa_intervals : any[] = q.AA;
      const nAA : number = aa_intervals.length;

      
      for (let iAA : number = 0; iAA < nAA; iAA += 2)
      {
        const begin : number = aa_intervals[iAA + 0];
        const end : number = aa_intervals[iAA + 1];
        const color : number = 0.3;

        build_interval_rectangle(cpu_data, iOffset, id, begin, end, color, w);

        iOffset += nElementsPerRectangle;
      }

    }

    nRectangleCount = nPrimitives;
  }
 
  gl.bufferData(gl.ARRAY_BUFFER, cpu_data, gl.STATIC_DRAW);

}


///////////////////////////////////////////////////////////////////////////////////////
//
//     transferComplete
//

function transferComplete(evt:any) {

    evt;

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

function updateProgress(oEvent:any) {
    if (oEvent.lengthComputable) {
        
        let percentComplete : number = oEvent.loaded / oEvent.total;
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

    const data_url : string = "data/data" + loading_state + ".json"; 

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

function addTextTriangles(f : Float32Array, offset : number, x0 : number, y0 : number, x1 : number, y1 : number)
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

function addTextTextureCoords(g : Float32Array, offset : number, u_min : number, v_min : number, u_max : number, v_max : number)
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

  const vertexShader : any = createShader(gl, gl.VERTEX_SHADER,   shader_source[4]);
  const fragmentShader : any = createShader(gl, gl.FRAGMENT_SHADER, shader_source[5]);

  program_radar = createProgram(gl, vertexShader, fragmentShader);

  radarPosAttributeLocation = gl.getAttribLocation(program_radar, "radar_position");

  radarBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, radarBuffer);

  const
    x0 : number = -0.99,
    y0 : number = -0.9,
    x1 : number = -0.98,
    y1 : number = 0.9,

    x0_ : number = -1.0,
    y0_ : number = 0.1,     // Low window
    x1_ : number = -0.97,
    y1_ : number = 0.2;     // High window


  const positions : number[] = [
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

  const size : any = 2;          // 2 components per iteration
  const type : any = gl.FLOAT;   // the data is 32bit floats
  const normalize : any = false; // don't normalize the data
  const stride : any = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset : any = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(radarPosAttributeLocation, size, type, normalize, stride, offset);

  

}

///////////////////////////////////////////////////////////////////////////////////////
//
//     setupText
//

function setupText()
{

  const vertexShader : any = createShader(gl, gl.VERTEX_SHADER, shader_source[2]);
  const fragmentShader : any = createShader(gl, gl.FRAGMENT_SHADER, shader_source[3]);

  program_text = createProgram(gl, vertexShader, fragmentShader);

  textPosAttributeLocation = gl.getAttribLocation(program_text, "quad_position");
  textTextureAttributeLocation = gl.getAttribLocation(program_text, "quad_texcoord");

  textureLocation = gl.getUniformLocation(program_text, "u_texture");

  textResolutionUniformLocation = gl.getUniformLocation(program_text, "u_resolution");

  textPosBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, textPosBuffer);

  const
    image_w : number = text_image.width,
    image_h : number = text_image.height;

  nTextRectangleCount = 1* 22;
  

  let f : Float32Array = new Float32Array(nTextRectangleCount * 12);
  let g : Float32Array = new Float32Array(nTextRectangleCount * 12);

  let fOffset : number = 0;
  let gOffset : number = 0;

  let
    iPart : number = 1;    // Skip first (1995)

  const
    imageParts : number = 24;


  for (let iYear : number = 1996; iYear < 2018; iYear++) {

    const
      time : number = (iYear - 1970.35) * 365.242199;

    const
      u_min : number = 0.0,
      u_max : number = 1.0,
      v_min : number = iPart / imageParts,
      v_max : number = (iPart + 1) / imageParts;

    const
      x0 : number = get_x_from_time(1600, time),
      y0 : number = 100,
      x1 : number = x0 + image_w,
      y1 : number = y0 + image_h / imageParts;

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

  {
    const size : any = 2;          // 2 components per iteration
    const type : any = gl.FLOAT;   // the data is 32bit floats
    const normalize : any = false; // don't normalize the data
    const stride : any = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset : any = 0;        // start at the beginning of the buffer

    gl.vertexAttribPointer(textPosAttributeLocation, size, type, normalize, stride, offset);
  }
  
  texturePosBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, texturePosBuffer);

  gl.bufferData(gl.ARRAY_BUFFER, g, gl.STATIC_DRAW);

  gl.enableVertexAttribArray(textTextureAttributeLocation);

  {
    const size : any = 2;          // 2 components per iteration
    const type : any = gl.FLOAT;   // the data is 32bit floats
    const normalize : any = false; // don't normalize the data
    const stride : any = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset : any = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(textTextureAttributeLocation, size, type, normalize, stride, offset);
  }

  // Create a texture.
  const texture : any = gl.createTexture();

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
  const mipLevel : any = 0;               // the largest mip
  const internalFormat : any = gl.RGBA;   // format we want in the texture
  const srcFormat : any = gl.RGBA;        // format of data we are supplying
  const srcType : any = gl.UNSIGNED_BYTE  // type of data we are supplying
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

function setupRectangles() : void
{
  
  const vertexShader : any = createShader(gl, gl.VERTEX_SHADER, shader_source[0]);
  const fragmentShader : any = createShader(gl, gl.FRAGMENT_SHADER, shader_source[1]);

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
  const size : any = 3;          // 3 components per iteration
  const type : any = gl.FLOAT;   // the data is 32bit floats
  const normalize : any = false; // don't normalize the data
  const stride : any = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  const offset : any = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(
    positionAttributeLocation, size, type, normalize, stride, offset);

}

function loadImage() : void {

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

function main() : void {

  loadImage();
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     main2
//

function main2() : void {

  LoadData();
}

var
  nCompleted = 0;

///////////////////////////////////////////////////////////////////////////////////////
//
//     signal_loaded
//

function signal_loaded() : void
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

function get_asynch(url : string, index : number) : void {

  const request : any = new XMLHttpRequest();
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

function LoadShaders() : void {

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

function main5() : void {

  // Get A WebGL context
  canvas = <HTMLCanvasElement> document.getElementById("c");

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

function write_rectangle(f : Float32Array, iOffset : number, x1 : number, y1 : number, x2 : number, y2 : number, color : number) : void
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

function get_x_from_time(w : number, time: number) : number
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

function build_bar_rectangle(f : Float32Array, iOffset : number, begin : number, end : number, color : number, w : number) : void
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

function build_interval_rectangle(f : Float32Array, iOffset : number, id : number, begin : number, end : number, color : number, w: number) : void
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

function resize(canvas: HTMLCanvasElement) : void {
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

function get_row_min() : number {

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

function get_row_max() : number {

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

function render_radar() : void {

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

function render_text() : void {

  gl.useProgram(program_text);
  gl.bindVertexArray(vao_text);

  const x : number = gl.canvas.width;
  const y : number = gl.canvas.height;

  const resolution_x : number = 1600.0; //  * (x / 1600);
  const resolution_y : number = 1024.0; //  * (y / 1600);

  gl.uniform2f(textResolutionUniformLocation, resolution_x, resolution_y);

  gl.uniform1i(textureLocation, 0);

  gl.drawArrays(gl.TRIANGLES, 0, nTextRectangleCount * 6);  // 6 vertices for one rectangle.


}

///////////////////////////////////////////////////////////////////////////////////////
//
//     render_rectangles
//

function render_rectangles() : void {

  gl.useProgram(program_rect);

  // Bind the attribute/buffer set we want.
  gl.bindVertexArray(vao_rectangles);

  const
    x_factor : number = gl.canvas.width / W;

  const
    y : number = getOffsetY();

  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  gl.uniform2f(contentsizeUniformLocation, x_factor, 1);
  gl.uniform2f(offsetLocation, 0, -y);
  gl.uniform1f(y_scaleLocation, y_scale);

  let count : number = nRectangleCount * 6;
  
  if (isYearLines) {
    gl.drawArrays(gl.TRIANGLES, 0, 6 * getNumberOfYearLines());
  }

  let offset : number = 6 * getNumberOfYearLines();

  count -= offset;
  
  const
    row0 : number = get_row_min();

  const
    row1 : number = get_row_max();

  const
    offset0 : number = person_offset[row0];

  const
    offset1 : number = person_offset[row1];

  if (offset0 > count)
  {
    return;
  }

  let
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

function render() : void {

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

function resizeEventHandler(event : any) : void {

  event;

  requestAnimationFrame(render);
}


///////////////////////////////////////////////////////////////////////////////////////
//
//     logCanvasSize
//

function logCanvasSize() : void
{
  var x = gl.canvas.width;
  var y = gl.canvas.height;

  console.log('gl.canvas size = (' + x + ',' + y + ')');
}

let isDragging : boolean= false;

let x_down : number;
let y_down : number;

let x_current : number;
let y_current : number;


///////////////////////////////////////////////////////////////////////////////////////
//
//     handleMouseUp
//

function handleMouseUp(event : any) : void {

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

function getOffsetY() : number 
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

function handleMouseMove(event : any) : void{

  const rect : ClientRect = canvas.getBoundingClientRect();

  const x_current : number = event.clientX - rect.left;
  const y_current : number = event.clientY - rect.top;

  if (isDragging)
  {
    requestAnimationFrame(render);
  }
}


///////////////////////////////////////////////////////////////////////////////////////
//
//     trace
//

function trace(y_mouse : number) : void {

  console.log('trace at y=' + y_mouse);

  const
    screen_y : number = y_mouse;

  const
    content_y : number = (screen_y - offsetY) / y_scale;

  const
    row : number = content_y / row_size;

 
  console.log('trace at screen y =' + screen_y + ' gives row = ' + row);
}


///////////////////////////////////////////////////////////////////////////////////////
//
//     handleMouseDown
//

function handleMouseDown(event : any) : void {

  if (event.button != 0)
  {
    return;
  }

  const rect : ClientRect = canvas.getBoundingClientRect();

  isDragging = true;

  x_down = event.clientX - rect.left;
  y_down = event.clientY - rect.top;

  trace(y_down);

  x_current = x_down;
  y_current = y_down;

  logCanvasSize();

  // Display height extent in world space:

  const
    row0_new : number = get_row_min();

  const
    row1_new : number = get_row_max();

  console.log('Rows on display2: [' + row0_new + ',' + row1_new + ']');


  console.log('handleMouseDown at (' + x_down + ',' + y_down + ')');
}


///////////////////////////////////////////////////////////////////////////////////////
//
//     animate_y_offset
//

function animate_y_offset() : void {

  let
    diff : number = getOffsetY() - offsetY_anim;
  
  const
    N : number = 7;

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

function set_y_scale_and_adjust_offset(y_scale_new : number, y_mouse : number) : void {

  const
    content_y0 : number = (y_mouse - offsetY) / y_scale;

  y_scale = y_scale_new;
  
  offsetY = y_mouse - content_y0 * y_scale;

  // console.log('set_y_scale_and_adjust_offset. scale = ' + y_scale);
}

let y_scale_optimal : number = 0;
let y_scale_optimal_mouse : number = 0;


///////////////////////////////////////////////////////////////////////////////////////
//
//     animate_y_end_and_stop
//

function animate_y_end_and_stop() : void {
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

function animate_y_scale() : void {
  if (y_scale_optimal == 0)
  {
    return;
  }

  let
    y_diff : number = y_scale - y_scale_optimal;

  const
    N : number = 7;

  y_diff = (N-1) * y_diff / N;

  const
    y_scale_new : number = y_diff + y_scale_optimal;

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

function handleMouseWheel(event : any) : void {

  const rect : ClientRect = canvas.getBoundingClientRect();

  const y_mouse : number = event.clientY - rect.top;

  const d : number = event.wheelDelta;
 
  let y_scale_new : number;

  const y_scale_current : number = (y_scale_optimal == 0) ? y_scale : y_scale_optimal;

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

function setRectangle(gl : any, x : number, y : number, width : number, height : number, c : number) : void {

  const x1 : number = x;
  const x2 : number = x + width;
  const y1 : number = y;
  const y2 : number = y + height;

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
