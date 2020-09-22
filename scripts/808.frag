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

float circleSDF(vec2 uv) {
  return 2.0 * length(uv);
}

float rectSDF(vec2 uv) {
  return 2.0 * max(abs(uv.x), abs(uv.y));
}

float fill(float x, float s, float p) {
  return 1.0 - S(s - p, s + p, x);
}

float render(vec2 uv, float speed, vec2 chroma) {
  float ease = speed + cos(P * speed);
  float parts = 5.0;
  float timer = mod(ease, parts);
  float easef1 = fract(ease);
  float radius = 0.25;
  float range = 0.5 - 0.5 * radius - 0.02;
  vec2 offset;
  if (timer <= 1.0) {
    radius = map(
      S(0.0, 0.5, easef1) * S(0.5, 0.0, easef1 - 0.5),
      0.0, 1.0, radius, 1.0);
    offset = vec2(0.0);
  } else if (timer <= 2.0) {
    offset = vec2(S(0.0, 1.0, easef1));
  } else if (timer <= 3.0) {
    offset = vec2(
      1.0,
      2.0 * S(1.0, 0.0, easef1) - 1.0
    );
  } else if (timer <= 4.0) {
    offset = vec2(
      2.0 * S(1.0, 0.0, easef1) - 1.0,
      -1.0
    );
  } else {
    offset = vec2(S(0.0, 1.0, easef1) - 1.0);
  }
  // offset = vec2(m - 0.5);
  float rect = rectSDF(uv + range * (offset + chroma));
  return fill(rect, radius, 0.0125);
}

void main() {
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;

  vec3 color = vec3(1.0);

  // VIGNETTE
  float circ = circleSDF(uv.zw);
  float vignette = 1.0 - fill(circ, 0.75, 0.35);

  // RECTS
  float speed = 0.75 * t;
  float chroma = map01(sin(2.0 * speed + cos(-speed + P * uv.z) + HP * uv.w), 0.01, 0.05);
  vec3 shapes = vec3(
    render(uv.zw, speed, vec2(-chroma, 0.0)),
    render(uv.zw, speed, vec2(0.0)),
    render(uv.zw, speed, vec2(chroma, 0.0))
  );

  // RENDER
  color -= 0.45 * vignette;
  color -= shapes;

  gl_FragColor = vec4(color, 1.0);
}
