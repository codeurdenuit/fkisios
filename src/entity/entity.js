import { Vector2, AnimationMixer, Object3D } from 'three'
import Sound from '../engine/sound'
import Anim from '../engine/animation'
import { creatRigidBody } from '../tool/function'

export default class Entity extends Object3D {
  static hitAngle = Math.PI / 2
  static hitRange = 1.8
  sounds = new Map()
  animes = new Map()
  rotationVel = 0
  positionVel = new Vector2()
  hp = 3

  constructor(mesh, origin, physic) {
    super()
    this.mixer = new AnimationMixer(mesh)
    this.clips = mesh.animations
    this.initPhysic(physic, origin.position)
    this.initVisual(mesh)
    this.initAnimations()
    this.initSounds()
    this.position.copy(origin.position)
    this.rotation.copy(origin.rotation)
  }

  update(...args) {
    this.ctrl.compute(args[0], args[1], this.position)
    this.onUpdate(...args)
    this.updatePhysic()
    this.updateVisual()
    this.updateAnimation(args[0])
  }

  initPhysic(physic, origin) {
    const { rigidBody, collider } = creatRigidBody(origin, physic)
    this.rigidBody = rigidBody
    this.collider = collider
    this.physic = physic
  }

  updatePhysic() {
    const y = this.rigidBody.linvel().y
    const x = this.positionVel.x
    const z = this.positionVel.y
    this.rigidBody.setLinvel({ x, y, z }, true)
    this.position.copy(this.rigidBody.translation())
    this.rotation.y += this.rotationVel
  }

  updateVisual() {
    this.position.copy(this.rigidBody.translation())
    this.rotation.y += this.rotationVel
  }

  loadSound(key, src, vol = 1, loop = false) {
    const sound = new Sound(src, vol, loop)
    this.sounds.set(key, sound)
  }

  loadAnim(key, name, duration, once) {
    const clips = this.clips
    const anim = new Anim(this.mixer, clips, name, duration, once)
    this.animes.set(key, anim)
  }

  sound(key, vol) {
    this.sounds.get(key).play(vol)
  }

  stopSound(key) {
    this.sounds.get(key).stop()
  }

  anim(key, sign) {
    if (this.animes.get(key).playing) return false
    this.stopAnims()
    return this.animes.get(key).play(sign)
  }

  stopAnims() {
    for (const [nameAnim, anim] of this.animes) anim.stop()
  }

  setAnimDuration(key, duration) {
    this.animes.get(key).duration = duration
  }

  isAnim(key) {
    return this.animes.get(key).playing
  }

  onAnimEnd(callback) {
    this.mixer.addEventListener('finished', callback)
  }

  onAnimLoop(callback) {
    this.mixer.addEventListener('loop', callback)
  }

  onAnimHalf(callback) {
    this.mixer.addEventListener('half', callback)
  }

  updateAnimation(dt) {
    this.mixer.update(dt)
  }

  delete() {
    this.physic.removeCollider(this.collider)
    this.physic.removeRigidBody(this.rigidBody)
    this.removeFromParent()
    this.ctrl.delete()
  }

  get signRotation() {
    return Math.sign(this.rotationVel)
  }

  get rotating() {
    return Math.abs(this.rotationVel) > 0.01
  }

  get isFall() {
    const velocity = this.rigidBody.linvel()
    return velocity.y < -2.5
  }

  get active() {
    return this.ctrl.active
  }

  set active(value) {
    this.ctrl.active = value
  }

  static onDelete(callback) {
    this.cbDelete = callback
  }
}
