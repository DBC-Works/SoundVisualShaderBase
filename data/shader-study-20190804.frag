/*
 * shader: ray marching study 20190804
 * references:
 * - [GLSL SandBoxで手軽にレイマーチングで遊ぼう](https://hackerslab.aktsk.jp/2018/12/01/131928)
 * - [魔法使いになりたい人のためのシェーダーライブコーディング入門](https://qiita.com/kaneta1992/items/21149c78159bd27e0860)
 * - [Phantom Mode](https://www.shadertoy.com/view/MtScWW)
 * - [Live Coding Using Phantom Mode](https://www.shadertoy.com/view/wl2GWG)
 * - [distance functions](https://iquilezles.org/www/articles/distfunctions/distfunctions.htm)
 */

uniform ivec2 resolution;
uniform float time;
uniform float progress;
uniform vec3 soundLevel;

const float PI = acos(-1);
const float TWO_PI = PI * 2;

float sdBox(vec3 p, vec3 b) {
  vec3 d = abs(p) - b;
  return length(max(d, 0.0))
         + min(max(d.x, max(d.y, d.z)), 0.0);
}

vec3 repeat(vec3 p, float interval) {
  return mod(p, interval) - 2.0;
}

float dist(vec3 p) {
  vec3 pos = repeat(p - 2.0, 4.0);
  return max(-sdBox(pos, vec3(0.5 + 0.5 * sin(progress * TWO_PI))),
            sdBox(pos, vec3(0.4 + 0.4 * sin(progress * TWO_PI))));
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

  vec3 cameraUp = normalize(vec3(sin(progress * TWO_PI) - 0.5, cos(progress * TWO_PI) - 0.5, sin(progress * 10.0) * 5));
  vec3 cameraDir = normalize(vec3(0.0, 0.0, 1.0));
  vec3 cameraSite = normalize(cross(cameraUp, cameraDir));
  vec3 rayDir = normalize((uv.x * cameraSite + uv.y * cameraUp) + cameraDir);

  float t = 0.01;
  float ac = 0.0;
  for (int i = 0; i < 48; ++i) {
    float d = dist(rayDir * t);
    d = max(abs(d), 0.02);
    ac += exp(-d * 3.0);
    t += d * 0.5;
  }
    
  gl_FragColor = vec4(soundLevel * ac * 0.2, 1.0);
}