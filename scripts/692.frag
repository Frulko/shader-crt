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

float lava(vec2 uv, vec3 offset) {
  float stepper = mix(
    0.5 * cos(ht + TP * uv.x
     + HP * cos(-ht + P * pow(uv.x, uv.y)) * sin(ht + QP * pow(uv.y, uv.x))
    + offset.z
    ) - map01(cos(t + TP * (uv.x - uv.y) + sin(-t) + offset.y), 0.0, 0.25),
    0.45 * sin(-ht + P * uv.y
      + QP * sin(ht + 2.0 * TP * uv.x)
      - cos(QP * uv.x + 0.5 * sin(2.0 * t + 1.5 * TP * uv.x * uv.y))
    ),
    uv.x
  );
  float p = map01(sin(2.0 * t + HP * uv.y + HP * offset.z), 0.05, 0.5);
  return S(stepper + p, stepper - p, 0.5 * cos(TP * uv.x));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 uv0 = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
  

  float n = 8.0;
  vec2 gv = fract(n * uv0);
  vec2 id = floor(n * uv0);

  vec3 color = vec3(0.0);

  color.r += lava(uv, vec3(0.0, 0.5, 1.0));
  color.g += lava(uv, vec3(1.0, 0.0, 0.5));
  color.b += lava(uv, vec3(0.5, 1.0, 0.0));


  gl_FragColor = vec4(color, 1.0);
}
