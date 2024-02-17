import { Vector3 } from 'three'
import Ai from '../control/ai'
import Particles from '../effect/particles'
import Entity from './entity'
import { getGap, inHitBox, browse, getDistance } from '../tool/function'

const ATTACK = 1
const JUMP = 2
const DEAD = 3
const HIT = 4
const IDLE = 5
const SOUND_RANGE = 1
const VELOCITY = 0.4
const DEMAGE = 1.5

export default class Mob2 extends Entity {
  static hitAngle = Math.PI / 2
  static hitRange = 1.8
  static cbDelete = null
  hp = 3
  distance = 999
  ctrl = null

  constructor(mesh, origin, physic) {
    super(mesh, origin, physic)
    this.ctrl = new Ai(2, origin, 0.5)
  }

  initVisual(mesh) {
    browse(mesh, (m) => (m.castShadow = true))
    mesh.position.y -= 0.4
    mesh.scale
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
        this.updateAnimIdle(player)
      }
    }
    this.updateDistance(player)
  }

  updatePropsAttack() {
    this.rotationVel = 0
    this.positionVel.x = 3 * Math.cos(this.rotation.y - Math.PI / 2)
    this.positionVel.y = -3 * Math.sin(this.rotation.y - Math.PI / 2)
  }

  updateAnimAttack(player) {
    if (!player) return
    if (!this.anim(ATTACK)) return
    this.sound(JUMP)
    this.onAnimHalf(() => {
      if (inHitBox(this, player)) {
        player.hit(this, DEMAGE)
      }
    })
    this.onAnimEnd(() => {
      this.positionVel.x = 0
      this.positionVel.y = 0
    })
  }

  updatePropsWalk(dt) {
    this.positionVel.x = this.ctrl.axis.x * VELOCITY
    this.positionVel.y = this.ctrl.axis.y * VELOCITY
    this.rotationVel = getGap(this.ctrl.angle, this.rotation.y) * dt * 2
  }

  updateAnimWalk() {
    if (!this.anim(JUMP)) return
    this.onAnimHalf(() => {
      this.sound(JUMP, this.volume)
    })
  }

  updatePropsIdle(dt) {
    this.positionVel.set(0, 0)
    this.rotationVel = getGap(this.ctrl.angle, this.rotation.y) * dt * 2
  }

  updateAnimIdle() {
    this.anim(IDLE)
  }

  updateDistance(player) {
    if (player) {
      this.distance = getDistance(player.position, this.position)
    }
  }

  updateClipHit() {
    this.anim(HIT)
    this.sound(HIT)
    this.onAnimEnd(() => {
      this.anim(IDLE)
    })
  }

  hit(entity) {
    if (this.isCooldown) return
    this.createParticles(entity)
    this.hp -= 1
    this.positionVel.set(0, 0)
    this.rotationVel = 0
    if (this.hp > 0) this.updateClipHit()
    else this.updateClipDaying()
  }

  updateClipDaying() {
    this.scale.set(0, 0, 0)
    this.sound(DEAD)
    this.delete()
    if (Mob2.cbDelete) Mob2.cbDelete(this.position, this)
  }

  createParticles(entity) {
    const x = (this.position.x * 3 + entity.position.x * 1) / 4
    const z = (this.position.z * 3 + entity.position.z * 1) / 4
    this.parent.add(new Particles(new Vector3(x, this.position.y - 0.2, z)))
  }

  get isBusy() {
    return this.isAnim(HIT) || this.isAnim(ATTACK) || this.hp <= 0
  }

  get isCooldown() {
    return this.isAnim(HIT) || this.hp <= 0
  }

  get volume() {
    return SOUND_RANGE / this.distance
  }

  initAnimations() {
    this.loadAnim(ATTACK, 'attack', 1, true)
    this.loadAnim(HIT, 'hit', 0.4, true)
    this.loadAnim(IDLE, 'idle', 2)
    this.loadAnim(JUMP, 'jump', 1)
  }

  initSounds() {
    this.loadSound(JUMP, './sound/jump.wav')
    this.loadSound(HIT, './sound/hit_mob.wav')
    this.loadSound(DEAD, './sound/death.wav')
  }

}
