#ifdef GL_ES
  precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define QP 0.785398163397448
#define HP 1.570796326794897
#define P 3.141592653589793
#define TP 6.283185307179586

#define t u_time
#define ht 0.5 * t
#define tt 0.1 * t

#define S(a, b, t) smoothstep(a, b, t)

float map(float n, float start1, float stop1, float start2, float stop2) {
  return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
}

float map01(float n, float start2, float stop2) {
  return (0.5 * n + 0.5) * (stop2 - start2) + start2;
}

float stroke(float x, float s, float w, float p) {
  return clamp(
    S(s + p, s - p, x - 0.5 * w) * S(s - p, s + p, x + 0.5 * w),
    0.0, 1.0);
}

float waves(vec2 uv, float n, vec2 id, float pre, float offset) {
  float w = map01(
    sin(-tt + QP * uv.x + id.y + cos(ht)),
    0.1, 0.45);
  float x = map01(
    cos(ht + HP * uv.x + id.y + offset),
    1.0 - w, w);
  return stroke(fract(n * uv.y), x, w, pre);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 uv0 = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  float n = map01(
    sin(ht + sin(t - P * uv.y) + cos(-t + HP * uv.x)),
    6.0, 10.0);
  vec2 gv = fract(n * uv0);
  vec2 id = floor(n * uv0);

  vec3 color = vec3(1.0);

  float pre = map01(cos(t + P * uv.y), 0.025, 0.125);
  vec3 offset = vec3(
    0.5 * cos(t + 1.2 * P * uv.x),
    0.25 * cos(t + P * uv.x),
    0.1 * cos(t + 0.8 * P * uv.x)
  );
  color.r -= waves(uv0, n, id, pre + 0.025, offset.x);
  color.g -= waves(uv0, n, id, pre + 0.0, offset.y);
  color.b -= waves(uv0, n, id, pre + 0.05, offset.z);

  gl_FragColor = vec4(color, 1.0);
}
