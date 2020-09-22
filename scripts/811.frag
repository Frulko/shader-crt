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

// const ease = x => x * x * (3 - 2 * x);
float ease(float x) {
  return x * x * (3.0 - 2.0 * x);
}

void main() {
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;

  float n = 6.0;
  vec2 gv = fract(n * uv.zw);
  vec2 id = floor(n * uv.zw);

  vec3 color = vec3(0.25);

  float speed = t;
  float offset = n21(id);
  float factor = map(n21(id + 0.1), 0.0, 1.0, 0.5, 2.5);
  float timer = factor * speed + offset;
  float stepper = ease(abs(2.0 * fract(0.5 * timer) - 1.0));
  float x = mix(gv.y, gv.x, step(1.0, mod(timer, 2.0)));
  float rect = step(stepper, x);
  vec2 chroma = step(0.5, n22(id));
  color.r += 0.75 * rect;
  color.g += 0.25 * chroma.x * rect;
  color.b += 0.25 * chroma.y * rect;

  gl_FragColor = vec4(color, 1.0);
}
