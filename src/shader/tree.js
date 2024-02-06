import { MeshPhysicalMaterial, DoubleSide } from 'three'

const material = new MeshPhysicalMaterial()
material.onBeforeCompile = function (shader) {
  shader.uniforms.time = { value: 0 }
  shader.uniforms.size = { value: 5 }
  shader.uniforms.freq = { value: 2.0 }
  shader.vertexShader =
    `
   uniform float time; 
   uniform float size;
   uniform float freq;
   ` + shader.vertexShader

  shader.vertexShader = shader.vertexShader.replace(
    '#include <project_vertex>',
    `
    vec4 mvPosition = vec4( transformed, 1.0 );
    vec4 worldPosition = modelMatrix * mvPosition;
    mvPosition = modelViewMatrix * mvPosition;

    float c = cos( freq*time + worldPosition.x*size );
    float s = cos( freq/2.0*time + worldPosition.z*size );
    float c2 = cos( freq*time + worldPosition.x*size+1.0 );
    float s2 = cos( freq/2.0*time + worldPosition.z*size+1.5 );
    float f1 = s*c;
    float f2 = s2*c2;
    if(transformed.y>0.0) {
      mvPosition.z +=  0.01*f1*cos(transformed.y*10.0+1.0)*(2.0-transformed.y);
      mvPosition.x +=  0.01*f2*cos(transformed.y*10.0+1.0)*(2.0-transformed.y);
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

// Make sure WebGLRenderer doesnt reuse a single program
material.customProgramCacheKey = function () {
  return 3
}
material.roughness = 1
material.ior = 1
material.side = DoubleSide

export default material
