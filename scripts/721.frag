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

vec2 map(vec2 n, float start1, float stop1, float start2, float stop2) {
  return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
}

float map01(float n, float start2, float stop2) {
  return (0.5 * n + 0.5) * (stop2 - start2) + start2;
}

void main() {
  /* vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 uv0 = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y; */
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;

  uv.zw = map(uv.zw, -1.0, 1.0, -0.1, 1.1);
  float n = 4.0;
  vec2 gv = fract(n * uv.zw) - 0.5;
  vec2 id = floor(n * uv.zw);

  vec3 color = vec3(1.0);

  vec2 angles = vec2(map(vec2(
    atan(gv.y - 0.5, gv.x + 0.5),
    atan(gv.y + 0.5, gv.x - 0.5)
  ), -P, P, 0.0, 1.0));
  float timer = t;
  float offset = P * id.y / (n - 1.0);
  vec2 masks = vec2(
    step(angles.x, map01(sin(timer + offset), 0.25, 0.3762)),
    step(angles.y, map01(sin(timer + offset), 0.75, 0.8762))
  );
  vec2 borders = vec2(
    step(0.0, uv.z) * step(uv.z, 1.0) * step(0.0, uv.w) * step(uv.w, 1.0),
    step(-0.45, gv.x) * step(gv.x, 0.45) * step(-0.45, gv.y) * step(gv.y, 0.45)
  );
  color -= borders.x * borders.y * (masks.x * step(0.5, fract(50.0 * angles.x)) + masks.y * step(0.5, fract(50.0 * angles.y)));

  gl_FragColor = vec4(color, 1.0);
}
