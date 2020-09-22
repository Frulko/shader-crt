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

void main() {
  vec4 uv = vec4(gl_FragCoord.xy / u_resolution.xy,
    (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y);
  vec2 m = u_mouse / u_resolution;

  float n = 8.0;
  vec2 gv = fract(n * uv.xy);
  vec2 id = floor(n * uv.xy);

  vec3 color = vec3(0.0);

    // CIRCLE
    float circ = 2.0 * length(uv.zw);
    
    // ANIMATION
    float speed = 2.0 * t;
    float anim = -speed + sin(0.5 * speed + 0.25 * QP * circ + 0.25 * sin(-speed - 0.5 * QP * circ));
	
    // RIPPLES
   	float nr = 4.0; // number ripples
    float ripple = map01(sin(anim + nr * TP * circ),
      map01(sin(2.0 * speed + TP * circ), 0.0, 0.4),
      map01(cos(2.0 * speed + TP * circ), 1.0, 0.6));
    
    // color += circ;
    // color += ripple;
    color += mix(
      vec3(0.0078, 0.1059, 0.1882),
      vec3(0.9412, 0.6157, 0.9137),
      (1.0 - 0.75 * circ) * ripple
    );

  gl_FragColor = vec4(color, 1.0);
}
