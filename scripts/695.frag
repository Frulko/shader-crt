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

#define t 0.75 * u_time
#define ht 0.5 * t
#define tt 0.1 * t

#define S(a, b, t) smoothstep(a, b, t)

float map(float n, float start1, float stop1, float start2, float stop2) {
  return (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
}

float map01(float n, float start2, float stop2) {
  return (0.5 * n + 0.5) * (stop2 - start2) + start2;
}

vec2 rotateuv(vec2 uv, float a) {
  uv = mat2(cos(a), -sin(a), sin(a), cos(a)) * (uv - 0.5);
  return uv + 0.5;
}

float stroke(float x, float s, float w, float p) {
  return clamp(
      S(s + p, s - p, x - 0.5 * w) * S(s - p, s + p, x + 0.5 * w),
    0.0, 1.0);
}

float computeAngle1(vec2 uv, vec2 offset) {
  offset *= 0.1;
  return -t
    + cos(1.5 * t + 0.5 * QP * uv.x + offset.x)
    * sin(-1.25 * t + HP * uv.y + offset.y);
}

float computeAngle2(vec2 uv, vec2 offset) {
  offset *= 0.1;
  return t
    + cos(-t + 0.5 * QP * (uv.x + uv.y + offset.x)
      + QP * sin(2.0 * t + offset.y)
    );
}

float ring(vec2 uv, vec2 uv0, float stepper, float offset) {
  float circ = length(uv0);
  float timer = cos(t + HP * (uv.x + uv.y) + offset);
  float s = 0.35;
  float w = map01(timer, 0.15, 0.01);
  float pre = map01(timer, 0.01, 0.1);
  float ring = stroke(circ, s, w, pre);
  return mix(
    ring, -ring,
    mix(stepper, 1.0 - stepper,
      map01(sin(ht + QP * uv.y), 0.0, 2.0))
  );
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 uv0 = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;

  vec2 offset1Angle1 = vec2(
    map01(cos(t), HP, P),
    map01(sin(t), -P, -HP)
  );
  vec2 offset2Angle1 = vec2(
    map01(cos(t), QP, 0.0),
    map01(sin(t), 0.0, QP)
  );
  vec2 offset3Angle1 = vec2(
    map01(sin(t), -P, -HP),
    map01(cos(t), HP, P)
  );
  vec3 angles1 = vec3(
    computeAngle1(uv, offset1Angle1),
    computeAngle1(uv, offset2Angle1),
    computeAngle1(uv, offset3Angle1)
  );
  vec3 background = S(0.25, 0.75, vec3(
    rotateuv(uv, angles1.x).y,
    rotateuv(uv, angles1.y).y,
    rotateuv(uv, angles1.z).y
  ));
  vec3 color = background;

  vec2 offset1Angle2 = vec2(HP, P);
  vec2 offset2Angle2 = vec2(HP, map01(sin(t), HP, P));
  vec2 offset3Angle2 = vec2(P, map01(sin(t), -P, P));
  vec3 angle2 = vec3(
    computeAngle2(uv, offset1Angle2),
    computeAngle2(uv, offset2Angle2),
    computeAngle2(uv, offset3Angle2)
  );
  vec3 stepper = vec3(
    rotateuv(uv, angle2.x).x,
    rotateuv(uv, angle2.y).x,
    rotateuv(uv, angle2.z).x
  );
  color.r += ring(uv, uv0, stepper.x, 0.25);
  color.g += ring(uv, uv0, stepper.y, 0.0);
  color.b += ring(uv, uv0, stepper.z, -0.25);

  gl_FragColor = vec4(color, 1.0);
}
