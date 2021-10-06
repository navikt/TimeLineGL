

let gl: WebGL2RenderingContext;
let g_canvas: HTMLCanvasElement;

let textures: WebGLTexture[] = [];


/* Data for cases rendering begin*/

let vao_cases: WebGLVertexArrayObject;

let indexBuffer_cases: WebGLBuffer;

let buf2_cases: WebGLBuffer;

let timeLocation: WebGLUniformLocation;

let canvasSizeLocation: WebGLUniformLocation;

let diffuse: WebGLUniformLocation;
let diffuse2: WebGLUniformLocation;

let cases_program: number;

const num_cases: number = 50000;

/* Data for cases rendering end*/

///////////////////////////////////////////////////////////////////////////
//
//    updateBit
//

function test_pack(t0: number, d0: number, t1: number, d1: number) : number {

  Math.log2(12 * 7 * 24 * 6) < 14

  const t0_converted: number = Math.floor(Math.min(t0, 12.0 * 7) * 24 * 6);
  const t1_converted: number = Math.floor(Math.min(t1, 12.0 * 7) * 24 * 6);

  const d0_converted: number = d0 + 1;
  const d1_converted: number = d1 + 1;

  const packed_value: number = (t1_converted << (32 - 14)) | (t0_converted << (32 - 14 - 14)) | (d1_converted << 2) | d0_converted;

  return packed_value;
}

///////////////////////////////////////////////////////////////////////////
//
//    updateBit
//

function updateBit(number: number, bitPosition: number, bitValue: number) {
  const bitValueNormalized = bitValue ? 1 : 0;
  const clearMask = ~(1 << bitPosition);
  return (number & clearMask) | (bitValueNormalized << bitPosition);
}

///////////////////////////////////////////////////////////////////////////
//
//    generate_random_gpu_dataset
//

function generate_random_gpu_dataset(N: number): Uint32Array {

  let data: Uint32Array = new Uint32Array(N*2*8);

  for(let i: number = 0; i < N; i+= 16) {

    const t0: number = 50 * Math.random();
    const t1: number = 50 * Math.random();

    const d0: number = Math.floor(Math.random() * 3) - 1;
    const d1: number = Math.floor(Math.random() * 3) - 1;

    const v0: number = test_pack(t0, d0, t1, d1);
    let v1: number = Math.floor(Math.random() * (2**32));

    for(let j: number = 0; j < 8; j++) {
      data[i + 2 *j] = v0;

      v1 = updateBit(v1, 12, j%2);
      v1 = updateBit(v1, 13, Math.floor(j/2) & 1);
      v1 = updateBit(v1, 14, Math.floor(j/4));
      
      data[i + 2 *j + 1] = v1;
    }

  }
  return data;
}

///////////////////////////////////////////////////////////////////////////
//
//    loadImage
//

function loadImage(url: string, callback:any) {
  var image = new Image();
  image.src = url;
  image.onload = callback;
  return image;
}

///////////////////////////////////////////////////////////////////////////
//
//    loadImages
//

function loadImages(urls: string[], callback: any) {
  
  let images: HTMLImageElement[] = [];
  var imagesToLoad = urls.length;
 
  // Called each time an image finished loading.
  var onImageLoad = function() {
    --imagesToLoad;
    // If all the images are loaded call the callback.
    if (imagesToLoad == 0) {
      callback(images);
    }
  };
 
  for (var ii = 0; ii < imagesToLoad; ++ii) {
    var image = loadImage(urls[ii], onImageLoad);
    images.push(image);
  }
}

///////////////////////////////////////////////////////////////////////////
//
//    main
//

function main(): void {
  loadImages(["textures/texture_out.jpg", "textures/num_vertical.png"], prepare);
}

///////////////////////////////////////////////////////////////////////////
//
//    prepare_cases
//

