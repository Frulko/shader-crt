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

vec4 map01(vec4 n) {
  return 0.5 * n + 0.5;
}

float map01(float n, float start2, float stop2) {
  return (0.5 * n + 0.5) * (stop2 - start2) + start2;
}

float n21(vec2 p) {
  return fract(sin(p.x * 1234.56 + p.y * 7531.246) * 6901.749);
}

vec2 rotateuv(vec2 uv, float a) {
  uv = mat2(cos(a), -sin(a), sin(a), cos(a)) * (uv - 0.5);
  return uv + 0.5;
}

float circleSDF(vec2 uv) {
  return 2.0 * length(uv);
  // return length(uv - 0.5) * 2.0;
}

float rectSDF(vec2 uv, vec2 s) {
  // uv = 2.0 * uv - 1.0;
  return 2.0 * max(abs(uv.x / s.x), abs(uv.y / s.y));
}

float capsuleSDF(vec2 uv, float r1, float r2, float h) {
  uv.x = abs(uv.x);
  float b = (r1 - r2) / h;
  float a = sqrt(1.0 - b * b);
  float k = dot(uv, vec2(-b, a));
  if (k < 0.0) {
    return length(uv) - r1;
  } else if (k > a * h) {
    return length(uv - vec2(0.0, h)) - r2;
  }
  return dot(uv, vec2(a, b)) - r1;
}

float capsuleSDF(vec2 uv, float r, float h) {
  uv.x = abs(uv.x);
  float b = 0.0;
  float a = 1.0;
  float k = dot(uv, vec2(-b, a));
  if (k < 0.0) {
    return length(uv) - r;
  } else if (k > a * h) {
    return length(uv - vec2(0.0, h)) - r;
  }
  return dot(uv, vec2(a, b)) - r;
}

float fill(float x, float s, float p) {
  return 1.0 - S(s - p, s + p, x);
}

float computeStars(vec2 uv, float n, float s, float rot) {
  uv = rotateuv(uv + vec2(0.0, 0.5), rot);
  vec2 gv = fract(n * uv);
  vec2 id = floor(n * uv);
  float gcirc = circleSDF(gv - 0.5);
  float mode = n21(0.01 * id + 0.1);
  float r = max(0.5 * n21(0.1 * id), 300.0 / u_resolution.x);
  float stars = step(s, mode) * fill(gcirc, r, 0.75);
  return stars;
}

void main() {
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;

  vec3 color = vec3(0.0);

  uv.z *= 0.9;
  
  // ===
  // BACK
  // ===
  // SKY
  vec3 pal1 = vec3(0.19, 0.195, 0.234);
  vec3 pal2 = vec3(0.098, 0.098, 0.1059);
  vec3 sky = mix(pal1, pal2, uv.y - 0.25 * uv.x);
  // STARS
  vec3 pal3 = vec3(0.5137, 0.6549, 0.9529);
  vec4 ns = vec4(75.0, 120.0, 150.0, 200.0);
  vec4 stars = vec4(
    computeStars(uv.xy, ns.x, 0.999, 0.5 * tt),
    computeStars(uv.xy, ns.y, 0.995, 0.25 * tt),
    computeStars(uv.xy, ns.z, 0.9925, 0.2 * tt),
    computeStars(uv.xy, ns.w, 0.99, 0.1 * tt)
  );
  vec4 lights = map01(vec4(
    cos(3.0 * t + floor(ns.x * uv.xy).x),
    cos(2.0 * t + floor(ns.y * uv.xy).y),
    sin(2.5 * t + floor(ns.z * uv.xy).x),
    sin(1.0 * t + floor(ns.w * uv.xy).y)
  ));
  vec3 celeste = pal3 * (stars.x + stars.y + stars.z + stars.w)
    + lights.x * stars.x
    + lights.y * stars.y
    + lights.z * stars.z
    + lights.w * stars.w;

  // ===
  // FRONT
  // ===
  // GRADIENT
  vec3 pal4 = vec3(0.945, 0.859, 0.9375);
  vec3 pal5 = vec3(0.508, 0.723, 0.82);
  vec3 gradient = mix(pal4, pal5, 1.25 * pow(2.0 * uv.w, 2.0));
  // SUN
  float speed = t;
  // speed = TP * m.x;
  float ease = tan(-0.25 * P * speed) / (6.0 * TP);
  // ease = 0.0;
  vec2 offset = vec2(ease,
    map(abs(ease), 0.0, 4.0, -0.1, 0.5)
  );
  float circ = circleSDF(uv.zw + offset);
  float sun = fill(circ, 0.125, 0.05);
  // REFLECT
  float mixer = map(uv.y, 0.0, 1.0, 1.0, -0.75);
  vec2 ranges = vec2(0.25, 5.0);
  float x = mix(
    map(ease, 1.0, -1.0, -ranges.x, ranges.x),
    map(ease, 1.0, -1.0, -ranges.y, ranges.y),
    mixer
  );
  float rect0 = rectSDF(
    uv.zw + vec2(x, 0.25),
    vec2(0.75 * (1.0 - uv.y) * mixer, 0.55)
  );
  float reflect = 1.25 * uv.y * S(0.375, 0.25, uv.y) * fill(rect0, 1.0, 0.25);
  // DOOR
  float caps = capsuleSDF(uv.zw + vec2(0.0, 0.125), 0.001, 0.3);
  float door = fill(caps, 0.2, 0.01);
  // GROUND
  vec2 size = vec2(map(uv.y, 0.0, 1.0, 1.5, -1.5), 0.55);
  float rect = rectSDF(uv.zw + vec2(0.0, 0.25), size);
  float ground = fill(rect, 1.0, 0.1);
  // MASK
  float mask = max(door, ground);

  // ===
  // RENDER
  // ===
  // COMPOSE
  vec3 back = max(sky, celeste);
  vec3 front = max(gradient, sun) + reflect;
  vec3 render = mix(back, front, mask);
  color += render;

  gl_FragColor = vec4(color, 1.0);
}
