

let gl: WebGL2RenderingContext;
let g_canvas: HTMLCanvasElement;

let vao_final: WebGLVertexArrayObject;

let timeLocation: WebGLUniformLocation;

const num_cases: number = 50000;


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
  // FFFC 0000 

  const mask_time_lo: number = 0b00000000000000111111111111110000;
  // 0003 FFF0

  const mask_dir_hi: number =  0b00000000000000000000000000001100;
  // 0000 000C 

  const mask_dir_lo: number  = 0b00000000000000000000000000000011;
  // 0000 0003



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

  let data: Uint32Array = new Uint32Array(N*2);

  for(let i: number = 0; i < N; i+= 2) {

    const t0: number = 50 * Math.random();
    const t1: number = 50 * Math.random();

    const d0: number = Math.floor(Math.random() * 3) - 1;
    const d1: number = Math.floor(Math.random() * 3) - 1;

    const v0: number = test_pack(t0, d0, t1, d1);

    // const round_trip_data = test_unpack(v);
    // const t0_diff: number = t0 - round_trip_data['t0'];

    data[i+0] = v0;
    data[i+1] = Math.floor(Math.random() * (2**32));

  }
  return data;
}


function main(): void {

  const data_final: Uint32Array = generate_random_gpu_dataset(num_cases);

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


  timeLocation = gl.getUniformLocation(program, 'd_current_time')!;
  

   const data_final_loc = gl.getAttribLocation(program, 'data_final');

   var buf2 = gl.createBuffer();
  
  gl.bindBuffer(gl.ARRAY_BUFFER, buf2);
  
  gl.bufferData(gl.ARRAY_BUFFER, data_final, gl.STATIC_DRAW);
    
    
  // create a vertex array object (attribute state)
  vao_final = gl.createVertexArray()!;

  // and make it the one we're currently working with
  gl.bindVertexArray(vao_final);

  gl.enableVertexAttribArray(data_final_loc);
  
   
   // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
   var size = 2;          // 1 component per iteration
   var type = gl.UNSIGNED_INT;   // the data is 32bit unsigned int
   // var normalize = false; // don't normalize the data
   var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
   var offset = 0;        // start at the beginning of the buffer
   
   gl.vertexAttribIPointer(data_final_loc, size, type, stride, offset);
   

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

  gl.uniform1f(timeLocation, current_time);
  
  gl.bindVertexArray(vao_final);

  gl.viewport(0, 0, g_canvas.width, g_canvas.height);
  gl.clearColor(0, 0, 0.5, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, num_cases);

  requestAnimationFrame(g_render);
}

main();