function prepare_cases() : void {

  const data_final: Uint32Array = generate_random_gpu_dataset(num_cases);

  const vertex_source = get_synch("shaders/draw.vert")!;
  const vertexShader : number | null = GLUtils.createShader(gl, gl.VERTEX_SHADER, vertex_source);

  const fragment_source = get_synch("shaders/draw.frag")!;
  const fragmentShader : number | null = GLUtils.createShader(gl, gl.FRAGMENT_SHADER, fragment_source);

  cases_program = GLUtils.createProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(cases_program);

  timeLocation = gl.getUniformLocation(cases_program, 'd_current_time')!;

  canvasSizeLocation =  gl.getUniformLocation(cases_program, 'canvas_size')!;

  diffuse = gl.getUniformLocation(cases_program, "diffuse")!;
  diffuse2 = gl.getUniformLocation(cases_program, "diffuse2")!;

  const data_final_loc = gl.getAttribLocation(cases_program, 'data_final');

  buf2_cases = gl.createBuffer()!;
  
  gl.bindBuffer(gl.ARRAY_BUFFER, buf2_cases);
  
  gl.bufferData(gl.ARRAY_BUFFER, data_final, gl.STATIC_DRAW);
    
    
  // create a vertex array object (attribute state)
  vao_cases = gl.createVertexArray()!;

  // and make it the one we're currently working with
  gl.bindVertexArray(vao_cases);

  gl.enableVertexAttribArray(data_final_loc);
     
   // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
   var size = 2;          // 1 component per iteration
   var type = gl.UNSIGNED_INT;   // the data is 32bit unsigned int
   var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
   var offset = 0;        // start at the beginning of the buffer
   
  gl.vertexAttribIPointer(data_final_loc, size, type, stride, offset);


  // Create index buffer

  indexBuffer_cases = gl.createBuffer()!;
 
  // make this buffer the current 'ELEMENT_ARRAY_BUFFER'
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_cases);
 
  // Fill the current element array buffer with data

  let i_data: Uint16Array = new Uint16Array(num_cases * 12);

  for (let iCase = 0; iCase < num_cases; iCase++) {
    const i: number = iCase * 12

    i_data[i + 0] = 8 * iCase;
    i_data[i + 1] = 8 * iCase + 2;
    i_data[i + 2] = 8 * iCase + 1;

    i_data[i + 3] = 8 * iCase + 2;
    i_data[i + 4] = 8 * iCase + 1;
    i_data[i + 5] = 8 * iCase + 3;

    i_data[i + 6] = 8 * iCase + 4;
    i_data[i + 7] = 8 * iCase + 2 + 4;
    i_data[i + 8] = 8 * iCase + 1 + 4;

    i_data[i + 9] = 8 * iCase + 2 + 4;
    i_data[i + 10] = 8 * iCase + 1 + 4;
    i_data[i + 11] = 8 * iCase + 3 + 4;

  }

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, i_data, gl.STATIC_DRAW);
}

///////////////////////////////////////////////////////////////////////////
//
//    prepare
//

function prepare(images: HTMLImageElement[]) {

  g_canvas = <HTMLCanvasElement> document.getElementById("c");

  if (g_canvas.getContext("webgl2") == null) {
    return;
  }
  
  gl = g_canvas.getContext("webgl2")!;
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  var width = g_canvas.clientWidth;
  var height = g_canvas.clientHeight;
  
  g_canvas.width = width;
  g_canvas.height = height;

  // create 2 textures
  for (var ii = 0; ii < 2; ++ii) {
    
    let texture:WebGLTexture = gl.createTexture()!;
    
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[ii]);

    // add the texture to the array of textures.
    textures.push(texture);
  }

  prepare_cases();

  requestAnimationFrame(g_render);

}

///////////////////////////////////////////////////////////////////////////
//
//    get_synch
//

function get_synch(url: string): string|null {
  var req = new XMLHttpRequest();
  req.open("GET", url, false);
  req.send(null);
  return (req.status == 200) ? req.responseText : null;
};

///////////////////////////////////////////////////////////////////////////
//
//    draw_cases
//

function draw_cases(): void {
  let current_time: number = performance.now() / 500.0;

  gl.useProgram(cases_program);

  gl.uniform1f(timeLocation, current_time);
  gl.uniform2ui(canvasSizeLocation, g_canvas.width, g_canvas.height);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, textures[0]);
  gl.uniform1i(diffuse, 0);

  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, textures[1]);
  gl.uniform1i(diffuse2, 1); // Bind our texture to the texture slot 0
 
  gl.bindVertexArray(vao_cases);

  gl.bindBuffer(gl.ARRAY_BUFFER, buf2_cases);

  // bind the buffer containing the indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_cases);

  gl.drawElements(gl.TRIANGLES, 12 * num_cases, gl.UNSIGNED_SHORT, 0);
}

///////////////////////////////////////////////////////////////////////////
//
//    g_render
//

function g_render(): void {

  gl.viewport(0, 0, g_canvas.width, g_canvas.height);
  gl.clearColor(0, 0, 0.5, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  draw_cases();

  requestAnimationFrame(g_render);
}

main();
