import { Object3D, Vector3 } from 'three'
import Gamepad from '../control/gamepad'
import Animator from '../engine/animator'
import { createRigidBodyEntity, range } from '../tool/function'

const SPEED = 3
const ATTACK = 'attack1'
const IDLE = 'idle'
const RUN = 'run'

export default class Player extends Object3D {
  collider = null
  rigidBody = null
  animator = null
  ctrl = new Gamepad()

  constructor(mesh, physic) {
    super()
    const origin = new Vector3(0, 4, 0)
    this.initPhysic(physic, origin)
    this.initVisual(mesh)
    this.initAnimations(mesh)
  }

  initPhysic(physic, origin) {
    const { rigidBody, collider } = createRigidBodyEntity(origin, physic)
    this.rigidBody = rigidBody
    this.collider = collider
  }

  initVisual(mesh) {
    this.add(mesh)
  }

  initAnimations(mesh) {
    const animator = new Animator(mesh)
    animator.load(ATTACK, 0.3)
    animator.load(IDLE, 3)
    animator.load(RUN, 0.5)
    this.animator = animator
  }

  update(dt) {
    this.updatePhysic()
    this.updateVisual(dt)
    this.updateAnimation(dt)
  }

  updatePhysic() {
    const attack = this.ctrl.attack
    let x = attack ? 0 : this.ctrl.x * SPEED 
    let z = attack ? 0 : this.ctrl.z * SPEED
    let y = this.rigidBody.linvel().y
    this.rigidBody.setLinvel({ x, y, z }, true)
  }

  updateVisual(dt) {
    this.position.copy(this.rigidBody.translation())
    if (this.ctrl.moving) {
      this.rotation.y += range(this.ctrl.angle, this.rotation.y) * dt * 10
    }
  }

  updateAnimation(dt) {
    if (this.ctrl.attack) {
      this.animator.play(ATTACK)
    } else if (this.ctrl.moving) {
      this.animator.play(RUN)
    } else {
      this.animator.play(IDLE)
    }
    this.animator.update(dt)
  }
}
