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

float stroke(float x, float s, float w, float p) {
  return clamp(
    S(s + p, s - p, x - 0.5 * w) * S(s - p, s + p, x + 0.5 * w),
    0.0, 1.0);
}

void main() {
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;

  vec3 color = vec3(1.0);

  // GLOBAL
  float speed = t;
  float pre = 0.01;

  // MASK
  vec2 angles = vec2(
    -0.5 * QP,
    0.5 * QP
  );
  vec4 sizes = vec4(
    0.5,
    0.5,
    map01(cos(P * speed), 0.5, 0.75),
    map01(cos(P * speed), 1.0, 0.75)
  );
  vec4 rects = vec4(
    rectSDF(rotate2d(uv.zw, angles.x), vec2(sizes.x, 2.0)),
    rectSDF(rotate2d(uv.zw, angles.y), vec2(sizes.y, 2.0)),
    rectSDF(uv.zw, vec2(1.0, sizes.z)),
    rectSDF(uv.zw, vec2(1.0, sizes.w))
  );
  vec2 skews = vec2(
    fill(rects.x, 1.0, pre) * fill(rects.z, 1.0, pre),
    fill(rects.y, 1.0, pre) * fill(rects.w, 1.0, pre)
  );
  
  // STRIPES
  float ns = 8.0;
  vec2 offsets = S(0.25, 0.75, fract(vec2(0.5 * speed, -0.5 * speed + 0.25)));
  vec2 ys = abs(fract(2.0 * (offsets + ns * uv.y) - 1.0));
  vec2 ws = vec2(
    /* mix(uv.y, 1.0 - uv.y, map01(cos(2.0 * speed))),
    mix(uv.y, 1.0 - uv.y, map01(sin(2.0 * speed + sin(speed + cos(-speed))))) */
    mix(uv.y, 1.0 - uv.y,
      S(0.25, 0.75, abs(2.0 * fract(0.5 * speed) - 1.0))),
    mix(uv.y, 1.0 - uv.y,
      S(0.25, 0.75, abs(2.0 * fract(-speed) - 1.0)))
  );
  vec2 stripes = vec2(
    stroke(ys.x, 0.5, ws.x, pre),
    stroke(ys.y, 0.5, ws.y, pre)
  );

  color -= skews.x * stripes.x;
  color -= skews.y * stripes.y;

  gl_FragColor = vec4(color, 1.0);
}
