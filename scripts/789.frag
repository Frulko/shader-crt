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

void main() {
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;

  uv.x *= 1.4;
  uv.x -= 0.2;
  float n = 6.0;
  vec2 gv = fract(n * uv.xy) - 0.5;
  vec2 id = floor(n * uv.xy);

  vec3 color = vec3(1.0);

  float circ = circleSDF(gv);
  float r = 1.0 - 0.05;
  float outer = stroke(circ, r, 0.1, 0.01);
  float inner = fill(circ, r, 0.01);
  float _off = id.x / (n - 1.0);
  float speed = 1.25 * t + _off;
  float s1 = S(0.25, 0.75, fract(speed));
  float s2 = s1 + 1.0;
  float offset = P * mix(s1, s2, step(1.0, mod(speed, 2.0)));
  float angle = HP * (id.x + id.y) + offset;
  float mask = step(0.0, rotate2d(gv, angle).x);
  float bound = 1.0;
  float margin = step(bound, id.x) * step(id.x, n - bound - 1.0)
    * step(bound, id.y) * step(id.y, n - bound - 1.0);
  color -= margin * (outer + mask * inner);

  gl_FragColor = vec4(color, 1.0);
}
