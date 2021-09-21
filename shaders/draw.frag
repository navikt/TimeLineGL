#version 300 es

precision mediump float;
 
out vec4 outColor;

in float age_normalized;
 
void main() {

  float t = age_normalized;     // 0..1

  // Heat map

  vec3 jet = clamp(vec3(1.5) - abs(4.0 * vec3(t) + vec3(-3, -2, -1)), vec3(0), vec3(1));

  outColor = vec4(jet.x, jet.y, jet.z, 1.0);
}

