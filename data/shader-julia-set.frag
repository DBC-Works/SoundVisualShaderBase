/*
 * name: Filled julia set renderer
 * comment: Based on [wgld.org | GLSL: ジュリア集合 |](https://wgld.org/d/glsl/g006.html).
 * type: shader
 * options:
 *   initial:
 *     - name: a
 *       type: number
 *     - name: ib
 *       type: number
 *     - name: baseHue
 *       description: Start hue
 *       type: number
 *       minimum: 0
 *       maximum: 359
 */
uniform sampler2D texture;

uniform ivec2 resolution;
uniform float progress;
uniform vec3 soundLevel;

uniform float a;
uniform float ib;
uniform float baseHue;

const float PI = acos(-1);
const float TWO_PI = (PI * 2);

vec3 hsb2rgb(float h, float s, float v) {
    /*
    vec4 t = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));
    return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
     */
    // [[汎用関数]HSV2RGB 関数](https://qiita.com/keim_at_si/items/c2d1afd6443f3040e900)
    return ((clamp(abs(fract(h + vec3(0, 2, 1) / 3.) * 6. - 3.) - 1., 0., 1.) - 1.) * s + 1.) * v;
}

vec2 getNormalizedCoordinator() {
    return (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
}

void main(void) {
    // vec2 x = vec2(-0.345, 0.654);
    vec2 x = vec2(a, ib);
    vec2 y = vec2((sin(progress * 10.0 * TWO_PI)) * 0.02, 0);
    vec2 z = getNormalizedCoordinator();
    int j = 0;
    for (int i = 0; i < 360 && length(z) <= 2.0; ++i, ++j) {
        z = vec2((z.x * z.x) - (z.y * z.y), (2.0 * z.x * z.y)) + x + y;
    }
    
    float h = abs(mod(baseHue + (progress * 359) - float(j), 360.0) / 359.0);
    gl_FragColor = vec4(hsb2rgb(h, float(j) / 720.0, 1.0), 1.0);
}