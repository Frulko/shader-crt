#ifdef GL_ES
  precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

#define QP 0.785398163397448
#define TRP 1.047197551196597
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

float n21(vec2 p) {
  return fract(sin(p.x * 100. + p.y * 523.) * 6901.);
}

vec2 n22(vec2 p) {
  float n = n21(p);
  return vec2(n, n21(p + n));
}

vec2 rotateuv(vec2 uv, float a) {
  uv = mat2(cos(a), -sin(a), sin(a), cos(a)) * (uv - 0.5);
  return uv + 0.5;
}

vec2 rotate2d(vec2 uv, float a) {
  uv = mat2(cos(a), -sin(a), sin(a), cos(a)) * uv;
  return uv;
}

float fill(float x, float s) {
  return 1.0 - step(s, x);
}

float stroke(float x, float s, float w, float p) {
  p *= 0.01;
  return clamp(
    S(s + p, s - p, x - 0.5 * w) * S(s - p, s + p, x + 0.5 * w),
    0.0, 1.0);
}

float hexDist(vec2 p) {
	p = abs(p);
  float c = dot(p, normalize(vec2(1, 1.73)));
  c = max(c, p.x);
  return c;
}

vec4 hexCoords(vec2 uv, float rot) {
	vec2 r = vec2(1, 1.73);
  vec2 h = 0.5 * r;
  
  vec2 a = mod(uv, r) - h;
  vec2 b = mod(uv - h, r) - h;
  
  vec2 gv = dot(a, a) < dot(b, b) ? a : b;
  vec2 id = uv - gv;
  gv = rotate2d(gv, rot);
  
  float x = atan(gv.x, gv.y);
  float y = 0.5 - hexDist(gv);
  return vec4(x, y, id.x, id.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 uv0 = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  float n = 8.0;
  vec2 gv = fract(n * uv0);
  vec2 id = floor(n * uv0);

  vec3 color = vec3(0.0, 0.5, 0.5);
  vec3 palette1 = vec3(1.0, 0.0, 0.0);
  vec3 palette2 = vec3(0.0, 1.0, 0.0);
  vec3 palette3 = vec3(1.0);

  vec4 hexa = hexCoords(2.5 * uv0, 0.0);
  float hexaid = floor(2.0 * n * hexa.y);
  float hexastep = hexaid / (n - 1.0);
  float timer = tt + cos(mix(-tt, tt, step(0.25, hexa.y)) + 0.1 * hexa.x + cos(-ht));
  float strips = mix(
    mix(
      fract(timer + hexastep),
      fract(timer + 0.333333 + hexastep),
      step(-TRP, hexa.x)
    ),
    fract(timer + 0.666666 + hexastep),
    step(TRP, hexa.x)
  );
  color += mix(
    mix(
      mix(palette1, palette2, step(P, mod(t + hexa.z, TP))) * strips,
      mix(palette2, palette3, step(P, mod(t + hexa.w, TP))) * strips,
      step(-TRP, hexa.x)
    ),
    mix(palette3, palette1, step(P, mod(t + hexa.z + hexa.w, TP))) * strips,
    step(TRP, hexa.x)
  );

  gl_FragColor = vec4(color, 1.0);
}
