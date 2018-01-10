
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

let detail : Detail;

let text_renderer : TextRenderer;
let rectangles : Rectangles;


let g_node1 : Text;
let g_node2 : Text;
let g_node3 : Text;

let time : number = 0;
let time_delta : number = 1;


let is_index1 : boolean = true;

///////////////////////////////////////////////////////////////////////////////////////
//
//     g_renderHTML
//

function g_renderHTML(): void {

  time += time_delta;

  const nPersons : number = rectangles.getNumberOfPersons();

  const nRows : number = viewport.get_row_max() - viewport.get_row_min();

  const
    value1 : string = nPersons.toFixed(0),
    value2 : string = time.toFixed(0),
    value3 : string = nRows.toFixed(0);

  g_node1.nodeValue = value1;
  g_node2.nodeValue = value2;
  g_node3.nodeValue = value3;

}

///////////////////////////////////////////////////////////////////////////////////////
//
//     g_setupHTML
//

function g_setupHTML(): void {

  const element1 : HTMLElement | null  = document.getElementById("var1");
  const element2 : HTMLElement | null  = document.getElementById("var2");
  const element3 : HTMLElement | null  = document.getElementById("var3");

  g_node1 = document.createTextNode("");
  g_node2 = document.createTextNode("");
  g_node3 = document.createTextNode("");

  if (element1 != null) {
    element1.appendChild(g_node1);
  }

  if (element2 != null) {
    element2.appendChild(g_node2);
  }

  if (element3 != null) {
    element3.appendChild(g_node3);
  }

}

///////////////////////////////////////////////////////////////////////////////////////
//
//     transferComplete
//

function transferComplete(evt:any): void {

    if (evt === 323) {
      Logger.log(1, "unused");
    }

    Logger.log(1, "The transfer is complete for loading# " + g_loading_state);

    g_json_raw[g_loading_state] = JSON.parse(g_xmlhttp.response);

    if (g_loading_state < 4) {
      g_loading_state++;
      loadData();
    } else {
      loadShaders();
    }
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     updateProgress
//

function updateProgress(oEvent:any): void {
  if (oEvent.lengthComputable) {

      let percentComplete : number = oEvent.loaded / oEvent.total;
      // console.log("loading... (" + (100.0 * percentComplete).toPrecision(2) + " %)");

  } else {
      // console.log("loading...");
  }
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     loadData
//

function loadData(): void {

    g_xmlhttp = new XMLHttpRequest();

    g_xmlhttp.addEventListener("load", transferComplete);
    g_xmlhttp.addEventListener("progress", updateProgress);

    const data_url : string = "data/data" + g_loading_state + ".json";

    g_xmlhttp.onreadystatechange = function (): void {
        // console.log("readyState = " + this.readyState + ", status = " + this.status);
    };

    g_xmlhttp.open("GET", data_url, true);
    g_xmlhttp.send();

}

///////////////////////////////////////////////////////////////////////////////////////
//
//     loadImage
//

function loadImage(): void {

  Logger.log(1, "Loading image...");

  g_text_image = new Image();
  g_text_image.src = "y2.jpg";
  g_text_image.onload = function (): void {
    Logger.log(1, "Image has been loaded (" + g_text_image.width + "," + g_text_image.height + ")");
    main2();
  };
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     main
//

function main(): void {
  const overlay : HTMLElement | null = document.getElementById("overlay");

  is_index1 = (overlay != null);

  loadImage();
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     main2
//

function main2(): void {
  loadData();
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     signal_loaded
//

function signal_loaded(): void {
  g_nCompleted++;

  if (g_nCompleted === 8) {
    Logger.log(1, "All loaded");
    main5();
  }
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     get_asynch
//

function get_asynch(url : string, index : number): void {

  const request : any = new XMLHttpRequest();
  request.open("GET", url, true);

  request.onload = function (): void {

    g_shader_source[index] = this.responseText;

    Logger.log(1, "Loaded OK: " + url);

    signal_loaded();
  };
  request.send(null);

}

///////////////////////////////////////////////////////////////////////////////////////
//
//     loadShaders()
//

function loadShaders(): void {

  get_asynch("shaders/rectangles.vert", 0);
  get_asynch("shaders/rectangles.frag", 1);

  get_asynch("shaders/text.vert", 2);
  get_asynch("shaders/text.frag", 3);

  get_asynch("shaders/radar.vert", 4);
  get_asynch("shaders/radar.frag", 5);

  get_asynch("shaders/detail.vert", 6);
  get_asynch("shaders/detail.frag", 7);
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     main5
//

function main5(): void {

  g_setupHTML();
  // get A WebGL context

  let canvas : HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("c");

  g_gl = canvas.getContext("webgl2");

  if (!g_gl) {
    return;
  }

  viewport = new ViewPort(g_gl, canvas, g_render);

  radar = new Radar(g_gl);

  text_renderer = new TextRenderer(g_gl);

  rectangles = new Rectangles(g_gl);

  detail = new Detail(g_gl);

  radar.setup(g_shader_source[4], g_shader_source[5]);

  detail.setup(g_shader_source[6], g_shader_source[7]);

  text_renderer.setup(g_text_image, g_shader_source[2], g_shader_source[3]);

  rectangles.setup(g_shader_source[0], g_shader_source[1], viewport.row_size, g_json_raw, g_nMaxChunk, viewport.WORLD_WIDTH);

  requestAnimationFrame(g_render);
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     g_render
//

function g_render(): void {

  g_renderHTML();


  viewport.resize();
  viewport.animate();

  // tell WebGL how to convert from clip space to pixels
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
    nFirstRow : number = viewport.get_row_min();

  const
    nLastRow: number = viewport.get_row_max();

  rectangles.render(y, viewport.y_scale, nFirstRow, nLastRow, g_isYearLines, x_factor);

  text_renderer.render();

  const
    nRows : number = rectangles.getNumberOfPersons();

  radar.render(nRows, nFirstRow, nLastRow);

  const
    mouse_y : number = viewport.getCurrentY();

  detail.render(nFirstRow, nLastRow);

}

main();
