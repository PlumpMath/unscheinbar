precision mediump float;

uniform sampler2D diffuse;
uniform vec4 color;
uniform float lightRadius;

varying vec3 lightDir;
varying vec2 texCoord;
varying vec3 vNormal;

void main(void) {
   float ambient = 0.1;
   float lightDistance = length(lightDir)/lightRadius;
   float attn = clamp(1.0 - lightDistance, 0.0, 1.0);
   float lightFactor = max(dot(normalize(lightDir), normalize(vNormal)), 0.0) + ambient;
   vec4 tex = texture2D(diffuse, texCoord);
   gl_FragColor = vec4(vec3(attn) * tex.rgb, tex.a) * color;
}
