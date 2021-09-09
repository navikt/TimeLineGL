

let gl: WebGL2RenderingContext;
let g_canvas: HTMLCanvasElement;

const w: number = 100
const h: number = 100

let vao: WebGLVertexArrayObject;

let texture: any = null;

let indexes: Float32Array = new Float32Array(w *h * 2);

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
  
  let rgP: Uint8Array = new Uint8Array(w * h * 2);
  
  for (i = 0; i < w * h * 2; i+=2) {
    rgP[i + 0] = Math.floor(255 * Math.random());
    rgP[i + 1] = Math.floor(255 * Math.random());
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


  requestAnimationFrame(g_render);

}


function get_synch(url: string): string|null {
  var req = new XMLHttpRequest();
  req.open("GET", url, false);
  req.send(null);
  return (req.status == 200) ? req.responseText : null;
};


function g_render(): void {
  
  const iActiveTexture: number = gl.getParameter(gl.ACTIVE_TEXTURE);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  const is0: Boolean = (gl.TEXTURE0 == iActiveTexture);

  gl.bindVertexArray(vao);

  gl.viewport(0, 0, g_canvas.width, g_canvas.height);
  gl.clearColor(0, 0, 0.5, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.POINTS, 0, w*h);
}

main();


