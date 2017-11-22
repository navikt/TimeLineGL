

class Radar {

    program : number;
    posAttribLocation : number;

    buffer : number;

    f_data: Float32Array;

    vao : number;

    gl : any;

    constructor(gl : any) {

        this.gl = gl;
    }

    render(nRows : number, nFirstRow : number, nLastRow: number) : void {
        
        var
            showingRatio = (nLastRow - nFirstRow) / nRows;
    
        var
            showingSize = 1.8 * showingRatio;
    
        var
            nearTop = 0.9 - 1.8 * (nFirstRow / nRows); //  [ 0.5 .. 0]
    
        var
            yTop = nearTop;
    
        var
            yBottom = nearTop - showingSize;
    
    
        gl.bindBuffer(gl.ARRAY_BUFFER, radarBuffer);
    
        let f_data = this.f_data;
    
        f_data[13] = yBottom;
        f_data[15] = yBottom;
        f_data[21] = yBottom;
        
        f_data[17] = yTop;
        f_data[19] = yTop;
        f_data[23] = yTop;
    
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, f_data, 0, f_radar.length);
    
        gl.useProgram(program_radar);
        gl.bindVertexArray(vao_radar);
    
        gl.drawArrays(gl.TRIANGLES, 0, 12);
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     setup
    //

    setup(vertex_source : string, fragment_source : string) : void {
    
      const vertexShader : any = gl_utils.createShader(gl, gl.VERTEX_SHADER, vertex_source);
      const fragmentShader : any = gl_utils.createShader(gl, gl.FRAGMENT_SHADER, fragment_source);
    
      this.program = gl_utils.createProgram(gl, vertexShader, fragmentShader);
    
      this.posAttribLocation = gl.getAttribLocation(program_radar, "radar_position");
    
      this.buffer = gl.createBuffer();
    
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    
      const
        x0 : number = -0.99,
        y0 : number = -0.9,
        x1 : number = -0.98,
        y1 : number = 0.9,
    
        x0_ : number = -1.0,
        y0_ : number = 0.1,     // Low window
        x1_ : number = -0.97,
        y1_ : number = 0.2;     // High window
    
    
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
    
      gl.bufferData(gl.ARRAY_BUFFER, this.f_data, gl.DYNAMIC_DRAW);
    
      
      this.vao = gl.createVertexArray();
    
      gl.bindVertexArray(this.vao);
    
      gl.enableVertexAttribArray(this.posAttribLocation);
    
      const size : any = 2;          // 2 components per iteration
      const type : any = gl.FLOAT;   // the data is 32bit floats
      const normalize : any = false; // don't normalize the data
      const stride : any = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
      const offset : any = 0;        // start at the beginning of the buffer
      gl.vertexAttribPointer(this.posAttribLocation, size, type, normalize, stride, offset);
    
    }
    
}






