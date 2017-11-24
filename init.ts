


let g_shader_source : string[] = [];

let g_gl : any;
let g_canvas : HTMLCanvasElement;

let g_text_image : HTMLImageElement;

let g_offsetX : number = 0;
let g_offsetY : number = 0;

let g_offsetY_anim = g_offsetY;

const WORLD_WIDTH : number = 700;

let g_y_scale : number = 1;

const g_row_size : number = 15;


let g_nMaxChunk : number = 5;

let g_isYearLines : boolean = true;



let g_xmlhttp : XMLHttpRequest;
let g_loading_state : number = 0;
let g_json_raw : any[] = [];

let g_isDragging : boolean= false;

let g_x_down : number;
let g_y_down : number;

let g_x_current : number;
let g_y_current : number;

let g_y_scale_optimal : number = 0;
let g_y_scale_optimal_mouse : number = 0;

let g_nCompleted : number = 0;


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
//     getNumberOfPersons
//

function getNumberOfPersons() : number {

  let nPersons : number = 0;

  for (let iChunk : number = 0; iChunk < g_nMaxChunk; iChunk++) {

    let
      i : any = g_json_raw[iChunk];

    nPersons += i.length;
  }

  return nPersons;
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     transferComplete
//

function transferComplete(evt:any) {

    evt;

    console.log("The transfer is complete for loading# " + g_loading_state);

    g_json_raw[g_loading_state] = JSON.parse(g_xmlhttp.response);

    if (g_loading_state < 4)
    {
      g_loading_state++;
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

    g_xmlhttp = new XMLHttpRequest();

    g_xmlhttp.addEventListener("load", transferComplete);
    g_xmlhttp.addEventListener("progress", updateProgress);

    const data_url : string = "data/data" + g_loading_state + ".json"; 

    g_xmlhttp.onreadystatechange = function () {
        // console.log("readyState = " + this.readyState + ", status = " + this.status);
    };

    g_xmlhttp.open("GET", data_url, true);
    g_xmlhttp.send();

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
//     loadImage
//

function loadImage() : void {

  console.log("Loading image...");

  g_text_image = new Image();
  g_text_image.src = "y2.jpg";
  g_text_image.onload = function () {
    console.log("Image has been loaded (" + g_text_image.width + "," + g_text_image.height + ")");
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



///////////////////////////////////////////////////////////////////////////////////////
//
//     signal_loaded
//

function signal_loaded() : void
{
  g_nCompleted++;

  if (g_nCompleted == 6) {
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

    g_shader_source[index] = this.responseText;

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



let radar : Radar;

let text_renderer : TextRenderer;

let rectangles : Rectangles;


///////////////////////////////////////////////////////////////////////////////////////
//
//     main5
//

function main5() : void {

  // Get A WebGL context
  g_canvas = <HTMLCanvasElement> document.getElementById("c");

  g_gl = g_canvas.getContext("webgl2");
  if (!g_gl) {
    return;
  }

  radar = new Radar(g_gl);

  text_renderer = new TextRenderer(g_gl);

  rectangles = new Rectangles(g_gl);

  logCanvasSize();

  window.addEventListener('resize', resizeEventHandler, false);

  g_canvas.onmousedown = handleMouseDown;
  g_canvas.onmouseup = handleMouseUp;
  g_canvas.onmousemove = handleMouseMove;

  g_canvas.onmousewheel = handleMouseWheel;

  radar.setup(g_shader_source[4], g_shader_source[5]);

  text_renderer.setup(g_text_image, g_shader_source[2], g_shader_source[3]);

  rectangles.setup(g_shader_source[0], g_shader_source[1], g_row_size, g_json_raw, g_nMaxChunk);
 
  requestAnimationFrame(render);
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

  frow0 = frow0 / g_row_size;

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
    frow1 = g_gl.canvas.height / g_y_scale - rOffsetYScaled;

  frow1 = frow1 / g_row_size;

  var
    row1 = Math.round(frow1) + 1;

  if (row1 < 0) {
    row1 = 0;
  }

  return row1;
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     render
//

function render() : void {

  resize(g_gl.canvas);

  animate_y_offset();
  animate_y_scale();

  // Tell WebGL how to convert from clip space to pixels
  g_gl.viewport(0, 0, g_gl.canvas.width, g_gl.canvas.height);
  g_gl.clearColor(0, 0, 0, 0);
  g_gl.clear(g_gl.COLOR_BUFFER_BIT);
  g_gl.disable(g_gl.DEPTH_TEST);

  g_gl.enable(g_gl.BLEND);
  g_gl.blendFunc(g_gl.SRC_ALPHA, g_gl.ONE_MINUS_SRC_ALPHA);
  
  const
    x_factor : number = g_gl.canvas.width / WORLD_WIDTH;

  const
    y : number = getOffsetY();

  rectangles.render(y, g_y_scale, g_isYearLines, x_factor);

  text_renderer.render();

  var
    nRows = getNumberOfPersons();

  var
    nFirstRow = get_row_min();

  var
    nLastRow = get_row_max();

  radar.render(nRows, nFirstRow, nLastRow);
  
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
  var x = g_gl.canvas.width;
  var y = g_gl.canvas.height;

  console.log('gl.canvas size = (' + x + ',' + y + ')');
}




///////////////////////////////////////////////////////////////////////////////////////
//
//     handleMouseUp
//

function handleMouseUp(event : any) : void {

  if (event.button != 0) {
    return;
  }

  g_isDragging = false;

  g_offsetX += (g_x_current - g_x_down);
  g_offsetY += (g_y_current - g_y_down);

  console.log('handleMouseUp delta (' + (g_x_current - g_x_down) + ',' + (g_y_current - g_y_down) + ')');

  requestAnimationFrame(render);
}


///////////////////////////////////////////////////////////////////////////////////////
//
//     getOffsetY
//

function getOffsetY() : number 
{
  if (g_isDragging) {
    return (g_offsetY + (g_y_current - g_y_down))/ g_y_scale;
  }
  else {
    return g_offsetY/ g_y_scale;
  }
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     handleMouseMove
//

function handleMouseMove(event : any) : void{

  const rect : ClientRect = g_canvas.getBoundingClientRect();

  g_x_current = event.clientX - rect.left;
  g_y_current = event.clientY - rect.top;

  if (g_isDragging)
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
    content_y : number = (screen_y - g_offsetY) / g_y_scale;

  const
    row : number = content_y / g_row_size;

 
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

  const rect : ClientRect = g_canvas.getBoundingClientRect();

  g_isDragging = true;

  g_x_down = event.clientX - rect.left;
  g_y_down = event.clientY - rect.top;

  trace(g_y_down);

  g_x_current = g_x_down;
  g_y_current = g_y_down;

  logCanvasSize();

  // Display height extent in world space:

  const
    row0_new : number = get_row_min();

  const
    row1_new : number = get_row_max();

  console.log('Rows on display2: [' + row0_new + ',' + row1_new + ']');


  console.log('handleMouseDown at (' + g_x_down + ',' + g_y_down + ')');
}


///////////////////////////////////////////////////////////////////////////////////////
//
//     animate_y_offset
//

function animate_y_offset() : void {

  let
    diff : number = getOffsetY() - g_offsetY_anim;
  
  const
    N : number = 7;

  diff = (N - 1) * diff / N;

  if (Math.abs(diff) < 0.005) {
    g_offsetY_anim = getOffsetY();
  }
  else {
    g_offsetY_anim = getOffsetY() - diff;
    requestAnimationFrame(render);
  }
}


///////////////////////////////////////////////////////////////////////////////////////
//
//     set_y_scale_and_adjust_offset
//

function set_y_scale_and_adjust_offset(y_scale_new : number, y_mouse : number) : void {

  const
    content_y0 : number = (y_mouse - g_offsetY) / g_y_scale;

  g_y_scale = y_scale_new;
  
  g_offsetY = y_mouse - content_y0 * g_y_scale;

  // console.log('set_y_scale_and_adjust_offset. scale = ' + y_scale);
}




///////////////////////////////////////////////////////////////////////////////////////
//
//     animate_y_end_and_stop
//

function animate_y_end_and_stop() : void {
  if (g_y_scale_optimal == 0) {
    return;
  }
  set_y_scale_and_adjust_offset(g_y_scale_optimal, g_y_scale_optimal_mouse);
  g_y_scale_optimal = 0;

}


///////////////////////////////////////////////////////////////////////////////////////
//
//     animate_y_scale
//

function animate_y_scale() : void {
  if (g_y_scale_optimal == 0)
  {
    return;
  }

  let
    y_diff : number = g_y_scale - g_y_scale_optimal;

  const
    N : number = 7;

  y_diff = (N-1) * y_diff / N;

  const
    y_scale_new : number = y_diff + g_y_scale_optimal;

  if (Math.abs(y_diff) < 0.005)
  {
    // console.log('Animation met threshold');
    animate_y_end_and_stop();
  }
  else
  {
    set_y_scale_and_adjust_offset(y_scale_new, g_y_scale_optimal_mouse);
    requestAnimationFrame(render);
  }
}


///////////////////////////////////////////////////////////////////////////////////////
//
//     handleMouseWheel
//

function handleMouseWheel(event : any) : void {

  const rect : ClientRect = g_canvas.getBoundingClientRect();

  const y_mouse : number = event.clientY - rect.top;

  const d : number = event.wheelDelta;
 
  let y_scale_new : number;

  const y_scale_current : number = (g_y_scale_optimal == 0) ? g_y_scale : g_y_scale_optimal;

  if (d > 0) {
    y_scale_new = y_scale_current * 1.1;
  } else {
    y_scale_new = y_scale_current / 1.1;
  }

  g_y_scale_optimal = y_scale_new;
  g_y_scale_optimal_mouse = y_mouse;

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
