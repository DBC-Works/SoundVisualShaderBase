/*
 * name: Color inverter
 * type: filter
 */
uniform sampler2D texture;
uniform ivec2 resolution;

void main() {
  vec4 color = texture(texture, gl_FragCoord.xy / resolution);
  gl_FragColor = vec4(1 - color.r, 1 - color.g, 1 - color.b, color.a);
}