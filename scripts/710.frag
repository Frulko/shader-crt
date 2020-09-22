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

vec2 rotate2d(vec2 uv, float a) {
  return mat2(cos(a), -sin(a), sin(a), cos(a)) * uv;
}

float stroke(float x, float s, float w, float p) {
  return clamp(
    S(s + p, s - p, x - 0.5 * w) * S(s - p, s + p, x + 0.5 * w),
    0.0, 1.0);
}

float circleSDF(vec2 uv) {
  return 2.0 * length(uv);
  // return length(uv - 0.5) * 2.0;
}

float rectSDF(vec2 uv, vec2 s) {
  // uv = 2.0 * uv - 1.0;
  return 2.0 * max(abs(uv.x / s.x), abs(uv.y / s.y));
}

float ease(float x, float t) {
  return pow(cos(HP * x), t);
}

void main() {
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);

  float n = 8.0;
  vec2 gv = fract(n * uv.zw);
  vec2 id = floor(n * uv.zw);

  vec3 color = vec3(0.0);

  float circ = circleSDF(uv.zw);
  float rect = rectSDF(uv.zw, vec2(1.0));
  float grid = ease(map01(sin(t + QP * uv.z * uv.w), 0.0, 1.0), 4.0);
  float shape = mix(
    fract(-ht + 2.0 * circ),
    fract(ht + 4.0 * rect),
    map01(cos(ht + grid * (id.x + id.y)), 0.0, 1.0)
  );
  color += vec3(0.5, 0.6, 0.91) * stroke(shape, 0.5, 0.1, 0.05);
  vec3 pal1 = mix(
    vec3(0.44, 0.56, 0.95),
    vec3(0.055, 0.18, 0.57),
    grid
  );
  color += mix(color, pal1, stroke(shape, 0.5, 0.2, 0.2));

  gl_FragColor = vec4(color, 1.0);
}
