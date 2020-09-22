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

float n21(vec2 p) {
  return fract(sin(p.x * 1234.56 + p.y * 7531.246) * 6901.749);
}

vec2 n22(vec2 p) {
  float n = n21(p);
  return vec2(n, n21(p + n));
}

vec2 rotate2d(vec2 uv, float a) {
  return mat2(cos(a), -sin(a), sin(a), cos(a)) * uv;
}

float circleSDF(vec2 uv) {
  return 2.0 * length(uv);
}

float fill(float x, float s, float p) {
  return 1.0 - S(s - p, s + p, x);
}

float fractsmooth(float x) {
  return abs(2.0 * fract(x) - 1.0);
}

void main() {
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;


  float n = 5.0;
  vec2 gv = fract(n * uv.zw) - 0.5; // gridUv
  vec2 id = floor(n * uv.zw);

  vec3 color = vec3(0.0);

  // GLOBAL
  float ns = 5.0;
  float w = 0.1;
  float pre = 0.05;
  // ARCS
  vec3 noise = step(0.5, vec3(n22(id), n21(id)));
  vec2 offset = mix(
    mix(vec2(0.5, 0.5), vec2(-0.5, 0.5), noise.x),
    mix(vec2(0.5, -0.5), vec2(-0.5, -0.5), noise.y),
    noise.z
  );
  float circ = circleSDF(gv + offset);
  float speed = t;
  float mixer = step(1.0, id.x) * step(id.x, n - 2.0) * step(1.0, id.y) * step(id.y, n - 2.0);
  mixer = mix(mixer, 1.0 - mixer, step(1.0, mod(speed, 2.0)));
  float zoom = S(0.25, 0.75, fract(mix(speed, -speed, mixer)));
  float arcs = fill(fractsmooth(zoom + 0.5 * ns * circ), w, pre);
  color += arcs;

  gl_FragColor = vec4(color, 1.0);
}
