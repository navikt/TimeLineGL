#version 300 es

precision mediump float;
 
// we need to declare an output for the fragment shader
out vec4 outColor;
 
void main() {
  // Just set the output to a constant redish-purple
  outColor = vec4(1, 0.1, 0.0, 0.7);
}

