#version 300 es

precision mediump float;


// we need to declare an output for the fragment shader
out vec4 outColor;

in float colorValue;

in float alphaValue;

in float rViz1Value;
in float rViz2Value;

uniform sampler2D u_palette;

void main() {

  // float index = 2.0;    // Green
  // float index = 1.0;    // Red
  
  // float index = colorValue;   

  // outColor = texture(u_palette, vec2((index + 0.5) / 256.0, 0.5));

  if (colorValue == 0.0) {
    outColor = vec4(0.5, 1, 0, 1.0);
  }
  else {
    outColor = vec4(1, colorValue/15.0, 0, 1.0);
  }
  

}
    