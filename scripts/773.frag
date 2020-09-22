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

void main() {
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;

  uv.x *= 1.4;
  uv.x -= 0.2;
  float speed = t;
  float thresold = P;
  float mode = step(thresold, mod(speed, 2.0 * thresold));
  vec2 bounds = vec2(2.0, 6.0);
  float div = mix(1.0, bounds.y - bounds.x, mode);
  float w = map(mod(speed, thresold / div), 0.0, thresold / div, 0.45, 1.0);
  float n = floor(map(mod(speed, thresold), 0.0, thresold, bounds.x, bounds.y)) + w;
  vec2 gv = fract(n * uv.xy);
  vec2 id = floor(n * uv.xy);

  vec3 color = vec3(1.0);

  color -= step(gv.x, w);
  color -= step(gv.y, w);

  gl_FragColor = vec4(color, 1.0);
}
