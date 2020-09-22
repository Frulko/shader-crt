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
  float a = atan(uv.x, uv.y) + P;
  float r = length(uv);
  n = TP / n;
  return 2.0 * r * cos(floor(0.5 + a / n) * n - a);
}

float fill(float x, float s) {
  return 1.0 - step(s, x);
}

void main() {
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;

  vec3 color = vec3(0.0);

  float speed = t;
  float amp = 2.0 * TRP;
  float angle = amp * S(0.5, 1.0, fract(-speed / amp));
  float tri = polySDF(rotate2d(uv.zw, angle), 3.0);
  float ns = map01(sin(P * speed), 4.0, 8.0);
  float offset = S(0.2, 0.8, fract(-0.5 * speed));
  float render = fill(fract(offset + ns * tri), tri);
  color += render;

  gl_FragColor = vec4(color, 1.0);
}
