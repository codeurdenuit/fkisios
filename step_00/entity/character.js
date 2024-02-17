import { Object3D } from 'three'
import Gampad from '../control/gamepad'
import { creatRigidBody } from '../tool/function'

const SPEED = 3

export default class Entity extends Object3D {
  collider = null
  physic = null
  ctrl = null

  constructor(mesh, physic) {
    super()
    this.initCtrl()
    this.initPhysic(mesh, physic)
    this.initVisual(mesh)
  }

  update() {
    this.updateCtrl()
    this.updatePhysic()
    this.updateVisual()
  }

  initCtrl() {
    this.ctrl = new Gampad()
  }

  initPhysic(mesh, physic) {
    const { rigidBody, collider } = creatRigidBody(mesh.position, physic)
    this.rigidBody = rigidBody
    this.collider = collider
  }

  initVisual(mesh) {
    mesh.castShadow = true
    mesh.position.set(0, 0, 0)
    mesh.castShadow = true
    this.add(mesh)
  }

  updateCtrl() {
    this.ctrl.update()
  }

  updatePhysic() {
    const y = this.rigidBody.linvel().y
    const x = this.ctrl.axis.x * SPEED
    const z = this.ctrl.axis.z * SPEED
    this.rigidBody.setLinvel({ x, y, z }, true)
  }

  updateVisual() {
    this.position.copy(this.rigidBody.translation())
  }
}
