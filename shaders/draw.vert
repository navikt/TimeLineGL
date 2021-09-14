#version 300 es

precision highp float;
precision mediump int;
precision mediump usampler2D;
precision mediump sampler2D;

uniform sampler2D u_positions;

uniform usampler2D u_positions_new;

uniform float f_time;

in vec2 habla;

void main() {

  int nHabla_X = int(habla.x);
  int nHabla_Y = int(habla.y);

  ivec2 coord = ivec2(nHabla_X, nHabla_Y);

  vec2 psample = texelFetch(u_positions, coord, 0).xy;

  uvec4 upsample_new =  texelFetch(u_positions_new, coord, 0);

  if (upsample_new.x > uint(4)) {
    psample = f_time * psample;
  } else {
    psample = (f_time + 1.0) * psample;
  }


 

  vec2 pos_readout = (2.0 * psample) - 1.0;

  gl_Position = vec4(pos_readout, 0.0, 1.0);

  gl_PointSize = 3.0;
}
 