
class Detail {
  program : number | undefined;
  posAttribLocation : number | undefined;

  buffer : number | undefined;
  f_data: Float32Array | undefined;
  vao : number | undefined;

  gl : any;

  constructor(gl : any) {
      this.gl = gl;
  }


  unused(x: number): void {
    if (x === 1231230) {
        x = 2123;
    }
  }



  ///////////////////////////////////////////////////////////////////////////////////////
  //
  //     render
  //

  render(nFirstRow : number, nLastRow: number): void {


    const nRows: number = (nLastRow - nFirstRow) > 1 ? (nLastRow - nFirstRow) : 1;

    const size_y: number = 1.0/ nRows;


    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);

    const
      x0 : number = -1,
      y0 : number = 0 + size_y * 0.9,
      x1 : number = 1,
      y1 : number = 0 - size_y * 0.9;

    const positions : number[] = [
      x0,  //  0
      y0,  //  1

      x1,  //  2
      y0,  //  3

      x1,  //  4
      y1,  //  5
      x0,  //  6
      y1,  //  7


    ];

    this.f_data = new Float32Array(positions);

    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.f_data, this.gl.DYNAMIC_DRAW);


    this.gl.useProgram(this.program);
    this.gl.bindVertexArray(this.vao);


    this.gl.drawArrays(this.gl.LINE_LOOP, 0, 4);
  }

  ///////////////////////////////////////////////////////////////////////////////////////
  //
  //     setup
  //

  setup(vertex_source : string, fragment_source : string): void {
    const vertexShader : any = GLUtils.createShader(this.gl, this.gl.VERTEX_SHADER, vertex_source);
    const fragmentShader : any = GLUtils.createShader(this.gl, this.gl.FRAGMENT_SHADER, fragment_source);

    this.program = GLUtils.createProgram(this.gl, vertexShader, fragmentShader);

    this.posAttribLocation = this.gl.getAttribLocation(this.program, "detail_position");

    this.buffer = this.gl.createBuffer();

    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);

    const
      x0 : number = -1,
      y0 : number = -0.47,
      x1 : number = 1,
      y1 : number = -0.48;

    const positions : number[] = [
      x0,  //  0
      y0,  //  1
      x1,  //  2
      y0,  //  3
      x0,  //  4
      y1,  //  5
      x0,  //  6
      y1,  //  7
      x1,  //  8
      y0,  //  9
      x1,  // 10
      y1  // 11

    ];

    this.f_data = new Float32Array(positions);

    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.f_data, this.gl.DYNAMIC_DRAW);

    this.vao = this.gl.createVertexArray();

    this.gl.bindVertexArray(this.vao);

    this.gl.enableVertexAttribArray(this.posAttribLocation);

    const size : any = 2;          // 2 components per iteration
    const type : any = this.gl.FLOAT;   // the data is 32bit floats
    const normalize : any = false; // don't normalize the data
    const stride : any = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset : any = 0;        // start at the beginning of the buffer
    this.gl.vertexAttribPointer(this.posAttribLocation, size, type, normalize, stride, offset);

  }

}







class Radar {

    program : number | undefined;
    posAttribLocation : number | undefined;

    buffer : number | undefined;

    f_data: Float32Array | undefined;

    vao : number | undefined;

    gl : any;

    constructor(gl : any) {
        this.gl = gl;
    }


    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     render
    //

    render(nRows : number, nFirstRow : number, nLastRow: number): void {

      const
        showingRatio: number = (nLastRow - nFirstRow) / nRows;

      const
        showingSize: number = 1.8 * showingRatio;

      const
        nearTop: number = 0.9 - 1.8 * (nFirstRow / nRows); //  [ 0.5 .. 0]

      const
        yTop: number = nearTop;

      const
        yBottom: number = nearTop - showingSize;


      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);

      if (this.f_data) {

        const f_data : Float32Array = this.f_data;

        f_data[13] = yBottom;
        f_data[15] = yBottom;
        f_data[21] = yBottom;

        f_data[17] = yTop;
        f_data[19] = yTop;
        f_data[23] = yTop;
      

        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, f_data, 0, this.f_data.length);

        this.gl.useProgram(this.program);
        this.gl.bindVertexArray(this.vao);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 12);
      }
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     setup
    //

    setup(vertex_source : string, fragment_source : string): void {

      const vertexShader : any = GLUtils.createShader(this.gl, this.gl.VERTEX_SHADER, vertex_source);
      const fragmentShader : any = GLUtils.createShader(this.gl, this.gl.FRAGMENT_SHADER, fragment_source);

      this.program = GLUtils.createProgram(this.gl, vertexShader, fragmentShader);

      this.posAttribLocation = this.gl.getAttribLocation(this.program, "radar_position");

      this.buffer = this.gl.createBuffer();

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);

      const
        x0 : number = -0.99,
        y0 : number = -0.9,
        x1 : number = -0.98,
        y1 : number = 0.9,

        x0_ : number = -1.0,
        y0_ : number = 0.1,     // low window
        x1_ : number = -0.97,
        y1_ : number = 0.2;     // high window


      const positions : number[] = [
        x0,  //  0
        y0,  //  1
        x1,  //  2
        y0,  //  3
        x0,  //  4
        y1,  //  5
        x0,  //  6
        y1,  //  7
        x1,  //  8
        y0,  //  9
        x1,  // 10
        y1,  // 11

        x0_, // 12
        y0_, // 13   low window
        x1_, // 14
        y0_, // 15   low window
        x0_, // 16
        y1_, // 17   High window
        x0_, // 18
        y1_, // 19    High window
        x1_, // 20
        y0_, // 21    low window
        x1_, // 22
        y1_, // 23    High window

      ];

      this.f_data = new Float32Array(positions);

      this.gl.bufferData(this.gl.ARRAY_BUFFER, this.f_data, this.gl.DYNAMIC_DRAW);

      this.vao = this.gl.createVertexArray();

      this.gl.bindVertexArray(this.vao);

      this.gl.enableVertexAttribArray(this.posAttribLocation);

      const size : any = 2;          // 2 components per iteration
      const type : any = this.gl.FLOAT;   // the data is 32bit floats
      const normalize : any = false; // don't normalize the data
      const stride : any = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
      const offset : any = 0;        // start at the beginning of the buffer
      this.gl.vertexAttribPointer(this.posAttribLocation, size, type, normalize, stride, offset);

    }

}






