#version 300 es

precision mediump float;


// we need to declare an output for the fragment shader
out vec4 outColor;

in float colorValue;

void main() {
  if (colorValue < 0.31)
  {
   outColor = vec4(0.3, 1, 0, 0.7);
  }
  else if (colorValue < 0.61)
  {
    outColor = vec4(0, 0, 1, 0.7);
  }
  else if (colorValue < 0.9)
  {
    outColor = vec4(0, 0, 0, 0.15);
  }
  else
  {
    outColor = vec4(0, 0, 0, 0.6);
  }
 
}
