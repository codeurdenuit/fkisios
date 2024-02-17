import { createCollider } from '../tool/function'
import { Object3D } from 'three'

export default class World extends Object3D {
  constructor(visuals, colliders, physic) {
    super()
    this.initPhysic(physic, colliders)
    this.initVisual(visuals)
  }

  initPhysic(physic, meshes) {
    for (const mesh of meshes) {
      createCollider(mesh, physic)
    }
  }

  initVisual(meshes) {
    for (const mesh of meshes) {
      mesh.receiveShadow = true
      mesh.castShadow = true
      this.add(mesh)
    }
  }
}
