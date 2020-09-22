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

float polySDF(vec2 uv, float n) {
  // uv = 2.0 * uv - 1.0;
  float a = atan(uv.x, uv.y) + P;
  float r = length(uv);
  n = TP / n;
  return 2.0 * r * cos(floor(0.5 + a / n) * n - a);
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

  uv.zw += 0.5;
  float n = 9.0;
  float nn = n / 3.0;
  vec2 gv = fract(n * uv.zw) - 0.5;
  vec2 id = floor(n * uv.zw);
  vec2 ggv = fract(nn * uv.zw) - 0.5;
  vec2 iid = floor(nn * uv.zw);

  vec3 color = vec3(1.0);

  /* vec2 factors = vec2(
    cos(t),
    sin(t)
  );
  iid *= factors; */
  float speed = t * mix(1.0, -1.0, mod(-iid.x - iid.y, 2.0));
  speed += 0.5 * mod(-iid.x - iid.y, 2.0);
  speed += 0.075 * mod(id.x + id.y, 2.0);
  float wave = HP * (floor(speed) + S(floor(speed) + 0.25, floor(speed) + 0.75, speed));

  float angle = map(mod(iid.x + iid.y, nn), 0.0, nn, 0.0, TP);
  float offset = wave;
  vec2 rv = rotate2d(gv + vec2(0.0, 0.125), angle + offset);
  float tri = polySDF(rv, 3.0);
  float draw = stroke(tri, 0.3, 0.2, 0.025);
  float margin = 1.0 - (step(id.x, 0.0) + step(n - 1.0, id.x) + step(id.y, 0.0) + step(n - 1.0, id.y));
  color -= margin * draw;

  gl_FragColor = vec4(color, 1.0);
}
