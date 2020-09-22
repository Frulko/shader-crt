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

vec2 map01(vec2 n, float start2, float stop2) {
  return (0.5 * n + 0.5) * (stop2 - start2) + start2;
}

float rectSDF(vec2 uv) {
  return 2.0 * max(abs(uv.x), abs(uv.y));
}

void main() {
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;

  vec3 color = vec3(0.0);

  uv.x *= 1.4;
  uv.x -= 0.2;
  float _rect = rectSDF(uv.xy - 0.5);
  float n = 8.0;
  float id = floor(n * _rect);
  id = n - id - 1.0;
  vec2 space = vec2(id / (2.0 * n));
  vec2 x1 = space;
  vec2 x2 = 1.0 - space;
  vec2 y1 = vec2(0.0);
  vec2 y2 = vec2(1.0);
  vec2 slant = (y2 - y1) / (x2 - x1);
  vec2 origin = (x2 * y1 - x1 * y2) / (x2 - x1);
  vec2 rv = slant * uv.xy + origin;

  float speed = TP * m.x;
  speed = P;
  speed = t;
  float id1 = (id + 1.0) / (2.0 * n);
  vec2 steppers = map01(vec2(
    cos(speed + HP * id / (n - 1.0)),
    sin(speed - HP * id / (n - 1.0))
  ), id1, 1.0 - id1);
  color += mix(
    step(steppers.x, uv.x),
    1.0 - step(steppers.y, uv.x),
    mod(id, 2.0)
    // step(1.0, mod(id, 2.0))
  );

  gl_FragColor = vec4(color, 1.0);
}
