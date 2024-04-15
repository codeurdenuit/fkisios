import { Object3D, Vector3 } from 'three'
import Gamepad from '../control/gamepad'
import Animator from '../engine/animator'
import Sound from '../engine/sound'
import { createRigidBodyEntity, range } from '../tool/function'

const SPEED = 3
const ATTACK = 'attack1'
const IDLE = 'idle'
const RUN = 'run'
const YELL = './sound/attack2.wav'
const GRASS_R = './sound/step_grass1.wav'
const GRASS_L = './sound/step_grass3.wav'
const STONE_R = './sound/step_stone1.wav'
const STONE_L = './sound/step_stone3.wav'
const WOOD_R = './sound/step_wood1.wav'
const WOOD_L = './sound/step_wood2.wav'
const DIRT_R = './sound/step_dirt1.wav'
const DIRT_L = './sound/step_dirt3.wav'

export default class Player extends Object3D {
  collider = null
  rigidBody = null
  animator = null
  sound = new Sound()
  ctrl = new Gamepad()

  constructor(mesh, physic) {
    super()
    this.animator = new Animator(mesh)
    this.initPhysic(physic, origin)
    this.initVisual(mesh)
    this.initAnimations()
    this.initSound()
    this.syncAnimSound()
  }

  initPhysic(physic) {
    const origin = new Vector3(0, 4, 0)
    const { rigidBody, collider } = createRigidBodyEntity(origin, physic)
    this.rigidBody = rigidBody
    this.collider = collider
  }

  initVisual(mesh) {
    this.add(mesh)
  }

  initAnimations() {
    this.animator.load(ATTACK, 0.3)
    this.animator.load(IDLE, 3)
    this.animator.load(RUN, 0.5)
  }

  initSound() {
    this.sound.load(YELL)
    this.sound.load(GRASS_R)
    this.sound.load(GRASS_L)
    this.sound.load(STONE_R)
    this.sound.load(STONE_L)
    this.sound.load(WOOD_R)
    this.sound.load(WOOD_L)
    this.sound.load(DIRT_R)
    this.sound.load(DIRT_L)
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

  syncAnimSound() {
   this.animator.on(ATTACK, 'half', () => {
      this.sound.play(YELL)
    })
    this.animator.on(RUN, 'loop', () => {
      this.sound.play(DIRT_R)
    })
    this.animator.on(RUN, 'half', () => {
      this.sound.play(DIRT_L)
    })
  }
}
