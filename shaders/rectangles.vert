#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec3 a_position;

out float colorValue;

out float alphaValue;

out float rViz1Value;
out float rViz2Value;

// Resolution of canvas
uniform vec2 u_resolution;

// Extent of content, range 0:inclusive -> value: exclusive.
uniform vec2 u_contents_size;

uniform vec2 pixel_offset;

uniform float y_scale;

uniform float viz_factor1;
uniform float viz_factor2;

void main() {
 
  vec2 offsetpixel = a_position.xy - pixel_offset;

  offsetpixel.y *= y_scale;

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = offsetpixel / u_resolution;

  zeroToOne = zeroToOne * u_contents_size;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  // clipSpace = clipSpace * viz_factor1;

  gl_Position = vec4(clipSpace * vec2(1 , -1), 0, 1);

  // Pass thru
  colorValue = a_position.z;


  alphaValue = 1.0 - gl_Position.y * gl_Position.y;

  rViz1Value = viz_factor1;
  rViz2Value = viz_factor2;

}
