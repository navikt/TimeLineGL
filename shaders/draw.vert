#version 300 es

precision highp float;
precision mediump int;
precision mediump usampler2D;
precision mediump sampler2D;


uniform usampler2D u_positions;

uniform float f_cyclic_time;

in vec2 f_coord;

void main() {

  ivec2 coord = ivec2(int(f_coord.x), int(f_coord.y));

  uvec4 upsample_new =  texelFetch(u_positions, coord, 0);

  vec2 f_upsample_new = vec2 (upsample_new.x, upsample_new.y);

  vec2 psample = f_upsample_new / float(256 * 256);


  psample = f_cyclic_time * psample;

  vec2 pos_readout = (2.0 * psample) - 1.0;

  gl_Position = vec4(pos_readout, 0.0, 1.0);

  gl_PointSize = 3.0;
}
 