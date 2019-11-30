

// https://stackoverflow.com/questions/19695658/emulating-palette-based-graphics-in-webgl-v-s-canvas-2d


/*

  Colour from palette

  Originally retreived from image (singel channel alpha)
  float index = texture2D(u_image, v_texcoord).a * 255.0;

  Gives float 0..255.

  And use that value to look up a color in the palette:

  gl_FragColor = texture2D(u_palette, vec2((index + 0.5) / 256.0, 0.5));

*/

/*
  Setup a palette.

  // Value filtering makes no sense for palette lookups:

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

*/

class Rectangles {

    gl : any;

    program : any;
    positionAttributeLocation : number | undefined;
    resolutionUniformLocation : number | undefined;
    contentsizeUniformLocation : number | undefined;
    offsetLocation : number | undefined;
    y_scaleLocation : number | undefined;

    viz_factor1Location : number | undefined;
    viz_factor2Location : number | undefined;

    paletteLocation : number | undefined;

    buffer : number | undefined;
    vao : number | undefined;

    rectangle_thickness : number = 7;
    bar_thickness : number = 14;
    nRectangleCount : number = 0;

    person_offset : Int32Array | undefined;

    nMaxChunk : number | undefined;
    json_raw : any[] = [];

    viewport : ViewPort;

    configuration : Configuration;


    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     constructor
    //

