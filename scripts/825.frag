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

vec2 rotate2d(vec2 uv, float a) {
  return mat2(cos(a), -sin(a), sin(a), cos(a)) * uv;
}

float rectSDF(vec2 uv, vec2 s) {
  return 2.0 * max(abs(uv.x / s.x), abs(uv.y / s.y));
}

float fill(float x, float s, float p) {
  return 1.0 - S(s - p, s + p, x);
}

void main() {
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;

  vec2 n = vec2(4.0, 8.0);
  vec2 gv = fract(n * uv.zw) - 0.5;
  vec2 id = floor(n * uv.zw);

  vec3 color = vec3(1.0);

  float factor = S(0.25, 0.75, map01(sin(t + QP * id.y / (n.y - 1.0)))) - 0.5;
  float angle = factor * QP * mix(1.0, -1.0, step(1.0, mod(id.x, 2.0)));
  float rect = rectSDF(rotate2d(gv, angle), vec2(1.5, 0.5));
  float rectf = fill(rect, 1.0, 0.01);
  float ns = 21.0;
  float stripes = fill(fract(ns * gv.x), 0.25, 0.01);
  float render = mix(
    rectf,
    rectf * stripes,
    step(1.0, mod(id.x + id.y, 2.0))
  );
  color -= render;

  gl_FragColor = vec4(color, 1.0);
}
