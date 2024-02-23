import { Object3D } from 'three'
import { createCollider } from '../tool/function'

export default class World extends Object3D {
  constructor(visuals, colliders, physic) {
    super()
    this.initPhysic(colliders, physic)
    this.initVisual(visuals)
  }

  initPhysic(meshes, physic) {
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
