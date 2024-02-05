import { Vector3 } from 'three'
import Ai from '../control/control_ai'
import Particles from '../effect/particles'
import Entity from './entity'
import Mob1 from './mob1'
import {
  getGap,
  inHitBox,
  castShadowRecursive,
  getDistance
} from '../function/function'

const ATTACK = 1
const JUMP = 2
const DEAD = 3
const HIT = 4
const IDLE = 5

export default class Mob2 extends Entity {
  static instances = Mob1.instances
  static hitAngle = Math.PI / 2
  static hitDistance = 1.8
  static velocity = 0.4
  static hearing = 0.5
  static cbDead = null

  constructor(mesh, origin, physic) {
    super(mesh, origin, physic)
    this.ctrl = new Ai(2, origin, 0.5)
    this.initVisual(mesh)
    this.initAnimations()
    this.initSounds()
    this.hp = 5
    this.distance = 999
    Mob2.instances.push(this)
  }

  initVisual(mesh) {
    castShadowRecursive(mesh)
    mesh.position.y -= 0.4
    mesh.scale
    this.add(mesh)
  }

  update(dt, Player) {
    if (!this.isBusy) {
      this.ctrl.compute(dt, Player, this.position)
      this.positionVel.x = this.ctrl.axis.x * Mob2.velocity
      this.positionVel.y = this.ctrl.axis.y * Mob2.velocity
      this.rotationVel = getGap(this.ctrl.angle, this.rotation.y) * dt * 2
      if (this.ctrl.attack) {
        this.updateClipAttack(Player)
      } else {
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
    console.log('updateClipAttack')
    this.positionVel.x = 3 * Math.cos(this.rotation.y - Math.PI / 2)
    this.positionVel.y = -3 * Math.sin(this.rotation.y - Math.PI / 2)
    this.anim(ATTACK)
    this.sound(JUMP)
    this.onAnimHalf(() => {
      if (inHitBox(this, player)) {
        player.hit(this, 0.5)
      }
    })
    this.onAnimEnd(() => {
      this.positionVel.x = 0
      this.positionVel.y = 0
    })
  }

  updateClipMove() {
    if (this.positionVel.length() !== 0) {
      if (!this.isAnim(JUMP)) {
        this.anim(JUMP)
        this.onAnimHalf(() => {
          this.sound(JUMP, Mob2.hearing / this.distance)
        })
      }
    } else {
      if (!this.isAnim(IDLE)) {
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
    if (Mob2.cbDead) Mob2.cbDead(this.position)
    this.delete()
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

  initAnimations() {
    this.loadAnim(ATTACK, 'attack', 1, true)
    this.loadAnim(HIT, 'hit', 0.4, true)
    this.loadAnim(IDLE, 'idle', 2)
    this.loadAnim(JUMP, 'jump', 1)
  }

  initSounds() {
    this.loadSound(JUMP, 'sound/jump.wav')
    this.loadSound(HIT, 'sound/hit_mob.wav')
    this.loadSound(DEAD, 'sound/death.wav')
  }

  static onDead(callback) {
    this.cbDead = callback
  }

  static update(dt, Player) {
    for (const mob of Mob2.instances) mob.update(dt, Player)
  }
}
