#ifdef GL_ES
  precision highp float;
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

float n21(vec2 p) {
  return fract(sin(p.x * 100. + p.y * 523.) * 6901.);
}

vec2 rotate2d(vec2 uv, float a) {
  return mat2(cos(a), -sin(a), sin(a), cos(a)) * uv;
}

float hexSDF(vec2 uv) {
  uv = 2.0 * abs(uv);
  return max(abs(uv.y), 0.866025 * uv.x + 0.5 * uv.y);
}

float hue2rgb(float f1, float f2, float hue) {
  if (hue < 0.0)
    hue += 1.0;
  else if (hue > 1.0)
    hue -= 1.0;
  float res;
  if ((6.0 * hue) < 1.0)
    res = f1 + (f2 - f1) * 6.0 * hue;
  else if ((2.0 * hue) < 1.0)
    res = f2;
  else if ((3.0 * hue) < 2.0)
    res = f1 + (f2 - f1) * ((2.0 / 3.0) - hue) * 6.0;
  else
    res = f1;
  return res;
}

vec3 hsl2rgb(vec3 hsl) {
  vec3 rgb;
  
  if (hsl.y == 0.0) {
    rgb = vec3(hsl.z); // Luminance
  } else {
    float f2;
      
    if (hsl.z < 0.5)
      f2 = hsl.z * (1.0 + hsl.y);
    else
      f2 = hsl.z + hsl.y - hsl.y * hsl.z;
    
    float f1 = 2.0 * hsl.z - f2;
    
    rgb.r = hue2rgb(f1, f2, hsl.x + (1.0/3.0));
    rgb.g = hue2rgb(f1, f2, hsl.x);
    rgb.b = hue2rgb(f1, f2, hsl.x - (1.0/3.0));
  }
  return rgb;
}

vec3 hsl2rgb(float h, float s, float l) {
  return hsl2rgb(vec3(h, s, l));
}

vec4 hexCoords(vec2 uv) {
  vec2 r = vec2(1, 1.73);
  vec2 h = 0.5 * r;

  vec2 uva = mod(uv, r) - h;
  vec2 uvb = mod(uv - h, r) - h;

  vec2 gv = dot(uva, uva) < dot(uvb, uvb) ? uva : uvb;
  vec2 id = uv - gv;
  // float angle = mix(0.0, P, step(, mod))
  gv = rotate2d(gv, 0.5 * TRP);

  float sdf = hexSDF(gv);
  float a = atan(gv.x, gv.y);
  return vec4(sdf, a, id.x, id.y);
}

void main() {
  /* vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 uv0 = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y; */
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);

  float n = 8.0;
  vec2 gv = fract(n * uv.xy);
  vec2 id = floor(n * uv.xy);

  vec3 color = vec3(0.45, 0.0, 0.45);

  vec4 hex = hexCoords(n * (uv.zw + 1.0));
  float div = 6.0;
  float tris = floor(div * map(hex.y, -P, P, 0.0, 1.0)) / div;
  float mode = map01(sin(ht), 0.1, 1.0);
  color.y += mod(tris + mode * (hex.z - hex.w), 1.0);

  gl_FragColor = vec4(hsl2rgb(color), 1.0);
}
