import {
  Mesh,
  Vector2,
  AnimationMixer,
  AnimationClip,
  LoopOnce,
  Object3D,
  LoopRepeat
} from 'three'
import overwrite from '../function/overwrite'

overwrite(Mesh, AnimationMixer, AnimationClip, LoopOnce)
import Rapier from '@dimforge/rapier3d-compat'
import { removeFromArray, randomInt } from '../function/function'

export default class Entity extends Object3D {
  static hitAngle = Math.PI / 2
  static hitDistance = 1.8

  constructor(mesh, origin, physic) {
    super()
    this.mixer = new AnimationMixer(mesh)
    this.clips = new Map()
    this.sounds = new Map()
    this.collider = null
    this.rigidBody = this.initPhysic(physic, origin.position)
    this.physic = physic
    this.positionVel = new Vector2()
    this.rotationVel = 0
    this.currentClip = null
    this.animationStep = 1
    this.animationStepPass = false
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

  loadSound(name, url, volume = 1, loop = false) {
    const audio = new Audio(url)
    audio.volume = volume
    audio.loop = loop
    this.sounds.set(name, audio)
  }

  playSound(name, rMin, rMax) {
    const n = rMin ? `${name}${randomInt(rMin, rMax)}` : name
    this.sounds.get(n).play()
    return this.sounds.get(n)
  }

  stop(name) {
    this.sounds.get(name).pause()
    this.sounds.get(name).currentTime = 0
  }

  isPlaying(name) {
    return !this.sounds.get(name).paused
  }

  loadClip(name, animation, duration, once, clampWhenFinished = false) {
    this.clips.set(name, this.mixer.clipAction(animation))
    this.clips.get(name).setDuration(duration)
    this.clips.get(name).setLoop(once || LoopRepeat)
    this.clips.get(name).clampWhenFinished = clampWhenFinished
  }

  playClip(name, sign) {
    if (this.isClip(name)) return
    this.mixer._listeners = {}
    this.stopAllClip()
    const clip = this.clips.get(name)
    clip.play()
    if (sign) clip.timeScale = Math.abs(clip.timeScale) * sign
    this.currentClip = clip
    return this.currentClip
  }

  stopAllClip() {
    for (const [nameClip, clip] of this.clips) {
      clip.stop()
    }
  }

  setDurationClip(name, duration) {
    this.clips.get(name).setDuration(duration)
  }

  isClip(name) {
    return this.clips.get(name).isRunning()
  }

  onClipEnd(callback) {
    this.mixer.addEventListener('finished', callback)
  }

  onClipLoop(callback) {
    this.mixer.addEventListener('loop', callback)
  }

  onClipHalf(callback) {
    this.mixer.addEventListener('half', callback)
  }

  onClipStep(step, callback) {
    this.animationCb = callback
    this.animationStep = step
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
