

let gl: WebGL2RenderingContext;
let g_canvas: HTMLCanvasElement;

const w: number = 100
const h: number = 100

let vao: WebGLVertexArrayObject;

let texture: any = null;

let indexes: Float32Array = new Float32Array(w *h * 2);


let timeLocation: WebGLUniformLocation;

for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
        var i = y * w * 2 + x * 2;
        indexes[i + 0] = x;
        indexes[i + 1] = y;
    }
}


function test_pack(t0: number, d0: number, t1: number, d1: number) : number {

  Math.log2(12 * 7 * 24 * 6) < 14

  const t0_converted: number = Math.floor(Math.min(t0, 12.0 * 7) * 24 * 6);
  const t1_converted: number = Math.floor(Math.min(t1, 12.0 * 7) * 24 * 6);

  const d0_converted: number = d0 + 1;
  const d1_converted: number = d1 + 1;

  const packed_value: number = (t1_converted << (32 - 14)) | (t0_converted << (32 - 14 - 14)) | (d1_converted << 2) | d0_converted;

  return packed_value;

}


function test_unpack(v: number) {
  const mask_time_hi: number = 0b11111111111111000000000000000000;
  const mask_time_lo: number = 0b00000000000000111111111111110000;
  const mask_dir_hi: number =  0b00000000000000000000000000001100;
  const mask_dir_lo: number  = 0b00000000000000000000000000000011;

  const t1_converted: number = (v & mask_time_hi) >> (32 - 14);
  const t0_converted: number = (v & mask_time_lo) >> 4;
  const d1_converted: number = (v & mask_dir_hi) >> 2;
  const d0_converted: number = (v & mask_dir_lo);
  
  
  const t1: number = t1_converted / 6.0 / 24.0;
  const t0: number = t0_converted / 6.0 / 24.0;
  
  const d1: number = d1_converted - 1;
  const d0: number = d0_converted - 1;

  return {'t1': t1, 't0': t0, 'd1': d1, 'd0':d0};
}


function generate_random_gpu_dataset(N: number): Uint32Array {

  let data: Uint32Array = new Uint32Array(N);

  for(let i: number = 0; i < N; i++) {

    const t0: number = 50 * Math.random();
    const t1: number = 50 * Math.random();

    const d0: number = Math.floor(Math.random() * 3) - 1;
    const d1: number = Math.floor(Math.random() * 3) - 1;

    const v: number = test_pack(t0, d0, t1, d1);

    // const round_trip_data = test_unpack(v);
    // const t0_diff: number = t0 - round_trip_data['t0'];

    data[i] = v;
  }
  return data;
}


function main(): void {

  const data: Uint32Array = generate_random_gpu_dataset(100);

  g_canvas = <HTMLCanvasElement> document.getElementById("c");

  if (g_canvas.getContext("webgl2") == null) {
    return;
  }
  
  gl = g_canvas.getContext("webgl2")!;

  var width = g_canvas.clientWidth;
  var height = g_canvas.clientHeight;
  
  g_canvas.width = width;
  g_canvas.height = height;

  const vertex_source = get_synch("shaders/draw.vert")!;
  const vertexShader : number | null = GLUtils.createShader(gl, gl.VERTEX_SHADER, vertex_source);

  const fragment_source = get_synch("shaders/draw.frag")!;
  const fragmentShader : number | null = GLUtils.createShader(gl, gl.FRAGMENT_SHADER, fragment_source);

  let program = GLUtils.createProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(program);

  // Begin new texture
  let rgba16: Uint16Array = new Uint16Array(w * h * 4);

  for (i = 0; i < w * h * 4; i+=4) {
    rgba16[i + 0] = Math.floor(256 * 256 * Math.random());
    rgba16[i + 1] = Math.floor(256 * 256 * Math.random());
    rgba16[i + 2] = Math.floor(256 * 256 * Math.random());
    rgba16[i + 3] = Math.floor(256 * 256 * Math.random());
  }


  texture = gl.createTexture();

  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  
  // upload the image into the texture.
  const mipLevel = 0; // the largest mip
  const internalFormat = gl.RGBA16UI; // format we want in the texture
  const srcFormat = gl.RGBA_INTEGER; // format of data we are supplying
  const srcType = gl.UNSIGNED_SHORT; // type of data we are supplying

  gl.texImage2D(gl.TEXTURE_2D, mipLevel, internalFormat, w, h, 0, srcFormat, srcType, rgba16);

  // End new texture

  
  var buf = gl.createBuffer();
  
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  
  gl.bufferData(gl.ARRAY_BUFFER, indexes, gl.STATIC_DRAW);
    

  const coordLoc = gl.getAttribLocation(program, 'f_coord');

  const textureLocation_new = gl.getUniformLocation(program, 'u_positions');

  timeLocation = gl.getUniformLocation(program, 'f_cyclic_time')!;


  // create a vertex array object (attribute state)
  vao = gl.createVertexArray()!;

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  gl.enableVertexAttribArray(coordLoc);
  
   

   // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
   var size = 2;          // 2 components per iteration
   var type = gl.FLOAT;   // the data is 32bit floats
   var normalize = false; // don't normalize the data
   var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
   var offset = 0;        // start at the beginning of the buffer
   
   gl.vertexAttribPointer(coordLoc, size, type, normalize, stride, offset);


   
   // Tell the shader to use texture unit 0 for textureLocation_new
   gl.uniform1i(textureLocation_new, 0);

  requestAnimationFrame(g_render);

}


function get_synch(url: string): string|null {
  var req = new XMLHttpRequest();
  req.open("GET", url, false);
  req.send(null);
  return (req.status == 200) ? req.responseText : null;
};


function g_render(): void {

  let current_time: number = performance.now() / 1000.0;

  const periodic_value: number = Math.sin(1.0 * current_time);


  gl.uniform1f(timeLocation, periodic_value);
  

  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.bindVertexArray(vao);

  gl.viewport(0, 0, g_canvas.width, g_canvas.height);
  gl.clearColor(0, 0, 0.5, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, w*h);


  requestAnimationFrame(g_render);
}

main();


