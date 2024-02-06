import { MeshPhysicalMaterial, Vector3, DoubleSide } from 'three'

const material = new MeshPhysicalMaterial()
material.onBeforeCompile = function (shader) {
  shader.uniforms.time = { value: 0 }
  shader.uniforms.size = { value: 2.0 }
  shader.uniforms.freq = { value: 4.0 }
  shader.uniforms.playerPos = { value: new Vector3(0.0) }
  shader.vertexShader =
    `
   uniform float time; 
   uniform float size;
   uniform float freq;
   uniform vec3 playerPos;
   ` + shader.vertexShader

  shader.vertexShader = shader.vertexShader.replace(
    '#include <project_vertex>',
    `
    vec4 mvPosition = vec4( transformed, 1.0 );
    vec4 worldPosition = modelMatrix * mvPosition;
    mvPosition = modelViewMatrix * mvPosition;

    float c = cos( freq*time + worldPosition.x*size );
    float s = cos( freq/2.0*time + worldPosition.z*size );
    float vertaicalFac = pow((transformed.y/0.2),3.0);
    float f = c*s*vertaicalFac;
    mvPosition.z +=  0.05*f;
    float dist = distance(worldPosition.xyz, playerPos.xyz);
    if(dist<1.0)  {
      mvPosition.x += 0.2*(1.0-dist)*vertaicalFac;
      mvPosition.z += 0.2*(1.0-dist)*vertaicalFac;
    }
    gl_Position = projectionMatrix * mvPosition;
    `
  )

  shader.vertexShader = shader.vertexShader.replace(
    '#include <worldpos_vertex>',
    ''
  )

  material.userData.shader = shader
}

material.customProgramCacheKey = function () {
  return 1
}
material.roughness = 0.7
material.side = DoubleSide

export default material
