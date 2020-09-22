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

vec2 map01(vec2 n, float start2, float stop2) {
  return (0.5 * n + 0.5) * (stop2 - start2) + start2;
}

float n21(vec2 p) {
  return fract(sin(p.x * 1234.56 + p.y * 7531.246) * 6901.749);
}

float circleSDF(vec2 uv) {
  return 2.0 * length(uv);
}

float fill(float x, float s, float p) {
  return 1.0 - S(s - p, s + p, x);
}

float stroke(float x, float s, float w, float p) {
  return clamp(
    S(s + p, s - p, x - 0.5 * w) * S(s - p, s + p, x + 0.5 * w),
    0.0, 1.0);
}

float ease(float x) {
  return x * x * (3.0 - 2.0 * x);
}

vec2 ease(vec2 x) {
  return x * x * (3.0 - 2.0 * x);
}

void main() {
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;

  uv.x *= 1.4;
  uv.x -= 0.2;
  float n = 7.0;
  vec2 gv = fract(n * uv.xy) - 0.5;
  vec2 id = floor(n * uv.xy);

  vec3 color = vec3(1.0);

  float speed = t;
  float r = map(n21(id), 0.0, 1.0, 0.125, 0.65);
  float stepper = step(1.0, mod(id.x + id.y, 2.0));
  vec2 offs = QP * mix(id, id.yx, stepper) / (n - 1.0);
  vec2 timer = speed + offs;
  vec2 eases = 0.5 * (1.0 - r) * sin(2.0 * timer + HP * sin(2.0 * timer));
  vec2 steppers = step(P, mod(timer, TP));
  vec2 offset = vec2(
    mix(eases.x, 0.0, steppers.x),
    mix(0.0, eases.y, steppers.y)
  );
  float circ = circleSDF(gv + offset);
  float pre = 0.01;
  float disc = fill(circ, r, pre);
  color -= disc;

  /* if (gv.x < -0.49 || gv.y < -0.49) {
    color = vec3(1.0, 0.0, 0.0);
  } */

  gl_FragColor = vec4(color, 1.0);
}
