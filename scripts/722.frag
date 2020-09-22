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

vec2 rotateuv(vec2 uv, float a) {
  uv = mat2(cos(a), -sin(a), sin(a), cos(a)) * (uv - 0.5);
  return uv + 0.5;
}

float rectSDF(vec2 uv, vec2 s) {
  // uv = 2.0 * uv - 1.0;
  return 2.0 * max(abs(uv.x / s.x), abs(uv.y / s.y));
}

float fill(float x, float s, float p) {
  return 1.0 - S(s - p, s + p, x);
}

float stroke(float x, float s, float w, float p) {
  return clamp(
    S(s + p, s - p, x - 0.5 * w) * S(s - p, s + p, x + 0.5 * w),
    0.0, 1.0);
}

float render(vec2 uv, vec2 uv0, float offset) {
  float timer = pow(sin(HP * t + 0.125 * TP * offset), 2.0);
  float rect = rectSDF(uv0, vec2(1.0));
  vec2 sizes = vec2(
    map(timer, 0.0, 1.0, 0.65, 0.4),
    map(timer, 0.0, 1.0, 0.0, 0.35)
  );
  vec2 masks = vec2(
    fill(rect, sizes.x, 0.01),
    1.0 - fill(rect, sizes.y, 0.01)
  );
  float ns = 5.0;
  float x = clamp(1.0 - timer, 0.0, 0.5); // 0.5 -> 0.0
  float w = 0.1 * x; // 0.05 -> 0.0
  float strips = S(
    x - w, x + w,
    map01(cos(cos(t - HP * timer + P * uv.x) + ns * TP * rotateuv(uv, -QP).x))
  );
  return masks.x * masks.y * strips;
}

void main() {
  /* vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 uv0 = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y; */
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;

  float n = 8.0;
  vec2 gv = fract(n * uv.zw);
  vec2 id = floor(n * uv.zw);

  vec3 color = vec3(1.0);

  float o = map01(sin(2.0 * t + cos(-t)), 0.05, 0.5) * dot(uv.x, uv.y);
  color.r -= render(uv.xy, uv.zw, o - 0.25);
  color.g -= render(uv.xy, uv.zw, o - 0.1);
  color.b -= render(uv.xy, uv.zw, o);

  gl_FragColor = vec4(color, 1.0);
}
