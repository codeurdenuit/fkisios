import { Vector3, LoopOnce } from 'three'
import Ai from '../control/ai'
import Particles from '../effect/particles'
import Entity from './entity'
import { getGap, inHitBox, browse, getDistance } from '../tool/function'

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
const SOUND_RANGE = 2
const VELOCITY = 0.4
const DEMAGE = 1.5

export default class Mob1 extends Entity {
  static hitAngle = Math.PI / 2
  static hitRange = 1.8
  static cbDelete = null
  hp = 2
  distance = 999
  ctrl = null

  constructor(mesh, origin, physic) {
    super(mesh, origin, physic)
    this.ctrl = new Ai(4, origin.position, 0.7)
  }

  initVisual(mesh) {
    browse(mesh, (m) => (m.castShadow = true))
    mesh.position.y -= 0.5
    mesh.scale.set(1.5, 1.5, 1.5)
    this.add(mesh)
  }

  onUpdate(dt, player) {
    if (!this.isBusy) {
      if (this.ctrl.attack) {
        this.updatePropsAttack()
        this.updateAnimAttack(player)
      } else if (this.ctrl.moving) {
        this.updatePropsWalk(dt)
        this.updateAnimWalk()
      } else {
        this.updatePropsIdle(dt)
        this.updateAnimIdle()
      }
    }
    this.updateDistance(player)
  }

  updatePropsAttack() {
    this.positionVel.set(0, 0)
    this.rotationVel = 0
  }

  updateAnimAttack(player) {
    if (!player) return
    if (!this.anim(ATTACK)) return
    this.onAnimHalf(() => {
      this.sound(ATTACK)
      if (inHitBox(this, player)) {
        player.hit(this, DEMAGE)
      }
    })
  }

  updatePropsWalk(dt) {
    this.positionVel.x = this.ctrl.axis.x * VELOCITY
    this.positionVel.y = this.ctrl.axis.y * VELOCITY
    this.rotationVel = getGap(this.ctrl.angle, this.rotation.y) * dt * 2
  }

  updateAnimWalk() {
    if (this.ctrl.focus) {
      if (!this.anim(WALK_SHIELD)) return
      this.soundStep()
    } else {
      if (!this.anim(WALK)) return
      this.soundStep()
    }
  }

  updatePropsIdle(dt) {
    this.positionVel.set(0, 0)
    this.rotationVel = getGap(this.ctrl.angle, this.rotation.y) * dt * 2
  }

  updateAnimIdle() {
    if (this.rotating) {
      if (!this.anim(STRAF_SHIELD, this.signRotation)) return
      this.soundStep()
    } else if (this.ctrl.focus) {
      this.anim(IDLE_SHIELD)
    } else {
      this.anim(IDLE)
    }
  }

  updateProsHit() {
    this.positionVel.set(0, 0)
    this.rotationVel = 0
  }

  updateAnimHit() {
    this.anim(HIT)
    this.sound(HIT)
  }

  updateAnimBlock() {
    this.anim(BLOCK)
    this.sound(BLOCK)
  }

  updateAnimDead() {
    this.anim(DEAD)
    this.sound(HIT)
    this.onAnimEnd(() => {
      this.sound(DEAD)
      this.delete()
      if (Mob1.cbDelete) Mob1.cbDelete(this.position, this)
    })
  }

  hit(entity) {
    if (this.isCooldown) return
    this.createParticles(entity)
    this.updateProsHit()
    if (this.isVulnerable(entity)) {
      this.hp -= 1
      if (this.hp > 0) this.updateAnimHit()
      else this.updateAnimDead()
    } else {
      this.updateAnimBlock()
    }
  }

  updateDistance(player) {
    if (player) {
      this.distance = getDistance(player.position, this.position)
    }
  }

  soundStep() {
    this.onAnimLoop(() => {
      this.sound(STEP_L, this.volume)
    })
    this.onAnimHalf(() => {
      this.sound(STEP_R, this.volume)
    })
  }

  createParticles(entity) {
    const x = (this.position.x * 2 + entity.position.x * 1) / 3
    const z = (this.position.z * 2 + entity.position.z * 1) / 3
    this.parent.add(new Particles(new Vector3(x, this.position.y, z)))
  }

  isVulnerable(entity) {
    return this.isAnim(ATTACK) || !inHitBox(this, entity, Math.PI)
  }

  get isBusy() {
    return (
      this.isAnim(HIT) || this.isAnim(BLOCK) || this.isAnim(ATTACK) || this.hp <= 0
    )
  }

  get isCooldown() {
    return this.isAnim(HIT) || this.isAnim(BLOCK) || this.hp <= 0
  }

  get volume() {
    return SOUND_RANGE / this.distance
  }

  initAnimations() {
    this.loadAnim(ATTACK, 'attack', 2, true)
    this.loadAnim(BLOCK, 'block', 0.2, true)
    this.loadAnim(DEAD, 'dead', 2, true)
    this.loadAnim(HIT, 'hit', 0.5, true)
    this.loadAnim(IDLE, 'idle', 2)
    this.loadAnim(IDLE_SHIELD, 'idle_shield', 2)
    this.loadAnim(STRAF_SHIELD, 'straff_shield', 0.5)
    this.loadAnim(WALK_SHIELD, 'walk_shield', 1.48)
    this.loadAnim(WALK, 'walk', 1.48)
  }

  initSounds() {
    this.loadSound(BLOCK, './sound/hit_iron[1-3].wav')
    this.loadSound(HIT, './sound/hit_mob.wav')
    this.loadSound(ATTACK, './sound/attack_mob.wav')
    this.loadSound(STEP_L, './sound/step_iron1.wav')
    this.loadSound(STEP_R, './sound/step_iron3.wav')
    this.loadSound(DEAD, './sound/death.wav')
  }
}
