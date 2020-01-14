/*
 * name: ray marching study 201910
 * type: shader
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

uniform float kick;

const float PI = acos(-1);
const float TWO_PI = PI * 2;

vec3 hsb2rgb(float h, float s, float b) {
    // [[汎用関数]HSV2RGB 関数](https://qiita.com/keim_at_si/items/c2d1afd6443f3040e900)
    return ((clamp(abs(fract(h + vec3(0, 2, 1) / 3.) * 6. - 3.) - 1., 0., 1.) - 1.) * s + 1.) * b;
}


float sdHexPrism( vec3 p, vec2 h )
{
  const vec3 k = vec3(-0.8660254, 0.5, 0.57735);
  p = abs(p);
  p.xy -= 2.0*min(dot(k.xy, p.xy), 0.0)*k.xy;
  vec2 d = vec2(
       length(p.xy-vec2(clamp(p.x,-k.z*h.x,k.z*h.x), h.x))*sign(p.y-h.x),
       p.z-h.y );
  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float sdTriPrism( vec3 p, vec2 h ) {
    vec3 q = abs(p);
    return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);
}

vec3 repeat(vec3 p, float interval) {
  return mod(p, interval) - 2.0 * progress;
}

float dist(vec3 p) {
  vec3 pos = repeat(p - 2.0 * progress, 4.0);
  return sdHexPrism(pos, vec2(0.5, 2.0 * progress));
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

  vec3 cameraUp = normalize(vec3(-sin(progress * progress * 5 * TWO_PI), cos(progress * progress * 5 * TWO_PI), 0.0));
  vec3 cameraDir = vec3(0.0, 0.0, 2.0 * progress);
  vec3 cameraSide = normalize(cross(cameraUp, cameraDir));
  vec3 rayDir = normalize((uv.x * cameraSide + uv.y * cameraUp) + cameraDir);

  float t = 0.01;
  float ac = 0.0;
  for (int i = 0; i < 48; ++i) {
    float d = dist(rayDir * t);
    d = max(abs(d), 0.02);
    ac += exp(-d * 3.0);
    t += d * 0.5;
  }

  float h = soundLevel.x * ac * 0.2;
  float s = ac * 0.02 * soundLevel.y;
  float b = ac * 0.02;
  gl_FragColor = vec4(hsb2rgb(h, s, b), 1.0);
}