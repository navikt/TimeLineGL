


class gl_utils {

///////////////////////////////////////////////////////////////////////////////////////
//
//     createShader
//

static createShader(gl : any, type : any, source : string) : number {
    let shader : any = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success : number = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success != 0) {
    return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);

    return -1;
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     createProgram
//

static createProgram(gl : any, vertexShader : any, fragmentShader: any) : number {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }
  
    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  
    return -1;
  }
  
///////////////////////////////////////////////////////////////////////////////////////
//
//     GetUniformLocation
//

static GetUniformLocation(gl : any, p : number, name : string, isWarn : boolean) : number
{
  var
    location = gl.getUniformLocation(p, name);

  if (isWarn && location == null)
  {
    alert("GetUniformLocation: '" + name + "' not found");
  }

  return location;
}

///////////////////////////////////////////////////////////////////////////////////////
//
//     get_x_from_time
//

static get_x_from_time(w : number, time: number) : number
{
  var start_time = (1995 - 1970) * 365.242199;
  var end_time = (2018 - 1970) * 365.242199;

  var a = w / (end_time - start_time);

  return a * (time - start_time);
}  


};





