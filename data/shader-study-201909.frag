/*
 * shader: cellular noise study
 * based on: [Cellular Noise](https://thebookofshaders.com/12/?lan=jp) by @patriciogv
 */

uniform vec2 resolution;
uniform float time;
uniform float progress;

uint xorshift(uint seed) {
  uint y = seed;
  y = y ^ (y << 13);
  y = y ^ (y >> 17);
  return y ^ (y << 15);
}

vec2 focusPoint(vec2 p) {
  return vec2(sin(xorshift(uint(dot(p, resolution)))));
}

void main() {
  vec2 st = gl_FragCoord.xy / resolution.xy;
  st.x *= resolution.x / resolution.y;

  st *= 3.0 * progress;
  vec2 intSt = floor(st);
  vec2 fractSt = fract(st);

  float dist = 1.0;
  for (int y = -1; y <= 1; ++y) {
    for (int x = -1; x <= 1; ++x) {
      vec2 neighbor = vec2(float(x), float(y));
      /*
      vec2 fp = focusPoint(intSt + neighbor);
      vec2 point = vec2(0.5);
      point.x += 0.5 * cos(time + acos(-1) * fp.x);
      point.y += 0.5 * sin(time + acos(-1) * fp.y);
       */
      vec2 point = 0.5 + 0.5 * cos(time + acos(-1) * focusPoint(intSt + neighbor));
      vec2 diff = neighbor + point - fractSt;
      dist = min(dist, length(diff));
    }
  }
  gl_FragColor = vec4(vec3(dist * dist), 1.0);
}