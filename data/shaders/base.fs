// Basic texturing fragment shader
precision mediump float;

varying vec2 vTextureCoord;
uniform sampler2D sTexture;
uniform vec4 uColor;

void main() {
  gl_FragColor = texture2D(sTexture, vTextureCoord) * uColor;
}
