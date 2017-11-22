#version 300 es

in vec2 quad_position;

in vec2 quad_texcoord;

uniform vec2 u_resolution;

out vec2 quad_out_texcoord;

void main() {
 
// convert the position from pixels to 0.0 to 1.0
vec2 zeroToOne = quad_position / u_resolution;

// convert from 0->1 to 0->2
vec2 zeroToTwo = zeroToOne * 2.0;

// convert from 0->2 to -1->+1 (clipspace)
vec2 clipSpace = zeroToTwo - 1.0;

gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

quad_out_texcoord = quad_texcoord;
  
}
