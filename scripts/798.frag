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

float fill(float x, float s, float p) {
  return 1.0 - S(s - p, s + p, x);
}

void main() {
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;

  float n = 13.0;
  vec2 gv = fract(n * uv.xy);
  vec2 id = floor(n * uv.xy) - 0.5 * (n - 1.0);

  vec3 color = vec3(0.0);

  float V = step(0.75 * abs(id.y) + 1.0, abs(id.x) - 1.0); // litteraly rendering a V
  float a = -0.25 * QP + P * S(0.25, 0.75, fract(ht));
  float stepper = step(1.0, mod(
    V * id.x + id.y, 2.0));
  float angle = mix(a, -a, stepper);
  vec4 offsets = vec4(0.25, 0.5, 0.75, 0.5);
  vec2 size = vec2(0.25, 1.0);
  vec2 rects = vec2(
    rectSDF(
      rotate2d(gv - offsets.xy, angle),
      size
    ),
    rectSDF(
      rotate2d(gv - offsets.zw, angle),
      size
    )
  );
  float opacity = 0.9;
  float render = fill(min(rects.x, rects.y), 1.05, 0.05);
  float margin = step(0.1, gv.y) * step(gv.y, 0.9);
  color += opacity * render;
  color *= margin;

  gl_FragColor = vec4(color, 1.0);
}
