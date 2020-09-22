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

  float n = 8.0;
  vec2 gv = fract(n * uv.xy);
  vec2 id = floor(n * uv.xy);

  vec3 color = vec3(0.0);

  float circ = circleSDF(uv.zw);
  vec3 circs = vec3(
    stroke(circ, 0.25, 0.1, 0.025),
    stroke(circ, 0.55, 0.1,  0.025),
    stroke(circ, 0.75, 0.1,  0.025)
  );
  vec3 angles = vec3(
    TP * fract(ht + sin(t)) + cos(t),
    TP * S(0.45, 1.0, fract(-ht)) + cos(ht),
    TP * S(0.125, 0.8, fract(ht))
  );
  color += S(-0.05, 0.05, rotate2d(uv.zw, angles.x).x) * circs.x;
  color += (1.0 - S(-0.05, 0.05, rotate2d(uv.zw, angles.y).x)) * circs.y;
  color += (S(-0.05, 0.05, rotate2d(uv.zw, angles.z).x)) * circs.z;

  gl_FragColor = vec4(color, 1.0);
}
