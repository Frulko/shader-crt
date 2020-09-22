#ifdef GL_ES
  precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define QP 0.785398163397448
#define TRP 1.047197551196598
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

float map01(float n) {
  return 0.5 * n + 0.5;
}

float map01(float n, float start2, float stop2) {
  return (0.5 * n + 0.5) * (stop2 - start2) + start2;
}

float circleSDF(vec2 uv) {
  return 2.0 * length(uv);
  // return length(uv - 0.5) * 2.0;
}

float rectSDF(vec2 uv) {
  return 2.0 * max(abs(uv.x), abs(uv.y));
}

float polySDF(vec2 uv, float n) {
  // uv = 2.0 * uv - 1.0;
  float a = atan(uv.x, uv.y) + P;
  float r = length(uv);
  n = TP / n;
  return 2.0 * r * cos(floor(0.5 + a / n) * n - a);
}

float fill(float x, float s) {
  return 1.0 - step(s, x);
}

float fill(float x, float s, float p) {
  return 1.0 - S(s - p, s + p, x);
}

float stroke(float x, float s, float w, float p) {
  return clamp(
    S(s + p, s - p, x - 0.5 * w) * S(s - p, s + p, x + 0.5 * w),
    0.0, 1.0);
}

void main() {
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;

  vec3 color = vec3(1.0);

  float timer = -t;

  uv.z *= 0.9;
  float circMask = circleSDF(uv.zw);
  float mask = fill(circMask, 0.8);
  float border = stroke(circMask, 0.8, 0.035, 0.001);

  vec2 offset = vec2(
    map01(cos(-ht), 0.75, 0.5),
    map01(sin(-ht), 0.75, 0.5)
  );
  float circStripe = circleSDF(uv.zw + offset);
  float rep = 25.0;
  float f = map01(sin(t), 0.1, 0.5);
  float w = map(uv.x + f * uv.y, 0.0, 1.0, 1.0, 0.0);
  float stripe = fill(
    abs(2.0 * fract(timer + rep * circStripe) - 1.0),
    w, 0.1);
  
  // color -= uv.x + 0.25 * uv.y;
  color -= mask * stripe;
  color -= border;

  gl_FragColor = vec4(color, 1.0);
}
