/*
 * name: ray marching template
 * type: shader
 * references:
 * - [GLSL SandBoxで手軽にレイマーチングで遊ぼう](https://hackerslab.aktsk.jp/2018/12/01/131928)
 */

//
// Uniform variables
//

uniform ivec2 resolution;

//
// Constants
//

const float PI = acos(-1);
const float TWO_PI = PI * 2;
const float DELTA = 0.001;

//
// Types
//

struct Camera {
  vec3 position;
  vec3 up;
	vec3 direction;
  vec3 side;
};

struct Ray {
	vec3 position;
	vec3 direction;
};

struct Light {
	vec3 direction;
	vec3 color;
};

//
// Functions
//

float sdSphere(vec3 pos, float r, vec3 rayPos) {
	return length(rayPos - pos) - r;
}

float calcDistance(vec3 rayPos) {
	const vec3 pos = vec3(0.0, 0.0, 3.0);
	const float r = 1.0;
  return sdSphere(pos, r, rayPos);
}

vec3 calcNormalVector(vec3 rayPos) {
  float d = calcDistance(rayPos);
  return normalize(
      vec3(
        calcDistance(rayPos - vec3(DELTA, 0.0, 0.0)) - d,
        calcDistance(rayPos - vec3(0.0, DELTA, 0.0)) - d,
        calcDistance(rayPos - vec3(0.0, 0.0, DELTA)) - d
    )
  );
}

vec3 calcLuminanceIntensity(
  vec3 normalVector,
  vec3 pointLightPos,
  vec3 pointLightColor
) {
  return dot(normalVector, pointLightPos) * pointLightColor;
}

void main() {
  vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / max(resolution.x, resolution.y);

  // Set camera
  Camera camera;
  camera.position = vec3(0.0, 0.0, -4.0);
  camera.up = normalize(vec3(0.0, 1.0, 0.0));
  camera.direction = normalize(vec3(0.0, 0.0, 1.0));
  camera.side = normalize(cross(camera.up, camera.direction));

  // Initialize ray 
  Ray ray;
  ray.position = camera.position;
  ray.direction = normalize((uv.x * camera.side) + (uv.y * camera.up) + camera.direction);

  // Calc distance between camera and target
  float t = 0.0;
  const int MAX_STEP = 64;
  int step = 0;
  while (++step <= MAX_STEP) {
    float d = calcDistance(ray.position);
    if (d < DELTA) {
      break;
    }
    t += d;
    ray.position = camera.position + t * ray.direction;
  }
  if (MAX_STEP < step) {
    gl_FragColor = vec4(0);
    return;
  }

  // Calc normal vector
  vec3 normalVector = calcNormalVector(ray.position);

  // Calc color
  Light surfaceLight;
  surfaceLight.direction = normalize(vec3(1.0, -1.0, 1.0));
  surfaceLight.color = vec3(1.0, 1.0, 1.0);
  vec3 luminanceIntensity = calcLuminanceIntensity(
    normalVector,
    surfaceLight.direction,
    surfaceLight.color
  );

  // Render
  gl_FragColor = vec4(luminanceIntensity, 1.0);
}