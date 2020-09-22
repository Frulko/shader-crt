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

void main() {
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;

  vec3 color = vec3(0.0);

  float n = 10.0;
  float id = floor(n * uv.x);
  float stepper = mod(id, 2.0);
  float offset = 0.5 * stepper
    + mix(1.0, -1.0, stepper) * S(0.25, 0.75, fract(ht - 0.5 * id / (n - 1.0)))
    + S(0.05, 0.95, fract(ht - uv.x));
  float ns = 12.0;
  float stripe = S(
    0.45, 0.55,
    abs(2.0 * fract(offset + ns * rotateuv(uv.xy, -0.9 * HP).y) - 1.0)
  );
  color += stripe;

  gl_FragColor = vec4(color, 1.0);
}
