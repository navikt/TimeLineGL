


class GLUtils {

///////////////////////////////////////////////////////////////////////////////////////
//
//     createShader
//

static createShader(gl : any, type : any, source : string): number | null {
    let shader : any = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success : number = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);

    return null;

}

///////////////////////////////////////////////////////////////////////////////////////
//
//     createProgram
//

static createProgram(gl : any, vertexShader : any, fragmentShader: any): number {

    const program : number = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success: number = gl.getProgramParameter(program, gl.LINK_STATUS);

    if (success) {
      return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);

    return -1;
  }

///////////////////////////////////////////////////////////////////////////////////////
//
//     getUniformLocation
//

static getUniformLocation(gl : any, p : number, name : string, isWarn : boolean): number {
  const
    location : number = gl.getUniformLocation(p, name);

  if (isWarn && location == null) {
    alert("GetUniformLocation: '" + name + "' not found");
  }

  return location;
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     get_x_from_time
//

static static_get_x_from_time(start_year: number, w : number, time: number): number {

  const start_time: number = (start_year - 1970) * 365.242199;

  const end_time: number = (2018 - 1970) * 365.242199;

  const a: number = w / (end_time - start_time);

  return a * (time - start_time);
}

}






