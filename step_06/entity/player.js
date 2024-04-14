import { Object3D, Vector3 } from 'three'
import Gamepad from '../control/gamepad'
import Animator from '../engine/animator'
import Sound from '../engine/sound'
import { createRigidBodyEntity, range } from '../tool/function'

const SPEED = 3
const ATTACK = 'attack1'
const IDLE = 'idle'
const RUN = 'run'
const SHIELD = 'idle_shield'

const YELL = './sound/attack[1-4].wav'
const SWORD = './sound/sword[1-2].wav'
const GRASS_R = './sound/step_grass[1-2].wav'
const GRASS_L = './sound/step_grass[3-4].wav'
const STONE_R = './sound/step_stone[1-2].wav'
const STONE_L = './sound/step_stone[3-4].wav'
const WOOD_R = './sound/step_wood1.wav'
const WOOD_L = './sound/step_wood2.wav'
const DIRT_R = './sound/step_dirt[1-2].wav'
const DIRT_L = './sound/step_dirt[3-4].wav'
const WARD = './sound/shield.wav'

const GRASS = 'grass'
const STEP_R = {grass:GRASS_R, wood:WOOD_R, dirt:DIRT_R, stone:STONE_R } 
const STEP_L = {grass:GRASS_L, wood:WOOD_L, dirt:DIRT_L, stone:STONE_L } 

export default class Player extends Object3D {
  collider = null
  rigidBody = null
  animator = null
  sound = new Sound()
  ctrl = new Gamepad()
  ground = null

  constructor(mesh, physic, areas) {
    super()
    const origin = new Vector3(0, 4, 0)
    this.animator = new Animator(mesh)
    this.initPhysic(physic, origin)
    this.initVisual(mesh)
    this.initAnimations()
    this.initSound()
    this.syncAnimSound()
  }

  initPhysic(physic, origin) {
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
    this.animator.load(SHIELD, 3)
  }

  initSound() {
    this.sound.load(YELL)
    this.sound.load(SWORD)
    this.sound.load(GRASS_R)
    this.sound.load(GRASS_L)
    this.sound.load(STONE_R)
    this.sound.load(STONE_L)
    this.sound.load(WOOD_R)
    this.sound.load(WOOD_L)
    this.sound.load(DIRT_R)
    this.sound.load(DIRT_L)
    this.sound.load(WARD)
  }

  update(dt, areas) {
    this.updatePhysic()
    this.updateVisual(dt)
    this.updateAnimation(dt)
    this.updateGround(areas)
  }

  updatePhysic() {
    const action = this.ctrl.attack||this.ctrl.lock
    let x = action ? 0 : this.ctrl.x * SPEED
    let z = action ? 0 : this.ctrl.z * SPEED
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
    if (this.ctrl.lock) {
      this.animator.play(SHIELD)
    } else if (this.ctrl.attack) {
      this.animator.play(ATTACK)
    } else if (this.ctrl.moving) {
      this.animator.play(RUN)
    } else {
      this.animator.play(IDLE)
    }
    this.animator.update(dt)
  }

  updateGround(areas) {
    this.ground = GRASS
    for (let area of areas) {
      const type = area.in(this.position)
      if (type) {
        this.ground = type
        break
      }
    }
  }

  syncAnimSound() {
    this.animator.on(ATTACK, 'half', () => {
      this.sound.play(YELL)
    })
    this.animator.on(RUN, 'loop', () => {
      this.sound.play(STEP_R[this.ground])
    })
    this.animator.on(RUN, 'half', () => {
      this.sound.play(STEP_L[this.ground])
    })
    this.animator.on(SHIELD, 'start', () => {
      this.sound.play(WARD)
    })
  }
}
