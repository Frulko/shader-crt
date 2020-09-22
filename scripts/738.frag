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
  return fract(sin(p.x * 100. + p.y * 523.) * 6901.);
}

float hexSDF(vec2 uv) {
  uv = 2.0 * abs(uv);
  return max(dot(uv, normalize(vec2(1.0, 1.73))), uv.x);
}

vec4 hexCoords(vec2 uv) {
  vec2 r = vec2(1, 1.73);
  vec2 h = 0.5 * r;

  vec2 uva = mod(uv, r) - h;
  vec2 uvb = mod(uv - h, r) - h;

  vec2 gv = dot(uva, uva) < dot(uvb, uvb) ? uva : uvb;
  vec2 id = uv - gv;

  float sdf = hexSDF(gv);
  float a = atan(gv.x, gv.y);
  return vec4(sdf, a, id.x, id.y);
}

void main() {
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;

  vec3 color = vec3(0.0118, 0.098, 0.3882);

  float n = 3.5;
  vec4 _hex = hexCoords(n * uv.zw + 10.0);
  vec2 offset = vec2(
    S(0.25, HP, cos(ht + _hex.z + sin(ht + _hex.w))),
    S(0.25, HP, sin(-ht + _hex.w + sin(ht + _hex.z)))
  );
  vec4 hex = hexCoords(n * uv.zw + 5.0 + offset);
  
  vec2 renders = vec2(
    0.25 * step(0.0, hex.y) * step(hex.y, 2.0 * TRP)
      + 0.9 * step(-2.0 * TRP, hex.y) * step(hex.y, 0.0),
    0.9 * step(-P, hex.y) * step(TRP, hex.y)
      + 0.25 * step(hex.y, -TRP)
  );
  color += mix(renders.x, renders.y, step(1.0, mod(hex.w, 2.0)));

  gl_FragColor = vec4(color, 1.0);
}
