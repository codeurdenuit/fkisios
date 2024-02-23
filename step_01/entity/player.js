import { Object3D } from 'three'
import Gamepad from '../control/gamepad'
import { createRigidBody } from '../tool/function'

const SPEED = 3

export default class Player extends Object3D {
  collider = null
  rigidBody = null
  ctrl = null

  constructor(mesh, physic) {
    super()
    this.position.copy(mesh.position)
    this.initCtrl()
    this.initPhysic(physic)
    this.initVisual(mesh)
  }

  initCtrl() {
    this.ctrl = new Gamepad()
  }

  initPhysic(physic) {
    const { rigidBody, collider } = createRigidBody(this.position, physic)
    this.rigidBody = rigidBody
    this.collider = collider
  }

  initVisual(mesh) {
    mesh.position.set(0, 0, 0)
    mesh.castShadow = true
    this.add(mesh)
  }

  update() {
    this.updatePhysic()
    this.updateVisual()
    this.updateCtrl()
  }

  updatePhysic() {
    const x = this.ctrl.axis.x * SPEED
    const z = this.ctrl.axis.z * SPEED
    const y = this.rigidBody.linvel().y
    this.rigidBody.setLinvel({ x, y, z }, true)
  }

  updateVisual() {
    this.position.copy(this.rigidBody.translation())
  }

  updateCtrl() {
    this.ctrl.update()
  }
}
