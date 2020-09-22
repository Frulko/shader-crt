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

vec2 rotateuv(vec2 uv, float a) {
  uv = mat2(cos(a), -sin(a), sin(a), cos(a)) * (uv - 0.5);
  return uv + 0.5;
}

float circleSDF(vec2 uv) {
  return 2.0 * length(uv);
  // return length(uv - 0.5) * 2.0;
}

float fill(float x, float s) {
  return 1.0 - step(s, x);
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

  uv.z *= 0.9;
  float n = 8.0;
  vec2 gv = fract(n * uv.zw);
  vec2 id = floor(n * uv.zw);

  vec3 color = vec3(0.0);

  float circ = circleSDF(gv - 0.5);
  float stepper = mix(
    0.25, 0.75,
    S(0.0, 0.5, map01(sin(2.0 * t)))
  );
  vec2 fs = vec2(
    map01(cos(t), -1.0, 1.0),
    map01(sin(t), -1.0, 1.0)
  );
  float angle = t
    + fs.x * TP * id.x / (n - 1.0)
    + fs.y * TP * id.y / (n - 1.0);
  vec2 masks = vec2(
    step(stepper, rotateuv(gv, angle).x),
    step(0.0, sin(2.0 + t + 0.25 * id.x + 0.5 * id.y + sin(-t + id.x)))
  );
  float draw = fill(circ, 0.85);
  float line = stroke(circ, 0.85, 0.05, 0.01);
  color += masks.x * draw;
  color += masks.y * line;

  gl_FragColor = vec4(color, 1.0);
}
