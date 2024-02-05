import { Vector3, LoopOnce } from 'three'
import Ai from '../control/control_ai'
import Particles from '../effect/particles'
import Entity from './entity'
import {
  getGap,
  inHitBox,
  castShadowRecursive,
  getDistance
} from '../function/function'

const ATTACK = 1
const BLOCK = 2
const DEAD = 3
const HIT = 4
const IDLE = 5
const IDLE_SHIELD = 6
const STRAF_SHIELD = 7
const WALK_SHIELD = 8
const WALK = 9
const STEP_L = 10
const STEP_R = 11

export default class Mob1 extends Entity {
  static instances = []
  static hitAngle = Math.PI / 2
  static hitDistance = 1.8
  static velocity = 0.4
  static hearing = 2
  static cbDead = null

  constructor(mesh, origin, physic) {
    super(mesh, origin, physic)
    this.ctrl = new Ai(4, origin, 0.5)
    this.initVisual(mesh)
    this.initAnimations()
    this.initSounds()
    this.hp = 2
    Mob1.instances.push(this)
  }

  initVisual(mesh) {
    castShadowRecursive(mesh)
    mesh.position.y -= 0.5
    mesh.scale.set(1.5, 1.5, 1.5)
    this.add(mesh)
  }

  update(dt, Player) {
    if (!this.isBusy) {
      this.ctrl.compute(dt, Player, this.position)
      if (this.ctrl.attack) {
        this.positionVel.set(0, 0)
        this.rotationVel = 0
        this.updateClipAttack(Player)
      } else {
        this.positionVel.x = this.ctrl.axis.x * Mob1.velocity
        this.positionVel.y = this.ctrl.axis.y * Mob1.velocity
        this.rotationVel = getGap(this.ctrl.angle, this.rotation.y) * dt * 2
        this.updateClipMove()
      }
    }
    this.updateDistance(Player)
    super.update(dt)
  }

  updateClipAttack(Player) {
    const player = Player.instances[0]
    if (!player) return
    if (this.isAnim(ATTACK)) return
    this.anim(ATTACK)
    this.onAnimHalf(() => {
      this.sound(ATTACK)
      if (inHitBox(this, player)) {
        player.hit(this, 1)
      }
    })
    this.onAnimEnd(() => {
      this.anim(IDLE_SHIELD)
    })
  }

  updateClipMove() {
    if (this.positionVel.length() !== 0) {
      if (this.ctrl.focus) {
        if (!this.isAnim(WALK_SHIELD)) {
          this.anim(WALK_SHIELD)
          this.playSoundStep()
        }
      } else {
        if (!this.isAnim(WALK)) {
          this.anim(WALK)
          this.playSoundStep()
        }
      }
    } else {
      if (Math.abs(this.rotationVel) > 0.01) {
        if (!this.isAnim(STRAF_SHIELD)) {
          this.anim(STRAF_SHIELD, Math.sign(this.rotationVel))
          this.playSoundStep()
        }
      } else if (this.ctrl.focus) {
        this.anim(IDLE_SHIELD)
      } else {
        this.anim(IDLE)
      }
    }
  }

  updateDistance(Player) {
    const player = Player.instances[0]
    if (player) {
      this.distance = getDistance(player.position, this.position)
    }
  }

  playSoundStep() {
    this.onAnimLoop(() => {
      this.sound(STEP_L, Mob1.hearing / this.distance)
    })
    this.onAnimHalf(() => {
      this.sound(STEP_R, Mob1.hearing / this.distance)
    })
  }

  updateClipHit() {
    if (this.isAnim(ATTACK)) {
      this.anim(HIT)
      this.sound(HIT)
    } else {
      this.anim(BLOCK)
      this.sound(BLOCK)
    }
    this.onAnimEnd(() => {
      this.anim(IDLE_SHIELD)
    })
  }

  hit(entity) {
    if (this.isCooldown) return
    this.createParticles(entity)
    if (this.isAnim(ATTACK) || !inHitBox(this, entity, Math.PI)) {
      this.hp -= 1
    }
    this.positionVel.set(0, 0)
    this.rotationVel = 0
    if (this.hp > 0) this.updateClipHit()
    else this.updateClipDaying()
  }

  updateClipDaying() {
    this.anim(DEAD)
    this.sound(HIT)
    this.onAnimEnd(() => {
      this.scale.set(0, 0, 0)
      this.sound(DEAD)
      this.delete()
      if (Mob1.cbDead) Mob1.cbDead(this.position)
    })
  }

  createParticles(entity) {
    const x = (this.position.x * 2 + entity.position.x * 1) / 3
    const z = (this.position.z * 2 + entity.position.z * 1) / 3
    this.parent.add(new Particles(new Vector3(x, this.position.y, z)))
  }

  get isBusy() {
    return (
      this.isAnim(HIT) ||
      this.isAnim(BLOCK) ||
      this.isAnim(ATTACK) ||
      this.hp <= 0
    )
  }

  get isCooldown() {
    return this.isAnim(HIT) || this.isAnim(BLOCK) || this.hp <= 0
  }

  initAnimations() {
    this.loadAnim(ATTACK, 'attack', 2, true)
    this.loadAnim(BLOCK, 'block', 0.2, true)
    this.loadAnim(DEAD, 'death', 2, true)
    this.loadAnim(HIT, 'hit', 0.5, true)
    this.loadAnim(IDLE, 'idle ', 2)
    this.loadAnim(IDLE_SHIELD, 'idle shield', 2)
    this.loadAnim(STRAF_SHIELD, 'straff shield', 0.5)
    this.loadAnim(WALK_SHIELD, 'walk shield', 1.48)
    this.loadAnim(WALK, 'walk', 1.48)
  }

  initSounds() {
    this.loadSound(BLOCK, 'sound/hit_iron[1-3].wav')
    this.loadSound(HIT, 'sound/hit_mob.wav')
    this.loadSound(ATTACK, 'sound/attack_mob.wav')
    this.loadSound(STEP_L, 'sound/step_iron1.wav')
    this.loadSound(STEP_R, 'sound/step_iron3.wav')
    this.loadSound(DEAD, 'sound/death.wav')
  }

  static onDead(callback) {
    this.cbDead = callback
  }

  static update(dt, Player) {
    for (const mob of Mob1.instances) mob.update(dt, Player)
  }
}
