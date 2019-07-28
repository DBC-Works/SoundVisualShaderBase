/*
 * shader: ray marching study
 * Reference information:
 * - [GLSL SandBoxで手軽にレイマーチングで遊ぼう](https://hackerslab.aktsk.jp/2018/12/01/131928)
 * - [シェーダだけで世界を創る！three.jsによるレイマーチング ](https://www.slideshare.net/shohosoda9/threejs-58238484)
 * - [distance functions](https://iquilezles.org/www/articles/distfunctions/distfunctions.htm)
 * - [wgld.org](https://wgld.org/)
 */
precision mediump float;

uniform sampler2D texture;
uniform ivec2  resolution;
uniform float timeSec;
uniform float progress;
uniform vec3 soundLevel;
uniform float kick;
uniform float hihat;
uniform float snare;

const float PI = acos(-1);
const float TWO_PI = PI * 2;

vec3 rotateX(vec3 p, float rad) {
  float c = cos(rad);
  float s = sin(rad);
  return mat3(
    1.0, 0.0, 0.0,
    0.0, c, -s,
    0.0, s, c
  ) * p;
}

/*
float sdSphere(vec3 p, float r) {
  return length(p) - r;
}
 */

float sdCylinder( vec3 p, vec3 c ) {
  return length(p.xz-c.xy)-c.z;
}

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

vec3 repeat(vec3 p, float interval) {
  return mod(p, interval) - (interval * 0.5);
}

float dist(vec3 p) {
  float repeatTime = 2.0 * (soundLevel.x * 5);
  return min(
    sdTorus(repeat(p, repeatTime), vec2(0.4, 0.1 * soundLevel.y * 2)),
    sdCylinder(repeat(p, repeatTime), vec3(0.05 * soundLevel.y * 2))
  );
}

vec3 normalizeDist(vec3 pos) {
  const float delta = 0.001;
  return normalize(
    vec3(
      dist(pos - vec3(delta, 0.0, 0.0)) - dist(pos),
      dist(pos - vec3(0.0, delta, 0.0)) - dist(pos),
      dist(pos - vec3(0.0, 0.0, delta)) - dist(pos)
    )
  );
}

vec3 getLight(vec3 rayPos) {
  vec3 lightVector = normalize(vec3(1.0, -1.0, 1.0));
  vec3 normalVector = normalizeDist(rayPos);
  
  vec3 lightColor = vec3(1.0 * normalVector.z, 1.0 * normalVector.y, 1.0 * normalVector.x);
  return dot(normalVector, lightVector) * lightColor;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

  vec3 cameraPos = rotateX(vec3(0.0, 0.0, -4.0), sin(progress * TWO_PI));
  vec3 cameraUp = normalize(vec3(sin(progress * TWO_PI) - 0.5, cos(progress * TWO_PI) - 0.5, 0.0));
  vec3 cameraDir = normalize(vec3(0.0, 0.0, 1.0));
  vec3 cameraSite = normalize(cross(cameraUp, cameraDir));

  vec3 rayDir = normalize((uv.x * cameraSite + uv.y * cameraUp) + cameraDir);

  vec3 rayPos = cameraPos;
  float d = dist(rayPos);
  float t = 0.0;
  for (int i = 0; 0.001 <= d && i < int(64 * (soundLevel.z * 10)); ++i) {
    t += d;
    rayPos = cameraPos + (t * rayDir);
    d = dist(rayPos);
  }

  vec2 bg = -uv;
  gl_FragColor = d < 0.001 ? vec4(getLight(rayPos), 1.0) : vec4(min(bg.x, bg.y));
  // gl_FragColor = d < 0.001 ? vec4(getLight(rayPos), 1.0) : vec4(kick, hihat, snare, 1.0);
}