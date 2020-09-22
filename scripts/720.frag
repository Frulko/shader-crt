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

vec2 rotateuv(vec2 uv, float a) {
  uv = mat2(cos(a), -sin(a), sin(a), cos(a)) * (uv - 0.5);
  return uv + 0.5;
}

void main() {
  /* vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 uv0 = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y; */
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;

  vec3 color = vec3(0.0);

  float n = 21.0;
  float circ = 2.0 * length(uv.zw);
  float angle = QP * mix(cos(-tt + sin(ht)), sin(tt + sin(ht)), circ);
  vec2 gv = 2.0 * abs(fract(n * rotateuv(uv.xy, angle)) - 0.5);
  float w = map01(sin(t), 0.1, 0.9);
  float x = mix(
    w, 1.0 - w,
    S(map01(sin(t - TP * uv.y), 0.0, 0.5), map01(cos(t + P * uv.y), 0.5, 1.0), uv.x)
  );
  vec3 p = vec3(
    map01(cos(t + sin(t) + QP * uv.x), 2.0, 1.0),
    0.25,
    map01(cos(t + HP * uv.y), 0.0, 1.0)
  );
  color += S(x - p, x + p, vec3(gv.y));

  gl_FragColor = vec4(color, 1.0);
}
