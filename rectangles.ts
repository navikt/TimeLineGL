

class Rectangles {

    gl : any;

    program : any;
    positionAttributeLocation : number;
    resolutionUniformLocation : number;
    contentsizeUniformLocation : number;
    offsetLocation : number;
    y_scaleLocation : number;
    
    buffer : number;
    vao : number;
    
    rectangle_thickness : number = 7;
    bar_thickness : number = 14;
    nRectangleCount : number = 0;

    row_size : number;

    person_offset : Int32Array;


    nMaxChunk : number;
    json_raw : any[] = [];


    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     constructor
    //
    
    constructor(gl : any) {

        this.gl = gl;
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     write_rectangle
    //

    write_rectangle(f : Float32Array, iOffset : number, x1 : number, y1 : number, x2 : number, y2 : number, color : number) : void
    {

    f[iOffset + 0] = x1;
    f[iOffset + 1] = y1;
    f[iOffset + 2] = color;

    f[iOffset + 3] = x2;
    f[iOffset + 4] = y1;
    f[iOffset + 5] = color;

    f[iOffset + 6] = x1;
    f[iOffset + 7] = y2;
    f[iOffset + 8] = color;

    f[iOffset + 9] = x1;
    f[iOffset + 10] = y2;
    f[iOffset + 11] = color;

    f[iOffset + 12] = x2;
    f[iOffset + 13] = y1;
    f[iOffset + 14] = color;

    f[iOffset + 15] = x2;
    f[iOffset + 16] = y2;
    f[iOffset + 17] = color;
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     build_interval_rectangle
    //

    build_bar_rectangle(f : Float32Array, iOffset : number, begin : number, end : number, color : number, w : number) : void
    {
    var x1 = get_x_from_time(w, begin);
    var x2 = get_x_from_time(w, end);

    var y1 = 0 * this.row_size;
    var y2 = 5000 * this.row_size;

    this.write_rectangle(f, iOffset, x1, y1, x2, y2, color);
    }
    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     build_interval_rectangle
    //

    build_interval_rectangle(f : Float32Array, iOffset : number, id : number, begin : number, end : number, color : number, w: number) : void
    {
        var x1 = get_x_from_time(w, begin);
        var x2 = get_x_from_time(w, end);


        var y1 = id * this.row_size;
        var y2 = y1 + this.rectangle_thickness;

        this.write_rectangle(f, iOffset, x1, y1, x2, y2, color);
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     buildGLFromData
    //

    buildGLFromData(world_width : number) : void
    {
    
      const
        nPrimitives : number = this.getNumberOfRectangles();
    
      const    
        nVertexPerRectangle : number = 6;
    
      const    
        nElementsPerVertex : number = 3;
    
      const
        nElementsPerRectangle : number = nVertexPerRectangle * nElementsPerVertex;
    
      let cpu_data : Float32Array = new Float32Array(nPrimitives * nElementsPerRectangle);
    
      this.person_offset = new Int32Array(getNumberOfPersons());
    
      let
        iOffset : number = 0;
    
      // Year bars
     
      for (let iYear : number = 1996; iYear < 2018; iYear++) {
    
        const time : number = (iYear - 1970) * 365.242199;
    
        let
          colorXXX : number = 0.0;
    
        if (iYear == 2002 || iYear == 2005 || iYear == 2015)
        {
          colorXXX = 0.99;
        }
        else
        {
          colorXXX = 0.4;
        }
    
        this.build_bar_rectangle(cpu_data, iOffset, time, time + this.bar_thickness, colorXXX, world_width);
    
        iOffset += nElementsPerRectangle;
    
      }
    
    
      // Intervals
    
      for (let iChunk : number = 0; iChunk < this.nMaxChunk; iChunk++) {
    
        let
          i : any = this.json_raw[iChunk];
    
        console.log("Elements found : " + i.length);
    
        for (let iPerson : number = 0; iPerson < i.length; iPerson++) {
    
          const q : any = i[iPerson];
          const id : number = q.id;
          const events : any = q.E;
          const nEvents : number = events.length;
    
          this.person_offset[id] = iOffset / nElementsPerVertex;
        
          const time0 : number = (1995 - 1970) * 365.242199;
          const time1 : number = (2018 - 1970) * 365.242199;
    
          this.build_interval_rectangle(cpu_data, iOffset, id, time0, time1, 0.8, world_width);

          iOffset += nElementsPerRectangle;
          
          for (let iEvent : number = 0; iEvent < nEvents; iEvent++)
          {
            const begin : number = events[iEvent];
            const end : number = begin - 14;
            const color : number = 0.6;
    
            this.build_interval_rectangle(cpu_data, iOffset, id, begin, end, color, world_width);
    
            iOffset += nElementsPerRectangle;
    
          }
          
          const aa_intervals : any[] = q.AA;
          const nAA : number = aa_intervals.length;
    
          
          for (let iAA : number = 0; iAA < nAA; iAA += 2)
          {
            const begin : number = aa_intervals[iAA + 0];
            const end : number = aa_intervals[iAA + 1];
            const color : number = 0.3;
    
            this.build_interval_rectangle(cpu_data, iOffset, id, begin, end, color, world_width);
    
            iOffset += nElementsPerRectangle;
          }
    
        }
    
        this.nRectangleCount = nPrimitives;
      }
     
      this.gl.bufferData(this.gl.ARRAY_BUFFER, cpu_data, this.gl.STATIC_DRAW);
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     getNumberOfPersons
    //

    getNumberOfPersons() : number {
        
        let nPersons : number = 0;
        
        for (let iChunk : number = 0; iChunk < g_nMaxChunk; iChunk++) {
        
            let
            i : any = g_json_raw[iChunk];
        
            nPersons += i.length;
        }
        
        return nPersons;
        }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     getNumberOfRectangles
    //

    getNumberOfRectangles() : number
    {
        let
            nRectangles : number = 0;

        // Year bars

        nRectangles += getNumberOfYearLines();
    
        // Intervals

        for (let iChunk : number = 0; iChunk < g_nMaxChunk; iChunk++) {

            let
            i : any[] = g_json_raw[iChunk];

            for (let iPerson : number = 0; iPerson < i.length; iPerson++) {

            const q : any = i[iPerson];

            const nEvents : number = q.E.length;
            const nAA : number = q.AA.length;

            nRectangles += nEvents;
            nRectangles += nAA;
            }
        }

        return nRectangles;
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     setup
    //

    setup(vertex_source : string, fragment_source : string, row_size : number, json_raw :  any[], nMaxChunk : number) : void
    {

        this.nMaxChunk = nMaxChunk;
        this.json_raw = json_raw;
    
        this.row_size = row_size;

        const vertexShader : any = gl_utils.createShader(this.gl, this.gl.VERTEX_SHADER, vertex_source);
        const fragmentShader : any = gl_utils.createShader(this.gl, this.gl.FRAGMENT_SHADER, fragment_source);

        this.program = gl_utils.createProgram(this.gl, vertexShader, fragmentShader);


        // look up where the vertex data needs to go.
        this.positionAttributeLocation = gl_utils.GetUniformLocation(this.gl, this.program, "a_position", false);

        this.resolutionUniformLocation = gl_utils.GetUniformLocation(this.gl, this.program, "u_resolution", true);
        this.contentsizeUniformLocation = gl_utils.GetUniformLocation(this.gl, this.program, "u_contents_size", true);
        this.offsetLocation = gl_utils.GetUniformLocation(this.gl, this.program, "pixel_offset", true);
        this.y_scaleLocation = gl_utils.GetUniformLocation(this.gl, this.program, "y_scale", true);


        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.buildGLFromData(WORLD_WIDTH);


        // Create a vertex array object (attribute state)
        this.vao = this.gl.createVertexArray();

        // and make it the one we're currently working with
        this.gl.bindVertexArray(this.vao);

        // Turn on the attribute
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);

        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        const size : any = 3;          // 3 components per iteration
        const type : any = this.gl.FLOAT;   // the data is 32bit floats
        const normalize : any = false; // don't normalize the data
        const stride : any = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset : any = 0;        // start at the beginning of the buffer
        
        this.gl.vertexAttribPointer(
            this.positionAttributeLocation, size, type, normalize, stride, offset);

    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     render
    //

    render(y : number, y_scale : number, isYearLines : boolean, x_factor : number) : void {
    
      this.gl.useProgram(this.program);
    
      // Bind the attribute/buffer set we want.
      this.gl.bindVertexArray(this.vao);
    
      this.gl.uniform2f(this.resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);
      this.gl.uniform2f(this.contentsizeUniformLocation, x_factor, 1);
      this.gl.uniform2f(this.offsetLocation, 0, -y);
      this.gl.uniform1f(this.y_scaleLocation, y_scale);
    
      let count : number = this.nRectangleCount * 6;
      
      if (isYearLines) {
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6 * getNumberOfYearLines());
      }
    
      let offset : number = 6 * getNumberOfYearLines();
    
      count -= offset;
      
      const
        row0 : number = get_row_min();
    
      const
        row1 : number = get_row_max();
    
      const
        offset0 : number = this.person_offset[row0];
    
      const
        offset1 : number = this.person_offset[row1];
    
      if (offset0 > count)
      {
        return;
      }
    
      let
        newCount = offset1 - offset0;
    
      if (offset0 + newCount > count)
      {
        newCount = count - offset0;
      }
    
      this.gl.drawArrays(this.gl.TRIANGLES, offset0, newCount);
    }
    
}






