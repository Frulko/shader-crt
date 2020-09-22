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

float map01(float n, float start2, float stop2) {
  return (0.5 * n + 0.5) * (stop2 - start2) + start2;
}

float n21(vec2 p) {
  return fract(sin(p.x * 100. + p.y * 523.) * 6901.);
}

vec2 rotate2d(vec2 uv, float a) {
  uv = mat2(cos(a), -sin(a), sin(a), cos(a)) * uv;
  return uv;
}

float rectSDF(vec2 uv, vec2 s) {
  return 2.0 * max(abs(uv.x / s.x), abs(uv.y / s.y));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 uv0 = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  uv0.x -= 0.06;
  float n = 6.0;
  vec2 gv = fract(n * uv0) - 0.5;
  vec2 id = ceil(n * uv0);

  vec3 color = vec3(
    0.5 * cos(t),
    0.25 * sin(t),
    0.25
  );

  float rect = rectSDF(gv, vec2(0.8));
  float mask = step(rect, 1.0);
  float flow = atan(id.y, id.x);
  float angle = t + sin(-t + 0.25 * id.x) + flow;
  gv = rotate2d(gv, angle);
  float draw = map(atan(gv.y, gv.x), -P, P, 0.0, 1.0);
  color += draw;
  color = mix(vec3(1.0), color, mask);

  gl_FragColor = vec4(color, 1.0);
}
