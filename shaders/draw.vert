#version 300 es

precision highp float;
precision mediump int;

uniform float d_current_time;
uniform uvec2 canvas_size;

in uvec2 data_final;

out float age_normalized;
out vec2 v_texCoord;


void main() {

  const float TRANSITION_SPEED = 3.0;
  const float DISPLACEMENT_SCALE = 0.10;
  const vec2 DIGIT_TEXTURE_SIZE_PER_DIGIT = vec2(17.0, 36.1);

  vec2 f_canvas_size = vec2 (float(canvas_size.x), float(canvas_size.y));

  vec2 QUAD_HALF_SIZE =  DIGIT_TEXTURE_SIZE_PER_DIGIT /  f_canvas_size;
  
  const float DIGIT_SPACING = 2.3;

  uint v = data_final.x;
  uint random_data = data_final.y;

  const uint mask_time_hi = 0xFFFC0000u;
  const uint mask_time_lo = 0x0003FFF0u;
  const uint mask_dir_hi  = 0x0000000Cu;
  const uint mask_dir_lo  = 0x00000003u;

  uint t1_converted = (v & mask_time_hi) >> (32u - 14u);
  uint t0_converted = (v & mask_time_lo) >> 4u;
  uint d1_converted = (v & mask_dir_hi) >> 2u;
  uint d0_converted = (v & mask_dir_lo);

  float dr_conversion_time1 = float(t1_converted) / 6.0 / 24.0;
  float dr_conversion_time0 = float(t0_converted) / 6.0 / 24.0;

  const uint mask_time_random_hi = 0xFFFF8000u;
  const uint mask_time_random_med = 0x7000u;
  const uint mask_time_random_lo = 0x0FFFu;

  uint u_random = (random_data & mask_time_random_hi) >> 15u;
  uint u_offset = (random_data & mask_time_random_med) >> 12u;
  uint u_launch_time = (random_data & mask_time_random_lo);

  float d_launch_day = float (u_launch_time % 10000u);

  vec2 end_position = vec2(float(d0_converted), float(d1_converted));

  end_position = end_position - 1.0;
  end_position = end_position * 0.8;

  float displace_x = 2.0 * float(u_random % 500u)/500.0 - 1.0;
  float displace_y = 2.0 * float(u_random / 500u  % 500u)/500.0 - 1.0;

  float aspect_ratio = float(canvas_size.y) / float (canvas_size.x);

  vec2 displacement_scale = vec2(DISPLACEMENT_SCALE, DISPLACEMENT_SCALE / aspect_ratio);

  vec2 random_displacement = vec2(displace_x, displace_y) * displacement_scale;
  
  vec2 d_conversion_time = vec2(dr_conversion_time0, dr_conversion_time1) + d_launch_day;

  vec2 dt = d_current_time - d_conversion_time;

  vec2 exp_x = exp(TRANSITION_SPEED * dt);
  vec2 pos_mix  = exp_x / (exp_x + 1.0);

  vec2 p_out = end_position * pos_mix + random_displacement;

  float dr_time_since_launch = d_current_time - d_launch_day;

  p_out = (dr_time_since_launch <= 0.0) ? vec2(-2.0, -2.0) : p_out;

  // Spread out to create quads.
  vec2 quad_offset = vec2 (float((u_offset & 2u)/2u), float(u_offset & 1u));

  float hi_lo = float((u_offset & 4u) / 4u);

  v_texCoord = quad_offset;

  quad_offset = -1.0 + 2.0 * quad_offset;
  quad_offset = quad_offset * QUAD_HALF_SIZE;

  p_out = p_out + quad_offset;

  p_out = p_out + DIGIT_SPACING * vec2(QUAD_HALF_SIZE.x, 0) * float((u_offset & 4u) / 4u);

  gl_Position = vec4(p_out.x, p_out.y, 0.0, 1.0);

  age_normalized = max(0.0, dr_time_since_launch);
  age_normalized = 10.0 * age_normalized / 30.0;

  float y_pos0_lo = mod(9.0 - age_normalized, 10.0) * DIGIT_TEXTURE_SIZE_PER_DIGIT.y;
  float y_pos1_lo = y_pos0_lo + DIGIT_TEXTURE_SIZE_PER_DIGIT.y;

  float x_i = float(uint(mod(age_normalized, 100.0)) / 10u);
  float x_f = mod(age_normalized, 100.0) / 10.0;

  float x_remainder = mod(x_f - x_i, 1.0);

  x_remainder = x_remainder - 0.9;

  x_remainder = (x_remainder < 0.0)? 0.0 : x_remainder;
  
  x_remainder = x_remainder * 10.0;

  float position_res = x_i + x_remainder;

  float y_pos0_hi = mod(9.0 - position_res, 10.0) * DIGIT_TEXTURE_SIZE_PER_DIGIT.y;
  float y_pos1_hi = y_pos0_hi + DIGIT_TEXTURE_SIZE_PER_DIGIT.y;

  float texture_size_y = 10.0 * DIGIT_TEXTURE_SIZE_PER_DIGIT.y;

  y_pos0_lo = y_pos0_lo / texture_size_y;
  y_pos1_lo = y_pos1_lo / texture_size_y;

  y_pos0_hi = y_pos0_hi / texture_size_y;
  y_pos1_hi = y_pos1_hi / texture_size_y;

  float y_lo = y_pos0_lo * (1.0 - v_texCoord.y) + y_pos1_lo *  v_texCoord.y;
  float y_hi = y_pos0_hi * (1.0 - v_texCoord.y) + y_pos1_hi *  v_texCoord.y;

  v_texCoord.y =  hi_lo * y_lo + (1.0 - hi_lo) * y_hi;

}

