/*
 * name: Volume to color saturation mapper
 * type: filter
 */
uniform sampler2D texture;
uniform ivec2 resolution;

uniform vec3 soundLevel;

vec3 rgb2hsv(vec3 c) {
    // [The Book of Shaders by Patricio Gonzalez Vivo & Jen Lowe](https://thebookofshaders.com/06/)
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsb2rgb(float h, float s, float v) {
    /*
    vec4 t = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(vec3(h) + t.xyz) * 6.0 - vec3(t.w));
    return v * mix(vec3(t.x), clamp(p - vec3(t.x), 0.0, 1.0), s);
     */
    // [[汎用関数]HSV2RGB 関数](https://qiita.com/keim_at_si/items/c2d1afd6443f3040e900)
    return ((clamp(abs(fract(h + vec3(0, 2, 1) / 3.) * 6. - 3.) - 1., 0., 1.) - 1.) * s + 1.) * v;
}

void main() {
  vec4 color = texture(texture, gl_FragCoord.xy / resolution);
  vec3 hsb = rgb2hsv(color.rgb);
  gl_FragColor = vec4(hsb2rgb(hsb.x, hsb.y * soundLevel.z, hsb.z), 1);
}