    constructor(gl : any, configuration : Configuration, viewport : ViewPort) {

        this.gl = gl;
        this.viewport = viewport;
        this.configuration = configuration;
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     setPaletteColor
    //

    static setPaletteColor(palette: Uint8Array, index: number, rgba: Array<number>): void {
      palette[index * 4 + 0] = rgba[0];
      palette[index * 4 + 1] = rgba[1];
      palette[index * 4 + 2] = rgba[2];
      palette[index * 4 + 3] = rgba[3];
    }


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //
    //     createPaletteTexture
    //

    createPaletteTexture(): void {

      const gl:any = this.gl;

      const palette: Uint8Array = new Uint8Array(256 * 4);

      const paletteToRGBA :  { [id: number] : Array<number> } = this.configuration.GetNumberToColorRGBA();

      for(let key in paletteToRGBA) {
        if (paletteToRGBA.hasOwnProperty(key)) {

          const paletteID: number = Number(key);
          const colorRGBA: Array<number> = paletteToRGBA[key];

          Rectangles.setPaletteColor(palette, paletteID, colorRGBA);

        }
      }

      gl.activeTexture(this.gl.TEXTURE1);

      const paletteTex:any = gl.createTexture();

      gl.bindTexture(gl.TEXTURE_2D, paletteTex);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 256, 1, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, palette);

    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     write_rectangle
    //

    write_rectangle(f : Float32Array, iOffset : number, x1 : number, y1 : number, x2 : number, y2 : number, color : number): void {

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
    //     build_bar_rectangle
    //

    build_bar_rectangle(f : Float32Array, iOffset : number, begin : number, end : number, color : number): void {

        const x1 : number = this.viewport.getXFromTime(begin);
        const x2 : number = this.viewport.getXFromTime(end);

        const y1 : number = 0 * this.viewport.row_size;
        const y2 : number = this.getNumberOfPersons() * this.viewport.row_size;

        this.write_rectangle(f, iOffset, x1, y1, x2, y2, color);
    }


    /**
     * Returns a random integer between min (inclusive) and max (inclusive)
     * Using Math.round() will give you a non-uniform distribution!
     */
    getRandomInt(min: number, max: number): number {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     build_interval_rectangle
    //

    build_interval_rectangle(f : Float32Array, iOffset : number, id : number,
                      begin : number, end : number, color : number, nSplits : number): void {

      const x1 : number = this.viewport.getXFromTime(begin);
      const x2 : number = this.viewport.getXFromTime(end);

      const y1_min : number = id * this.viewport.row_size;
      const y2_max : number = y1_min + this.rectangle_thickness;

      if (nSplits >= 2) {

        const iSplit : number = this.getRandomInt(0, nSplits -1);

        const y_size: number = y2_max - y1_min;

        const y_slice_size: number = y_size/nSplits;

        const y1: number = y1_min + iSplit * y_slice_size;

        const y2: number = y1 + y_slice_size;

        this.write_rectangle(f, iOffset, x1, y1, x2, y2, color);
      } else {
        this.write_rectangle(f, iOffset, x1, y1_min, x2, y2_max, color);
      }
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    // c  GetRectangleColorFromType
    //

    GetRectangleColorFromType(type_str: string): number {


      let offset: number = 0;

      let v: number = 0;

             if (type_str === "AA") {
        v = 1;
      } else if (type_str === "ARBEID") {
        v = 2;
      } else if (type_str === "ATTF") {
        v = 3;
      } else if (type_str === "DAGP") {
        v = 4;
      } else if (type_str === "ENSLIG") {
        v = 5;
      } else if (type_str === "FEILUTBE") {
        v = 6;
      } else if (type_str === "INDIV") {
        v = 7;
      } else if (type_str === "KLAN") {
        v = 8;
      } else if (type_str === "MOBIL") {
        v = 9;
      } else if (type_str === "REHAB") {
        v = 10;
      } else if (type_str === "SANKSJON") {
        v = 11;
      } else if (type_str === "SANKSJON_A") {
        v = 12;
      } else if (type_str === "SANKSJON_B") {
        v = 13;
      } else if (type_str === "SYKEP") {
        v = 14;
      } else if (type_str === "TILSTOVER") {
        v = 15;
      } else if (type_str === "TILSTRAMME") {
        v = 16;
      } else if (type_str === "TILT") {
        v = 17;
      } else if (type_str === "UFOREYT") {
        v = 18;
      } else if (type_str === "UTRSYA") {
        v = 19;
      } else if (type_str === "VLONN") {
        v = 20;
      } else {
        v = 21;
      }

      return offset + v;
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     buildGLFromData
    //

    buildGLFromData(): void {

  

      const keywordToPalette : { [id: string] : number } = this.configuration.GetKeywordToNumberMap();

      const default_color: string = "INVISIBLE";

      const default_color_ID: number = keywordToPalette[default_color];

      const
        nPrimitives : number = this.getNumberOfRectangles();

      const
        nVertexPerRectangle : number = 6;

      const
        nElementsPerVertex : number = 3;

      const
        nElementsPerRectangle : number = nVertexPerRectangle * nElementsPerVertex;

      let cpu_data : Float32Array = new Float32Array(nPrimitives * nElementsPerRectangle);

      this.person_offset = new Int32Array(this.getNumberOfPersons());

      let
        iOffset : number = 0;

      // year bars

      for (let iYear : number = 1996; iYear < 2018; iYear++) {

        const time : number = (iYear - 1970) * 365.242199;

        let
          color : number = 1.0;

        this.build_bar_rectangle(cpu_data, iOffset, time, time + this.bar_thickness, color);

        iOffset += nElementsPerRectangle;

      }


      var all_types: any = [];

      const max: number = this.nMaxChunk ? this.nMaxChunk : 0

      

      for (let iChunk : number = 0; iChunk < max; iChunk++) {

        const
          j : any = this.json_raw[iChunk];

        var keys: any = [];

        for(let k in j) {
          if (j.hasOwnProperty(k)) {
            keys.push(k);
            // code here
          }
        }
      

        const n: number = keys.length;

        for (let iKey : number = 0; iKey < n; iKey++) {

          const id: number = keys[iKey];

          this.person_offset[id] = iOffset / nElementsPerVertex;

          const time0 : number = (1995 - 1970) * 365.242199;
          const time1 : number = (2018 - 1970) * 365.242199;

          this.build_interval_rectangle(cpu_data, iOffset, id, time0, time1, default_color_ID, 0);

          iOffset += nElementsPerRectangle;

          let person: any = j[id];
          var types: any = [];

          for(let k in person) {
            if (person.hasOwnProperty(k)) {
              types.push(k);
            }
          }

          for (let type in types) {
            if (!types.hasOwnProperty(type)) {
              continue;
            }

            if (all_types.indexOf(types[type]) >= 0) {
              // already contained
            } else {
              all_types.push(types[type]);
            }

            let acIntervalData: any = person[types[type]];

            const nIntervalData: number = acIntervalData.length;

            for (let iIntervalData : number = 0; iIntervalData < nIntervalData; iIntervalData +=2) {

              let begin: number = acIntervalData[iIntervalData + 0];
              let end: number =   acIntervalData[iIntervalData + 1];

              if (types[type] === "NY") {

                // temporary work around awaiting NY=>AKTIV (18-67)
                const birth: number = begin;

                const year18: number = birth + 18 * 365.242199;
                const year67: number = birth + 67 * 365.242199;

                begin = year18;
                end = year67;
              }

              const color: number = keywordToPalette[types[type]];

              this.build_interval_rectangle(cpu_data, iOffset, id, begin, end, color, 0);

              iOffset += nElementsPerRectangle;


              // c Logger.log(1, "min=" + acIntervalData[iIntervalData + 0] + ", max=" + acIntervalData[iIntervalData +1]);
            }
          }
        }
      }

      Logger.log(1, "Elements of : " + all_types.length + " type(s) found");

      for (let type in all_types) {
        if (!all_types.hasOwnProperty(type)) {
          continue;
        }
        Logger.log(1, "   " + all_types[type]);
      }
      this.nRectangleCount = nPrimitives;
      this.gl.bufferData(this.gl.ARRAY_BUFFER, cpu_data, this.gl.STATIC_DRAW);
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     getNumberOfPersons
    //

    getNumberOfPersons(): number {

      let
        nPersons : number = 0;

      const max : number = this.nMaxChunk? this.nMaxChunk : 0  

      for (let iChunk : number = 0; iChunk < max; iChunk++) {

        const
          j : any = this.json_raw[iChunk];

        var keys: any = [];

        for(let k in j) {
          if (j.hasOwnProperty(k)) {
            keys.push(k);
            // code here
          }
        }

        const n: number = keys.length;

        nPersons += n;
      }

      return nPersons;
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     getNumberOfYearLines
    //

    getNumberOfYearLines(): number {
      let
        nYearLines : number = 0;

      for (let iYear : number = 1996; iYear < 2018; iYear++) {
        nYearLines++;
      }

      return nYearLines;

    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     getNumberOfRectangles
    //

    getNumberOfRectangles(): number {
      let
          nRectangles : number = 0;

      // year bars

      nRectangles += this.getNumberOfYearLines();

      // intervals

      const max : number = this.nMaxChunk? this.nMaxChunk : 0  

      for (let iChunk : number = 0; iChunk < max; iChunk++) {

        const
          j : any = this.json_raw[iChunk];

        var keys: any = [];

        for(let k in j) {
          if (j.hasOwnProperty(k)) {
            keys.push(k);
            // code here
          }
        }

        for (let iKey: number = 0; iKey < keys.length; iKey++) {

          const id: number = keys[iKey];

          let person: any = j[id];
          var types: any = [];

          for(let k in person) {
            if (person.hasOwnProperty(k)) {
              types.push(k);
            }
          }

          for (let type in types) {
            if (!types.hasOwnProperty(type)) {
              continue;
            }

            let acIntervalData: any = person[types[type]];
            const nIntervalData: number = acIntervalData.length;
            nRectangles += nIntervalData/2;
          }
        }
      }

      return nRectangles;
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     setup
    //

    setup(vertex_source : string, fragment_source : string, json_raw :  any[], nMaxChunk : number,): void {

        if (!nMaxChunk) {

        }

        this.nMaxChunk = nMaxChunk;
        this.json_raw = json_raw;

        const vertexShader : any = GLUtils.createShader(this.gl, this.gl.VERTEX_SHADER, vertex_source);
        const fragmentShader : any = GLUtils.createShader(this.gl, this.gl.FRAGMENT_SHADER, fragment_source);

        this.program = GLUtils.createProgram(this.gl, vertexShader, fragmentShader);


        // look up where the vertex data needs to go.
        this.positionAttributeLocation = GLUtils.getUniformLocation(this.gl, this.program, "a_position", false);

        this.resolutionUniformLocation = GLUtils.getUniformLocation(this.gl, this.program, "u_resolution", true);
        this.contentsizeUniformLocation = GLUtils.getUniformLocation(this.gl, this.program, "u_contents_size", true);
        this.offsetLocation = GLUtils.getUniformLocation(this.gl, this.program, "pixel_offset", true);
        this.y_scaleLocation = GLUtils.getUniformLocation(this.gl, this.program, "y_scale", true);

        this.viz_factor1Location = GLUtils.getUniformLocation(this.gl, this.program, "viz_factor1", true);
        this.viz_factor2Location = GLUtils.getUniformLocation(this.gl, this.program, "viz_factor2", true);

        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.buildGLFromData();

        // create a vertex array object (attribute state)
        this.vao = this.gl.createVertexArray();

        // and make it the one we're currently working with
        this.gl.bindVertexArray(this.vao);

        // turn on the attribute
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);

        // tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        const size : any = 3;          // 3 components per iteration
        const type : any = this.gl.FLOAT;   // the data is 32bit floats
        const normalize : any = false; // don't normalize the data
        const stride : any = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        const offset : any = 0;        // start at the beginning of the buffer

        this.gl.vertexAttribPointer(
            this.positionAttributeLocation, size, type, normalize, stride, offset);


        this.createPaletteTexture();

        this.paletteLocation = GLUtils.getUniformLocation(this.gl, this.program, "u_palette", true);
    }

    ///////////////////////////////////////////////////////////////////////////////////////
    //
    //     render
    //

    render(y : number, y_scale : number, row0: number, row1 : number, isYearLines : boolean,
                                                      x_factor : number, rVizFactor_1: number, rVizFactor_2: number): void {

      this.gl.useProgram(this.program);

      // bind the attribute/buffer set we want.
      this.gl.bindVertexArray(this.vao);

      this.gl.uniform2f(this.resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);
      this.gl.uniform2f(this.contentsizeUniformLocation, x_factor, 1);
      this.gl.uniform2f(this.offsetLocation, 0, -y);
      this.gl.uniform1f(this.y_scaleLocation, y_scale);

      this.gl.uniform1f(this.viz_factor1Location, rVizFactor_1);
      this.gl.uniform1f(this.viz_factor2Location, rVizFactor_2);

      this.gl.uniform1i(this.paletteLocation, 1);

      let count : number = this.nRectangleCount * 6;

      if (isYearLines) {
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6 * this.getNumberOfYearLines());
      }

      let offset : number = 6 * this.getNumberOfYearLines();

      count -= offset;

      const
        offset0 : number = this.person_offset ? this.person_offset[row0] : 0;

      const
        offset1 : number = this.person_offset ? this.person_offset[row1] : 0;

      if (offset0 > count) {
        return;
      }

      let
        newCount : number = offset1 - offset0;

      if (offset0 + newCount > count) {
        newCount = count - offset0;
      }

      this.gl.drawArrays(this.gl.TRIANGLES, offset0, newCount);
    }

}







