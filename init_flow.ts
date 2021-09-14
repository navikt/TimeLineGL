

let gl: WebGL2RenderingContext;
let g_canvas: HTMLCanvasElement;

const w: number = 100
const h: number = 100

let vao: WebGLVertexArrayObject;

let texture_new: any = null;
let texture: any = null;

let indexes: Float32Array = new Float32Array(w *h * 2);


let timeLocation: WebGLUniformLocation;

let current_time: number = 0;

for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
        var i = y * w * 2 + x * 2;
        indexes[i + 0] = x;
        indexes[i + 1] = y;
    }
}



function main(): void {

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


  texture_new = gl.createTexture();

  gl.activeTexture(gl.TEXTURE0 + 1);

  gl.bindTexture(gl.TEXTURE_2D, texture_new);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  
  // upload the image into the texture.
  const mipLevel_new = 0; // the largest mip
  const internalFormat_new = gl.RGBA16UI; // format we want in the texture
  const srcFormat_new = gl.RGBA_INTEGER; // format of data we are supplying
  const srcType_new = gl.UNSIGNED_SHORT; // type of data we are supplying

  gl.texImage2D(gl.TEXTURE_2D, mipLevel_new, internalFormat_new, w, h, 0, srcFormat_new, srcType_new, rgba16);

  





  // End new texture

  
  let rgP: Uint8Array = new Uint8Array(w * h * 2);
  
  for (i = 0; i < w * h * 2; i+=2) {
    rgP[i + 0] = Math.floor(256 * Math.random());
    rgP[i + 1] = Math.floor(256 * Math.random());
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
  const internalFormat = gl.RG8; // format we want in the texture
  const srcFormat = gl.RG; // format of data we are supplying
  const srcType = gl.UNSIGNED_BYTE; // type of data we are supplying

  gl.texImage2D(gl.TEXTURE_2D, mipLevel, internalFormat, w, h, 0, srcFormat, srcType, rgP);

  var buf = gl.createBuffer();
  
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  
  gl.bufferData(gl.ARRAY_BUFFER, indexes, gl.STATIC_DRAW);
    

  const hablaLoc = gl.getAttribLocation(program, 'habla');
  const textureLocation = gl.getUniformLocation(program, 'u_positions');

  const textureLocation_new = gl.getUniformLocation(program, 'u_positions_new');

  timeLocation = gl.getUniformLocation(program, 'f_time')!;


  // create a vertex array object (attribute state)
  vao = gl.createVertexArray()!;

  // and make it the one we're currently working with
  gl.bindVertexArray(vao);

  gl.enableVertexAttribArray(hablaLoc);
  
   

   // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
   var size = 2;          // 2 components per iteration
   var type = gl.FLOAT;   // the data is 32bit floats
   var normalize = false; // don't normalize the data
   var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
   var offset = 0;        // start at the beginning of the buffer
   
   gl.vertexAttribPointer(hablaLoc, size, type, normalize, stride, offset);


   // Tell the shader to use texture unit 0 for textureLocation
   gl.uniform1i(textureLocation, 0);


   // Tell the shader to use texture unit 1 for textureLocation_new
   gl.uniform1i(textureLocation_new, 1);

  requestAnimationFrame(g_render);

}


function get_synch(url: string): string|null {
  var req = new XMLHttpRequest();
  req.open("GET", url, false);
  req.send(null);
  return (req.status == 200) ? req.responseText : null;
};


function g_render(): void {

  const periodic_value: number = Math.sin(0.01 * current_time);

  gl.uniform1f(timeLocation, periodic_value);
  

  gl.activeTexture(gl.TEXTURE0 + 0);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.bindVertexArray(vao);

  gl.viewport(0, 0, g_canvas.width, g_canvas.height);
  gl.clearColor(0, 0, 0.5, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, w*h);

  current_time = current_time + 1.0;
  requestAnimationFrame(g_render);
}

main();


