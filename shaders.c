

/*
attribute float alpha;
varying float vAlpha;

void main() {
  vAlpha = alpha;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = 20.0;
  gl_Position = projectionMatrix * mvPosition;
}
*/

uniform float delta;
uniform float focus;

varying float vAlpha;

float diff;

void main() {
  //vAlpha = 10.0 / abs(position.x);
  //vAlpha = 10.0 / position.y;
  //vAlpha = position.z;
  gl_Position = projectionMatrix *
                modelViewMatrix *
                vec4(position, 1.0);

  diff = abs(gl_Position.y - focus);
  //if (diff < delta) {
  //  vAlpha = 1.0;
  //} else {
    vAlpha = 25.0 / diff;
  //}
}


//FRAGMENT

uniform vec3 color;
varying float vAlpha;
//varying float red;

void main() {
  gl_FragColor = vec4(color, vAlpha);
}
