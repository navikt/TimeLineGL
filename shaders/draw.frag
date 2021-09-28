#version 300 es

precision mediump float;
 
uniform sampler2D diffuse; // We will bind our texture through this uniform

uniform sampler2D diffuse2;

in vec2 v_texCoord;

out vec4 outColor;

in float age_normalized;
 
void main() {

  float t = age_normalized;     // 0..1
  // vec3 jet = clamp(vec3(1.5) - abs(4.0 * vec3(t) + vec3(-3, -2, -1)), vec3(0), vec3(1));

  // outColor = vec4(jet.x, jet.y, jet.z, 1.0);

  vec4 outColor_a = texture(diffuse, v_texCoord);
  vec4 outColor_b = texture(diffuse2, v_texCoord);


  float f_toggle = (t > 1.5) ? 1.0 : 0.0;

  outColor = f_toggle * outColor_a +  (1.0 - f_toggle) * outColor_b;


}

