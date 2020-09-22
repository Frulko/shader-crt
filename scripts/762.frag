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

#define t 0.25 * u_time
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

  float circ = circleSDF(uv.zw);
  float r = 0.65; // radius
  vec2 timers = vec2(
    S(0.35, 0.95, map01(cos(t))),
    S(0.35, 0.75, map01(sin(t)))
  );
  float w = map01(sin(2.0 * t
    + 2.0 * TP * uv.x
    - 1.0 * TP * uv.y
    + cos(-t + 2.5 * TP * uv.x * uv.y)
    - 5.0 * TP * dot(uv.x, uv.y)
    ), 0.075, 0.25); // weight/width
  float p = map01(cos(2.0 * t
    - 2.0 * TP * uv.x
    + 5.0 * TP * uv.y
    + QP * sin(t + 3.0 * TP * uv.x * uv.y)
    ), 0.025, 0.2
  ); // precision
  float render = stroke(
    circ, r,
    mix(w, 0.35, timers.x),
    mix(p, 0.02, timers.y)
  );
  color -= render;



  gl_FragColor = vec4(color, 1.0);
}
