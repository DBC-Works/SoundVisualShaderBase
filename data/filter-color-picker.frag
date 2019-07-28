/*
 * name: Color picker
 * type: filter
 * options:
 *   initial:
 *     - name: hue
 *       description: hue of pick up color.
 *       type: number
 *       minimum: 0
 *       maximum: 359
 *     - name: tolerance
 *       description: tolerance of target hue.
 *       type: number
 *       minimum: 0.0
 *       exlusiveMaximum: 1.0
 */
uniform sampler2D texture;
uniform ivec2 resolution;
uniform float hue;
uniform float tolerance;
uniform vec2 mouse;

vec3 rgb2hsv(vec3 c) {
    // [The Book of Shaders by Patricio Gonzalez Vivo & Jen Lowe](https://thebookofshaders.com/06/)
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

void main() {
  vec4 color = texture(texture, gl_FragCoord.xy / resolution);
  vec3 hsv = rgb2hsv(color.rgb);

  bool target = false;
  float h = mod((hue / 359.0) + mouse.x, 1.0);
  float t = (0 < mouse.y ? mouse.y : tolerance) / 2;
  float minHue = h - t;
  float maxHue = h + t;
  if (minHue < 0.0) {
    target = (hsv.x <= maxHue || (1.0 - minHue) <= hsv.x);
  } else if (1.0 < maxHue) {
    target = (hsv.x <= (maxHue - 1.0) || minHue <= hsv.x);
  } else {
    target = (minHue <= hsv.x && hsv.x <= maxHue);
  }

  if (target) {
    gl_FragColor = color;
  } else {
    float grayScale = ((color.r * 0.109375) + (color.g * 0.30078125) + (color.b * 0.58984375));
    gl_FragColor = vec4(grayScale, grayScale, grayScale, 1);
  }
}