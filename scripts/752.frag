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

float n11(float p) {
  return fract(97531.2468 * sin(24680.135 * p));
}

vec2 rotate2d(vec2 uv, float a) {
  return mat2(cos(a), -sin(a), sin(a), cos(a)) * uv;
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

  vec3 color = vec3(0.0);

  float d = length(uv.zw);
  float nd = 25.0;
  float speed = t;
  float id = floor(speed + nd * d);
  float depth = stroke(fract(speed + nd * d), 0.5, 0.5, 0.01);

  float rot = ht * map(n11(id), 0.0, 1.0, -1.0, 1.0);
  vec2 gv = rotate2d(uv.zw, rot);
  float a = map(atan(gv.y, gv.x), -P, P, 0.0, 1.0);
  float ns = 51.0; 
  float w = map01(sin(t + floor(ns*a)), 0.1, 0.5);
  float stripe = stroke(fract(ns * a), 0.5, w, 0.01);

  color += stripe * depth;

  gl_FragColor = vec4(color, 1.0);
}
