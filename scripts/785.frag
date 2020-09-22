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

  vec3 color = vec3(1.0);

  float x = gv.y;
  float range = map01(cos(t + TP * id.y / (n - 1.0)));
  float w = map01(cos(t + P * gv.y), 0.05, 0.5);
  float mode = step(1.0, mod(id.y, 2.0));
  float offset = mix(
    cos(t + TP * uv.y),
    sin(-t + TP * uv.x),
    mode
  );
  float y = map01(
    sin(TP * uv.x + offset),
    0.5 * range + 0.5 * w, 1.0 - 0.5 * range - 0.5 * w
  );
  float wave = stroke(x, y, w, 0.025);
  color -= wave;

  gl_FragColor = vec4(color, 1.0);
}
