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

float n11(float p) {
  return fract(97531.2468 * sin(24680.135 * p));
}

void main() {
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;

  vec3 color = vec3(0.0, 0.35, 0.35);

  float a = map(atan(uv.w, uv.z), -P, P, 0.0, 1.0);
  float circ = length(uv.zw);
  vec2 circs = step(circ, vec2(0.125, 0.4));
  float ns = 71.0;
  vec2 factors = vec2(
    map01(cos(t), 0.1, 0.9),
    map01(sin(t), 1.0, 2.5)
  );
  float offset = step(factors.x, fract(ht + factors.y * length(uv.zw)));
  float stripe = S(0.85, 1.0, abs(2.0 * fract(ns * a - 0.5) - 1.0));
  float id = floor(ns * a);
  float noise = n11(id + offset);
  color.r += 0.95 * noise;
  // color += offset;

  gl_FragColor = vec4(color, 1.0);
}
