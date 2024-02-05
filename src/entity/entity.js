import {
  Mesh,
  Vector2,
  AnimationMixer,
  AnimationClip,
  LoopOnce,
  Object3D
} from 'three'
import overwrite from '../function/overwrite'
import Sound from '../engine/sound'
import Anim from '../engine/animation'

overwrite(Mesh, AnimationMixer, AnimationClip, LoopOnce)
import Rapier from '@dimforge/rapier3d-compat'
import { removeFromArray, randomInt, findByName } from '../function/function'

export default class Entity extends Object3D {
  static hitAngle = Math.PI / 2
  static hitDistance = 1.8
  sounds = new Map()
  animes = new Map()

  constructor(mesh, origin, physic) {
    super()
    this.mixer = new AnimationMixer(mesh)
    this.clips = mesh.animations
    this.collider = null
    this.rigidBody = this.initPhysic(physic, origin.position)
    this.physic = physic
    this.positionVel = new Vector2()
    this.rotationVel = 0
    this.hp = 3
    this.position.copy(origin.position)
    this.rotation.copy(origin.rotation)
  }

  update(dt) {
    this.updatePhysic()
    this.updateAnimation(dt)
  }

  initPhysic(physic, origin) {
    const rigidBodyDesc = Rapier.RigidBodyDesc.dynamic()
    rigidBodyDesc.setTranslation(origin.x, origin.y, origin.z)
    const rigidBody = physic.createRigidBody(rigidBodyDesc)
    this.collider = physic.createCollider(
      Rapier.ColliderDesc.ball(0.5),
      rigidBody
    )
    return rigidBody
  }

  updatePhysic() {
    const voll = this.rigidBody.linvel()
    this.rigidBody.setLinvel(
      { x: this.positionVel.x, y: voll.y, z: this.positionVel.y },
      true
    )
    this.position.copy(this.rigidBody.translation())
    this.rotation.y += this.rotationVel
  }

  loadSound(key, src) {
    const sound = new Sound(src)
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
    if (this.animes.get(key).playing) return
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
    removeFromArray(this, this.constructor.instances)
    this.physic.removeCollider(this.collider)
    this.physic.removeRigidBody(this.rigidBody)
    this.removeFromParent()
  }
}
