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

vec2 rotateuv(vec2 uv, float a) {
  uv = mat2(cos(a), -sin(a), sin(a), cos(a)) * (uv - 0.5);
  return uv + 0.5;
}

float stroke(float x, float s, float w, float p) {
  return clamp(
    S(s + p, s - p, x - 0.5 * w) * S(s - p, s + p, x + 0.5 * w),
    0.0, 1.0);
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
  float n = 8.0;
  vec2 gv = fract(n * uv.xy);
  vec2 id = floor(n * uv.xy);

  vec3 color = vec3(0.0);

  // LINE
  vec2 offsets = vec2(
    P * id.x / (n - 1.0),
    TP * id.y / (n - 1.0)
  );
  float x = map01(sin(t + offsets.x), 0.25, 0.75); // position
  float angle = map01(cos(2.0 * t + offsets.y + cos(-t)), -QP, QP);
  float y = rotateuv(gv, angle).x;
  float line = stroke(x, y, 0.1, 0.01);
  // MARGIN
  float bound = 1.0;
  float margin = step(bound, id.x) * step(id.x, n - bound - 1.0)
    * step(bound, id.y) * step(id.y, n - bound - 1.0);

  color += margin * line;

  gl_FragColor = vec4(color, 1.0);
}
