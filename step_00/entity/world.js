import { Object3D } from 'three'
import '../tool/function'

export default class World extends Object3D {
  constructor(visuals) {
    super()
    this.initPhysic()
    this.initVisual(visuals)
  }

  initPhysic() {}

  initVisual(meshes) {
    for (const mesh of meshes) {
      mesh.receiveShadow = true
      mesh.castShadow = true
      this.add(mesh)
    }
  }
}
