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

vec2 map(vec2 n, float start1, float stop1, float start2, float stop2) {
  return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
}

float map01(float n) {
  return 0.5 * n + 0.5;
}

float map01(float n, float start2, float stop2) {
  return (0.5 * n + 0.5) * (stop2 - start2) + start2;
}

float n21(vec2 p) {
  return fract(sin(p.x * 1234.56 + p.y * 7531.246) * 6901.749);
}

vec2 n22(vec2 p) {
  float n = n21(p);
  return vec2(n, n21(p + n));
}

float circleSDF(vec2 uv) {
  return 2.0 * length(uv);
}

float fill(float x, float s, float p) {
  return 1.0 - S(s - p, s + p, x);
}

void main() {
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;

  vec3 color = vec3(0.0);

  float zoom = 1.0 - circleSDF(uv.zw);
  float speed = 2.0 * t + zoom + P;
  float n = map(S(0.0, 0.9, map01(sin(speed))), 0.0, 1.0, 10.0, 100.0);
  vec2 gv = fract(n * uv.zw) - 0.5;
  vec2 id = floor(n * uv.zw);

  float f = map(
    max(-0.5, sin(speed - zoom + HP)),
    -0.5, 1.0, 0.0, 1.0
  );
  float r = f * map(n21(id), 0.0, 1.0, 0.1, 0.25);
  vec2 offset = map(n22(id), 0.0, 1.0, 0.5 - 0.5 * r, -0.5 + 0.5 * r);
  float circ = circleSDF(gv + offset);
  float star = fill(circ, r, 0.01);
  color += star;

  /* if (gv.x < -0.475 || gv.y < -0.475) {
    color = vec3(1.0, 0.0, 0.0);
  } */

  gl_FragColor = vec4(color, 1.0);
}
