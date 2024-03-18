import { LoopOnce, AnimationMixer } from 'three'
import { findByName } from '../tool/function'

export default class Clip {
  animations = new Map()
  mixer = null
  clips = null
  current = null

  constructor(mesh) {
    this.mixer = new AnimationMixer(mesh)
    this.clips = mesh.clips
  }

  load(name, duration, once) {
    const clip = findByName(name, this.clips)
    const animation = this.mixer.clipAction(clip)
    animation.setDuration(duration)
    if (once) animation.setLoop(LoopOnce)
    this.animations.set(name, animation)
  }

  play(name, sign) {
    const animation = this.animations.get(name)
    if (this.current && this.current !== animation) this.current.stop()
    this.current = animation
    if (this.current.isRunning()) return
    this.current.play()
    if (sign) anim.timeScale = Math.abs(anim.timeScale) * sign
  }

  isPlaying(name) {
    return this.animations.get(name).isRunning()
  }

  update(dt) {
    this.mixer.update(dt)
  }
}
