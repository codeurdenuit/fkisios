import { LoopOnce, AnimationMixer } from 'three'
import { findByName } from '../tool/function'

export default class Animator {
  animations = new Map()
  mixer = null
  clips = null
  current = null
  listenerEnd = new Map()
  listenerHalf = new Map()
  listenerStart = new Map()

  constructor(mesh) {
    this.mixer = new AnimationMixer(mesh)
    this.clips = mesh.clips
    this.initListners()
  }

  initListners() {
    this.mixer.addEventListener('loop', () => {
      this.fireListener(this.listenerEnd, this.current)
    })
    this.mixer.addEventListener('half', () => {
      this.fireListener(this.listenerHalf, this.current)
    })
  }

  load(name, duration, once) {
    const clip = findByName(name, this.clips)
    const animation = this.mixer.clipAction(clip)
    animation.setDuration(duration)
    if (once) animation.setLoop(LoopOnce)
    this.animations.set(name, animation)
  }

  play(name) {
    const animation = this.animations.get(name)
    if (this.current && this.current !== animation) this.current.stop()
    this.current = animation
    if (this.current.isRunning()) return
    this.fireListener(this.listenerStart, this.current)
    this.current.play()
  }

  isPlaying(name) {
    return this.animations.get(name).isRunning()
  }

  update(dt) {
    this.mixer.update(dt)
  }

  fireListener(listeners, anim) {
    const listener = listeners.get(anim)
    if (listener) listener()
  }

  onEnd(name, callback) {
    const anim = this.animations.get(name)
    this.listenerEnd.set(anim, callback)
  }

  onHalf(name, callback) {
    const anim = this.animations.get(name)
    this.listenerHalf.set(anim, callback)
  }

  onStart(name, callback) {
    const anim = this.animations.get(name)
    this.listenerStart.set(anim, callback)
  }
}
