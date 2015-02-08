attribute vec4 aVertexPosition;
attribute vec3 aNormal;
attribute vec2 aTextureCoord;

uniform mat4 uPMatrix;
uniform mat4 uMVMatrix;

uniform vec3 lightPos;

varying vec3 lightDir;
varying vec2 texCoord;
varying vec3 vNormal;

void main(void) {
   vec4 worldPosition =  uMVMatrix * aVertexPosition;
   texCoord = aTextureCoord;
   vNormal = aNormal;
   lightDir = lightPos - worldPosition.xyz;
   gl_Position = uPMatrix * worldPosition;
}
