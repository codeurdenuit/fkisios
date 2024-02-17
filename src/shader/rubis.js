import {
  TextureLoader,
  EquirectangularReflectionMapping,
  MeshPhongMaterial
} from 'three'

const texture = new TextureLoader().load('./image/sky.jpg')
texture.mapping = EquirectangularReflectionMapping

export const materialA = new MeshPhongMaterial({
  color: '#00ff00',
  specular: '#ffffff',
  shininess: 5,
  envMap: texture
})
export const materialB = new MeshPhongMaterial({
  color: '#ff0000',
  specular: '#ffffff',
  shininess: 5,
  envMap: texture
})
