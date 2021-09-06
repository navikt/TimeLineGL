

let g_shader_source : string[] = [];

let g_gl : any;

let g_text_image : HTMLImageElement;

let g_isYearLines : boolean = true;

let g_xmlhttp : XMLHttpRequest;
let g_loading_state : number = 0;
let g_json_raw : any[] = [];

let g_nCompleted : number = 0;

let g_configuration : Configuration;

let g_viewport : ViewPort;

let g_radar : Radar;

let g_detail : Detail;

let g_text_renderer : TextRenderer;
let g_rectangles : Rectangles;

let g_node1 : Text;
let g_node2 : Text;
let g_node3 : Text;

let time : number = 0;
let time_delta : number = 1;

let g_enable_detail_box: boolean = false;

let g_config_json: string = "";

let g_data_source : string = "data3";

///////////////////////////////////////////////////////////////////////////////////////
//
//     unused
//

function unused(x: number): void {
  if (x === 1231230) {
      x = 2123;
  }
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     g_renderHTML
//

function g_renderHTML(): void {

  time += time_delta;

  const nPersons : number = g_rectangles.getNumberOfPersons();

  const nRows : number = g_viewport.get_row_max() - g_viewport.get_row_min();

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
//     configComplete
//

function configComplete(evt:any): void {

  unused(evt);

  Logger.log(1, "The config load is complete");

  g_configuration = new Configuration(JSON.parse(g_xmlhttp.response));

  loadData();

}

///////////////////////////////////////////////////////////////////////////////////////
//
//     dataChunkComplete
//

function dataChunkComplete(evt:any): void {

    unused(evt);

    Logger.log(1, "The transfer is complete for loading# " + g_loading_state);

    g_json_raw[g_loading_state] = JSON.parse(g_xmlhttp.response);

    const nLoadChunks: number = g_configuration.GetNumberOfChunks();

    if (g_loading_state < (nLoadChunks -1)) {
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
//     loadConfig
//

function loadConfig(): void {
  g_xmlhttp = new XMLHttpRequest();

  g_xmlhttp.addEventListener("load", configComplete);

  const data_url : string = g_data_source + "/conf.json";

  g_xmlhttp.open("GET", data_url, true);
  g_xmlhttp.send();

}


///////////////////////////////////////////////////////////////////////////////////////
//
//     loadData
//

function loadData(): void {

    g_xmlhttp = new XMLHttpRequest();

    g_xmlhttp.addEventListener("load", dataChunkComplete);
    g_xmlhttp.addEventListener("progress", updateProgress);

    const basename : string = g_configuration.GetBaseName();

    const data_url : string = g_data_source + "/" + basename + g_loading_state + ".json";


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

  loadImage();
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     main2
//

function main2(): void {
  loadConfig();
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
  var width = canvas.clientWidth;
  var height = canvas.clientHeight;
  
  canvas.width = width;
  canvas.height = height;


  const startYear: number = 1995;
  const endYear: number = 2018;

  g_viewport = new ViewPort(g_gl, canvas, g_render, startYear, endYear);

  g_radar = new Radar(g_gl);

  g_text_renderer = new TextRenderer(g_gl, g_viewport);

  g_rectangles = new Rectangles(g_gl, g_configuration, g_viewport);

  g_detail = new Detail(g_gl);

  g_radar.setup(g_shader_source[4], g_shader_source[5]);

  g_detail.setup(g_shader_source[6], g_shader_source[7]);

  g_text_renderer.setup(g_text_image, g_shader_source[2], g_shader_source[3]);

  const max_chunk : number = g_configuration.GetNumberOfChunks();

  g_rectangles.setup(g_shader_source[0], g_shader_source[1], g_json_raw, max_chunk);

  requestAnimationFrame(g_render);
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     g_render
//

function g_render(now : number): void {

  const is_animate_viz_factor : boolean = false;

  if (is_animate_viz_factor) {

    const PERIOD: number = 5.0; // secs

    const now_sec: number = now/1000.0;

    const T: number = now_sec % PERIOD;

    const V: number = T/PERIOD;

    console.log("V = " + V);

    const sin_value1 : number = Math.sin(V * 2 * Math.PI);

    const sin_value2 : number = Math.sin(V * 2 * Math.PI + Math.PI);

    const out_value1 : number = (sin_value1 + 1) / 2.0;
    const out_value2 : number = (sin_value2 + 1) / 2.0;

    g_viewport.SetVizFactor1(out_value1);
    g_viewport.SetVizFactor2(out_value2);
  }

  g_renderHTML();


  g_viewport.resize();
  g_viewport.animate();

  // tell WebGL how to convert from clip space to pixels

  

  g_gl.viewport(0, 0, g_gl.canvas.width, g_gl.canvas.height);
  g_gl.clearColor(0, 0, 0, 0);
  g_gl.clear(g_gl.COLOR_BUFFER_BIT);
  g_gl.disable(g_gl.DEPTH_TEST);

  g_gl.enable(g_gl.BLEND);
  g_gl.blendFunc(g_gl.SRC_ALPHA, g_gl.ONE_MINUS_SRC_ALPHA);

  const
    x_factor : number = g_gl.canvas.width / g_viewport.WORLD_WIDTH
    ;

  const
    y : number = g_viewport.getOffsetY();

  const
    nFirstRow : number = g_viewport.get_row_min();

  const
    nLastRow: number = g_viewport.get_row_max();

  const
    rVizFactor_1: number = g_viewport.GetVizFactor1();

  const
    rVizFactor_2: number = g_viewport.GetVizFactor2();

  g_rectangles.render(y, g_viewport.y_scale, nFirstRow, nLastRow, g_isYearLines, x_factor, rVizFactor_1, rVizFactor_2);

  g_text_renderer.render();

  const
    nRows : number = g_rectangles.getNumberOfPersons();

  g_radar.render(nRows, nFirstRow, nLastRow);

  const
    mouse_y : number = g_viewport.getCurrentY();

  const
    nRowsDisplayed: number = (nLastRow - nFirstRow) > 1 ? (nLastRow - nFirstRow) : 1;

  if (g_enable_detail_box && nRowsDisplayed < 20 && nRowsDisplayed > 3) {
    g_detail.render(nFirstRow, nLastRow);
  }

  requestAnimationFrame(g_render);
}

main();
