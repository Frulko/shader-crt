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

float rectSDF(vec2 uv, vec2 s) {
  return 2.0 * max(abs(uv.x / s.x), abs(uv.y / s.y));
}

void main() {
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;

  vec3 color = vec3(0.0);

  vec2 size = vec2(
    map01(cos(t + sin(t + P * uv.x)), 0.5, 1.0),
    map01(sin(t - P * uv.x + P * uv.y), 0.75, 1.5)
  );
  // size = m;
  float rect = rectSDF(uv.zw, size);
  vec2 bounds = vec2(
    map01(cos(t), 8.0, 12.0),
    map01(cos(-t + sin(t)), 4.0, 6.0)
  );
  float ns = map(rect, 0.0, 1.0, bounds.y, bounds.x);
  float w = map01(sin(t + P * uv.y), 0.15, 0.475);
  float p = 0.025;
  float stripe = S(
    w - p, w + p,
    abs(2.0 * fract(ht + ns * uv.z) - 1.0)
  );
  color += stripe;

  gl_FragColor = vec4(color, 1.0);
}
