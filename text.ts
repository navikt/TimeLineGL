

class Defines {

  static DEF_WIDTH:  number = 1600;
  static DEF_HEIGHT: number = 1024;
}


class TextRenderer {

  program : number;

  posAttributeLocation : number;
  textureAttributeLocation : number;
  textureLocation : number;

  resolutionUniformLocation : number;
  posBuffer : number;
  texturePosBuffer : number;

  vao : number;
  image : HTMLImageElement;
  gl : any;

  nRectangleCount : number;

  viewport : ViewPort;

  constructor(gl : any, viewport : ViewPort) {
      this.gl = gl;
      this.viewport = viewport;
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  //
  //     render
  //

  render(): void {

      this.gl.useProgram(this.program);
      this.gl.bindVertexArray(this.vao);

      this.build_pos_buffer();

      const resolution_x : number = 1.0 * Defines.DEF_WIDTH;
      const resolution_y : number = 1.0 * Defines.DEF_HEIGHT;

      this.gl.uniform2f(this.resolutionUniformLocation, resolution_x, resolution_y);

      this.gl.uniform1i(this.textureLocation, 0);

      this.gl.drawArrays(this.gl.TRIANGLES, 0, this.nRectangleCount * 6);  // 6 vertices for one rectangle.
  }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     addTextTriangles
    //

  addTextTriangles(f : Float32Array, offset : number, x0 : number, y0 : number, x1 : number, y1 : number): number {
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

  addTextTextureCoords(g : Float32Array, offset : number, u_min : number, v_min : number, u_max : number, v_max : number): number {

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
  //     build_vertices
  //

  build_vertices(acVertex: Float32Array, size_x: number, size_y: number, y: number): number {

    let nVertexOffset : number = 0;

    for (let iYear : number = 1996; iYear < 2018; iYear++) {

      const
        time : number = (iYear - 1970.35) * 365.242199;

      // !

      const
        x0 : number = GLUtils.static_get_x_from_time(this.viewport.start_year, this.viewport.end_year, Defines.DEF_WIDTH, time),
        y0 : number = y,
        x1 : number = x0 + size_x,
        y1 : number = y0 + size_y;

      nVertexOffset = this.addTextTriangles(acVertex, nVertexOffset, x0, y0, x1, y1);
    }

    return nVertexOffset;
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  //
  //     build_pos_buffer
  //

  build_pos_buffer(): void {

    const canvas_w : number = this.gl.canvas.width;
    const canvas_h : number = this.gl.canvas.height;

    const
      image_w : number = this.image.width,
      image_h : number = this.image.height;

    const
      nImageParts : number = 24;

    const
      nRowMin : number = 40,
      nRowMax : number = 110;

    // const
      // nRowRandom : number = Math.random() * (nRowMax - nRowMin) + nRowMin;

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.posBuffer);

    const acVertex : Float32Array = new Float32Array(this.nRectangleCount * 12);

    const
      image_width_in_pixels : number = image_w,
      image_height_in_pixels : number = image_h / nImageParts;

    const
      x_fac : number = Defines.DEF_WIDTH * image_width_in_pixels / canvas_w,
      y_fac : number = Defines.DEF_HEIGHT * image_height_in_pixels / canvas_h;

    const nVertexOffset : number = this.build_vertices(acVertex, x_fac, y_fac, nRowMin);

    if (nVertexOffset !== this.nRectangleCount * 12) {
      throw new Error("Error building vertices");
    }

    this.gl.bufferData(this.gl.ARRAY_BUFFER, acVertex, this.gl.DYNAMIC_DRAW);
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  //
  //     setup
  //

  setup(image : HTMLImageElement, vertex_source : string, fragment_source : string): void {
    this.image = image;

    const vertexShader : any = GLUtils.createShader(this.gl, this.gl.VERTEX_SHADER, vertex_source);
    const fragmentShader : any = GLUtils.createShader(this.gl, this.gl.FRAGMENT_SHADER, fragment_source);

    this.program = GLUtils.createProgram(this.gl, vertexShader, fragmentShader);

    this.posAttributeLocation = this.gl.getAttribLocation(this.program, "quad_position");
    this.textureAttributeLocation = this.gl.getAttribLocation(this.program, "quad_texcoord");

    this.textureLocation = this.gl.getUniformLocation(this.program, "u_texture");

    this.resolutionUniformLocation = this.gl.getUniformLocation(this.program, "u_resolution");

    const
      image_w : number = this.image.width,
      image_h : number = this.image.height;

    this.nRectangleCount = 1* 22;

    const
      nImageParts : number = 24;

    this.posBuffer = this.gl.createBuffer();

    this.build_pos_buffer();

    this.vao = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.vao);

    this.gl.enableVertexAttribArray(this.posAttributeLocation);

    {
      const size : any = 2;               // 2 components per iteration
      const type : any = this.gl.FLOAT;   // the data is 32bit floats
      const normalize : any = false;      // don't normalize the data
      const stride : any = 0;             // 0 = move forward size * sizeof(type) each iteration to get the next position
      const offset : any = 0;             // start at the beginning of the buffer

      this.gl.vertexAttribPointer(this.posAttributeLocation, size, type, normalize, stride, offset);
    }

    this.texturePosBuffer = this.gl.createBuffer();

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texturePosBuffer);

    {

      let acTexture : Float32Array = new Float32Array(this.nRectangleCount * 12);
      let nTextureOffset : number = 0;

      for (let iYear : number = 1996; iYear < 2018; iYear++) {

        const
          iImagePart : number = 1 + (iYear - 1996);  // skip first (1995)

        const
          u_min : number = 0.0,
          u_max : number = 1.0,
          v_min : number = (iImagePart + 0) / nImageParts,
          v_max : number = (iImagePart + 1) / nImageParts;

        nTextureOffset = this.addTextTextureCoords(acTexture, nTextureOffset, u_min, v_min, u_max, v_max);
      }

      if (nTextureOffset !== this.nRectangleCount * 12) {
        throw new Error("Error building texture coordinates");
      }

      this.gl.bufferData(this.gl.ARRAY_BUFFER, acTexture, this.gl.STATIC_DRAW);
    }

    this.gl.enableVertexAttribArray(this.textureAttributeLocation);

    {
      const size : any = 2;          // 2 components per iteration
      const type : any = this.gl.FLOAT;   // the data is 32bit floats
      const normalize : any = false; // don't normalize the data
      const stride : any = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
      const offset : any = 0;        // start at the beginning of the buffer
      this.gl.vertexAttribPointer(this.textureAttributeLocation, size, type, normalize, stride, offset);
    }

    // create a texture.
    const texture : any = this.gl.createTexture();

    // make unit 0 the active texture uint
    // (ie, the unit all other texture commands will affect
    this.gl.activeTexture(this.gl.TEXTURE0 + 0);

    // bind it to texture unit 0' 2D bind point
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

    // set the parameters so we don't need mips and so we're not filtering
    // and we don't repeat

    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
    this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);


    // upload the image into the texture.
    const mipLevel : any = 0;                    // the largest mip
    const internalFormat : any = this.gl.RGBA;   // format we want in the texture
    const srcFormat : any = this.gl.RGBA;        // format of data we are supplying
    const srcType : any = this.gl.UNSIGNED_BYTE; // type of data we are supplying

    this.gl.texImage2D(this.gl.TEXTURE_2D, mipLevel, internalFormat, srcFormat, srcType, this.image);
  }
}








