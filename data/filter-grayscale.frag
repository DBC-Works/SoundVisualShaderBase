/*
 * name: Gray scale converter
 * type: filter
 */
uniform sampler2D texture;
uniform ivec2 resolution;

void main() {
  vec4 color = texture(texture, gl_FragCoord.xy / resolution);
  float grayScale = ((color.r * 0.109375) + (color.g * 0.30078125) + (color.b * 0.58984375));
  gl_FragColor = vec4(grayScale, grayScale, grayScale, 1);
}