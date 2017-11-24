
let g_shader_source : string[] = [];

let g_gl : any;

let g_text_image : HTMLImageElement;

let g_nMaxChunk : number = 5;

let g_isYearLines : boolean = true;

let g_xmlhttp : XMLHttpRequest;
let g_loading_state : number = 0;
let g_json_raw : any[] = [];

let g_nCompleted : number = 0;

let viewport : ViewPort;

let radar : Radar;
let text_renderer : TextRenderer;
let rectangles : Rectangles;


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

///////////////////////////////////////////////////////////////////////////////////////
//
//     main5
//

function main5() : void {

  // Get A WebGL context

  let canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("c");
  
  g_gl = canvas.getContext("webgl2");

  if (!g_gl) {
    return;
  }

  viewport = new ViewPort(g_gl, canvas, g_render);

  radar = new Radar(g_gl);

  text_renderer = new TextRenderer(g_gl);

  rectangles = new Rectangles(g_gl);
 

  radar.setup(g_shader_source[4], g_shader_source[5]);

  text_renderer.setup(g_text_image, g_shader_source[2], g_shader_source[3]);

  rectangles.setup(g_shader_source[0], g_shader_source[1], viewport.row_size, g_json_raw, g_nMaxChunk, viewport.WORLD_WIDTH);
 
  requestAnimationFrame(g_render);
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     g_render
//

function g_render() : void {

  viewport.resize();
  viewport.animate();
  
  // Tell WebGL how to convert from clip space to pixels
  g_gl.viewport(0, 0, g_gl.canvas.width, g_gl.canvas.height);
  g_gl.clearColor(0, 0, 0, 0);
  g_gl.clear(g_gl.COLOR_BUFFER_BIT);
  g_gl.disable(g_gl.DEPTH_TEST);

  g_gl.enable(g_gl.BLEND);
  g_gl.blendFunc(g_gl.SRC_ALPHA, g_gl.ONE_MINUS_SRC_ALPHA);
  
  const
    x_factor : number = g_gl.canvas.width / viewport.WORLD_WIDTH;

  const
    y : number = viewport.getOffsetY();

  const
    row0 : number = viewport.get_row_min();

  const
    row1 : number = viewport.get_row_max();

  rectangles.render(y, viewport.y_scale, row0, row1, g_isYearLines, x_factor);

  text_renderer.render();

  var
    nRows = rectangles.getNumberOfPersons();

  var
    nFirstRow = viewport.get_row_min();

  var
    nLastRow = viewport.get_row_max();

  radar.render(nRows, nFirstRow, nLastRow);
  
}

main();

