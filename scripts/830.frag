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

float rectSDF(vec2 uv, vec2 s) {
  return 2.0 * max(abs(uv.x / s.x), abs(uv.y / s.y));
}

float linkSDF(vec2 uv, float le, float r1) {
  vec2 m = u_mouse / u_resolution;
  vec2 q = vec2(uv.x, max(abs(uv.y) - le, 0.0));
  return 2.0 * length(vec2(length(q) - r1));
}

float fill(float x, float s, float p) {
  return 1.0 - S(s - p, s + p, x);
}

vec2 fill(vec2 x, float s, float p) {
  return 1.0 - S(s - p, s + p, x);
}

void main() {
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;

  float n = 8.0;
  vec2 gv = fract(n * uv.xy);
  vec2 id = floor(n * uv.xy);

  vec3 color = vec3(0.0);

  float speed = t;
  float angle = -HP * mix(
    S(0.25, 0.5, mod(speed, 2.0)),
    S(0.5, 0.75, mod(speed, 2.0) - 1.0) + 1.0,
    step(1.0, mod(speed, 2.0))
  );
  vec4 rvs = vec4(
    rotate2d(uv.zw, angle + QP),
    rotate2d(uv.zw, angle - QP)
  );
  float height = map(mix(
    smoothstep(0.75, 0.5, mod(speed - 0.5, 2.0)),
    smoothstep(0.35, 0.75, mod(speed - 1.5, 2.0)),
    step(1.0, mod(speed - 0.5, 2.0))
  ), 0.0, 1.0, 0.3, 0.1);
  vec4 links = vec4(
    linkSDF(rvs.xy, height, 0.075),
    linkSDF(rvs.zw, height, 0.075),
    linkSDF(rvs.zw, height, 0.005),
    linkSDF(rvs.zw, height, 0.075)
  );
  vec2 shapes = fill(links.xy, 0.1, 0.01);
  float patch = fill(links.z, 0.2, 0.0075);
  float shadow = fill(links.w, 0.15, 0.125);
  color += max(shapes.x - patch - max(shadow, patch), shapes.y);

  gl_FragColor = vec4(color, 1.0);
}
