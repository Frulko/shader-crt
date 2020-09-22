#ifdef GL_ES
  precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define QP 0.785398163397448
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

float n11(float p) {
  return fract(97531.2468 * sin(24680.135 * p));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 uv0 = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  vec3 color = vec3(0.0);

  float circ = length(uv0);
  float a = map(atan(uv0.y, uv0.x), -P, P, 0.0, 1.0);
  float speed = 0.001 * map01(sin(tt), 1.0, 2.0);
  vec3 offsets = 0.01 * vec3(
    map01(sin(t + QP * uv.x), -1.0, 1.0),
    map01(sin(t + QP * uv.y + cos(-t)), -1.0, 1.0),
    map01(cos(t + QP * (uv.x + uv.y)), -1.0, 1.0)
  );
  vec3 factors = speed * cos(ht + circ + offsets);
  float REP = 250.0;
  vec3 rep = factors + REP;
  color.r += circ + n11(floor(t + rep.x * a) / rep.x);
  color.g += circ + n11(floor(t + rep.y * a) / rep.y);
  color.b += circ + n11(floor(t + rep.z * a) / rep.z);

  gl_FragColor = vec4(color, 1.0);
}
