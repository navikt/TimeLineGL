

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

    constructor(gl : any) {
        this.gl = gl;
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     render
    //

    render() : void {
        
        this.gl.useProgram(this.program);
        this.gl.bindVertexArray(this.vao);
    
        const x : number = this.gl.canvas.width;
        const y : number = this.gl.canvas.height;
    
        const resolution_x : number = 1600.0; //  * (x / 1600);
        const resolution_y : number = 1024.0; //  * (y / 1600);
    
        this.gl.uniform2f(this.resolutionUniformLocation, resolution_x, resolution_y);
    
        this.gl.uniform1i(this.textureLocation, 0);
    
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.nRectangleCount * 6);  // 6 vertices for one rectangle.
    }
    
    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     setup
    //

    setup(image : HTMLImageElement, vertex_source : string, fragment_source : string)
    {
      this.image = image;
      
      const vertexShader : any = gl_utils.createShader(this.gl, this.gl.VERTEX_SHADER, vertex_source);
      const fragmentShader : any = gl_utils.createShader(this.gl, this.gl.FRAGMENT_SHADER, fragment_source);
    
      this.program = gl_utils.createProgram(this.gl, vertexShader, fragmentShader);
    
      this.posAttributeLocation =this.gl.getAttribLocation(this.program, "quad_position");
      this.textureAttributeLocation = this.gl.getAttribLocation(this.program, "quad_texcoord");
    
      this.textureLocation = this.gl.getUniformLocation(this.program, "u_texture");
    
      this.resolutionUniformLocation = this.gl.getUniformLocation(this.program, "u_resolution");
    
      this.posBuffer = this.gl.createBuffer();
    
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.posBuffer);
    
      const
        image_w : number = this.image.width,
        image_h : number = this.image.height;
    
      this.nRectangleCount = 1* 22;
          
      let f : Float32Array = new Float32Array(this.nRectangleCount * 12);
      let g : Float32Array = new Float32Array(this.nRectangleCount * 12);
    
      let fOffset : number = 0;
      let gOffset : number = 0;
    
      let
        iPart : number = 1;    // Skip first (1995)
    
      const
        imageParts : number = 24;
    
    
      for (let iYear : number = 1996; iYear < 2018; iYear++) {
    
        const
          time : number = (iYear - 1970.35) * 365.242199;
    
        const
          u_min : number = 0.0,
          u_max : number = 1.0,
          v_min : number = iPart / imageParts,
          v_max : number = (iPart + 1) / imageParts;
    
        const
          x0 : number = get_x_from_time(1600, time),
          y0 : number = 100,
          x1 : number = x0 + image_w,
          y1 : number = y0 + image_h / imageParts;
    
        gOffset = addTextTextureCoords(g, gOffset, u_min, v_min, u_max, v_max);
        fOffset = addTextTriangles(f, fOffset, x0, y0, x1, y1);
    
    /*
        x0 = get_x_from_time(1600, time),
        y0 = 1000,
        x1 = x0 + image_w,
        y1 = y0 + image_h / imageParts;
    
        gOffset = addTextTextureCoords(g, gOffset, u_min, v_min, u_max, v_max);
        fOffset = addTextTriangles(f, fOffset, x0, y0, x1, y1);
    */
        iPart++;
      }
    
      this.gl.bufferData(this.gl.ARRAY_BUFFER, f, this.gl.STATIC_DRAW);
    
      this.vao = this.gl.createVertexArray();
      this.gl.bindVertexArray(this.vao);
    
      this.gl.enableVertexAttribArray(this.posAttributeLocation);
    
      {
        const size : any = 2;          // 2 components per iteration
        const type : any = this.gl.FLOAT;   // the data is 32bit floats
        const normalize : any = false; // don't normalize the data
        const stride : any = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset : any = 0;        // start at the beginning of the buffer
    
        this.gl.vertexAttribPointer(this.posAttributeLocation, size, type, normalize, stride, offset);
      }
      
      this.texturePosBuffer = this.gl.createBuffer();
    
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texturePosBuffer);
    
      this.gl.bufferData(this.gl.ARRAY_BUFFER, g, this.gl.STATIC_DRAW);
    
      this.gl.enableVertexAttribArray(this.textureAttributeLocation);
    
      {
        const size : any = 2;          // 2 components per iteration
        const type : any = this.gl.FLOAT;   // the data is 32bit floats
        const normalize : any = false; // don't normalize the data
        const stride : any = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset : any = 0;        // start at the beginning of the buffer
        this.gl.vertexAttribPointer(this.textureAttributeLocation, size, type, normalize, stride, offset);
      }
    
      // Create a texture.
      const texture : any = this.gl.createTexture();
    
      // make unit 0 the active texture uint
      // (ie, the unit all other texture commands will affect
      this.gl.activeTexture(this.gl.TEXTURE0 + 0);
    
      // Bind it to texture unit 0' 2D bind point
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    
      // Set the parameters so we don't need mips and so we're not filtering
      // and we don't repeat
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);
    
      // Upload the image into the texture.
      const mipLevel : any = 0;               // the largest mip
      const internalFormat : any = this.gl.RGBA;   // format we want in the texture
      const srcFormat : any = this.gl.RGBA;        // format of data we are supplying
      const srcType : any = this.gl.UNSIGNED_BYTE  // type of data we are supplying

      this.gl.texImage2D(this.gl.TEXTURE_2D,
        mipLevel,
        internalFormat,
        srcFormat,
        srcType,
        this.image);
       
    
    }

    
}






