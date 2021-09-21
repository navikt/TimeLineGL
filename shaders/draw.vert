#version 300 es

precision highp float;
precision mediump int;

uniform float d_current_time;
uniform uvec2 canvas_size;

in uvec2 data_final;

out float age_normalized;


void main() {

  const float TRANSITION_SPEED = 3.0;
  const float DISPLACEMENT_SCALE = 0.10;

  const float QUAD_HALF_SIZE = 0.10;


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

  const uint mask_time_random_hi = 0xFFFFC000u;
  const uint mask_time_random_med =  0x3000u;
  const uint mask_time_random_lo = 0x0FFFu;

  uint u_random = (random_data & mask_time_random_hi) >> 14u;
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

  p_out = (dr_time_since_launch <= 0.0) ? vec2(-1.0, -1.0) : p_out;


  // Spread out to create quads.
  vec2 quad_offset = vec2 (float(u_offset / 2u), float(u_offset % 2u));

  quad_offset = -1.0 + 2.0 * quad_offset;
  quad_offset = quad_offset * QUAD_HALF_SIZE;

  p_out = p_out + quad_offset;

  gl_Position = vec4(p_out.x, p_out.y, 0.0, 1.0);

  age_normalized = max(0.0, dr_time_since_launch);
  age_normalized = min(age_normalized, 30.0);
  age_normalized = age_normalized / 30.0;

}

