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

float rectSDF(vec2 uv) {
  return 2.0 * max(abs(uv.x), abs(uv.y));
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

  vec3 color = vec3(0.0);

  // GLOBAL
  float speed = t;
  float ns = 12.0;
  float w = 0.1;
  float pre = 0.01;

  // STRIPES HORIZONTAL
  float x0 = abs(2.0 * fract(m.x + m.y * 2.0 * ns * uv.w) - 1.0);
  float stripesh = stroke(x0, 0.5, w, pre);
  stripesh = fill(x0, w, pre);

  // MASK
  float sdf = rectSDF(rotate2d(uv.zw, QP));
  float r = 0.5;
  float rect = fill(sdf, r, 0.0001);
  rect = mix(rect, 1.0 - rect, 
    S(0.25, 0.75, map01(sin(speed))));

  // STRIPES CROSSED
  float stepper = step(0.0, uv.z * uv.w);
  // uv.z *= 1.41;
  vec2 rv = rotate2d(uv.zw, rect*mix(QP, -QP, stepper));
  float x1 = abs(2.0 * fract(speed + ns * rv.x) - 1.0);
  float stripesc = stroke(x1, m.x, w, pre);
  stripesc = fill(x1, w, pre);

  // RENDER
  // color += mix(stripesh, stripesc, rect);
  color += stripesc;

  gl_FragColor = vec4(color, 1.0);
}
