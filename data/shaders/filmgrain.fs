precision mediump float;
varying vec2 vTextureCoord;
uniform sampler2D sTexture;

uniform float m_Time;
// uniform float m_Strength;
// uniform vec4 color;
// uniform vec2 blurShift;
// uniform int blur;
// uniform int alphamodulatesgrain;
// uniform float alpha;

const int gaussRadius = 11;
// const float gaussFilter[gaussRadius] = float[gaussRadius](
// 	0.0402,0.0623,0.0877,0.1120,0.1297,0.1362,0.1297,0.1120,0.0877,0.0623,0.0402
// );

void main()
{

  float m_Strength = 10.0; // TODO : Param, 20 is too much
//        vec4 color = vec4(0.5, 0.5, 0.5, 1.0);
  vec2 blurShift = vec2(0.25, 0.25);
  vec4 color = vec4(0, 0, 0, 1.0);
  int blur = 0;
  int alphamodulatesgrain = 0;
  float alpha = 1.0;
  float gaussFilter[11];

  float x = (vTextureCoord.x+2.0) * (vTextureCoord.y+2.0) * (m_Time*10.0);
//float x = (vTextureCoord.x+4.0) * (vTextureCoord.y+4.0) * (m_Time*10.0);
  vec4 grain = vec4(0.0, 0.0, 0.0, 0.0);
  if (alphamodulatesgrain == 1)
    {
      grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01)-0.005) * m_Strength * texture2D(sTexture, vTextureCoord).a;
    }
  else
    {
      grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01)-0.005) * m_Strength;
    }
  gl_FragColor = texture2D(sTexture, vTextureCoord) * color + grain;
  gl_FragColor = color + grain;

  if (blur == 1)
    {
      vec2 blurTexCoord = vTextureCoord - float(int(gaussRadius/2)) * blurShift;
      vec3 color = vec3(0.0, 0.0, 0.0);
      for (int i=0; i<gaussRadius; ++i) {
        color += gaussFilter[i] * texture2D(sTexture, blurTexCoord).xyz;
        blurTexCoord += blurShift;
      }
      gl_FragColor = gl_FragColor + vec4(color,1.0);
      gl_FragColor.a = alpha;
    }

  if (alphamodulatesgrain == 0)
    {
      gl_FragColor.a = alpha;
    }

}
