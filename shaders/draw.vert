#version 300 es

precision highp float;
precision mediump int;

uniform sampler2D u_positions;

in vec2 habla;

void main() {

  int nHabla_X = int(habla.x);
  int nHabla_Y = int(habla.y);

  ivec2 coord = ivec2(nHabla_X, nHabla_Y);

  vec2 psample = texelFetch(u_positions, coord, 0).xy;

  vec2 pos_readout = (2.0 * psample) - 1.0;

  gl_Position = vec4(pos_readout, 0.0, 1.0);

  gl_PointSize = 3.0;
}
 