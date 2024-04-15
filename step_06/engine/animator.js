import { LoopOnce, AnimationMixer } from 'three'
import { findByName } from '../tool/function'
import '../tool/overwrite'


export default class Animator {
  animations = new Map()
  mixer = null
  clips = null
  current = null
  listeners = new Map()

  constructor(mesh) {
    this.mixer = new AnimationMixer(mesh)
    this.clips = mesh.clips
    this.initListeners()
  }

  initListeners() {
    this.mixer.addEventListener('loop', () => {
      this.fireListener( this.current._clip.name, 'loop')
    })
    this.mixer.addEventListener('half', () => {
      this.fireListener( this.current._clip.name, 'half')
    })
  }

  load(name, duration, once) {
    const clip = findByName(name, this.clips)
    const animation = this.mixer.clipAction(clip)
    animation.setDuration(duration)
    if (once) animation.setLoop(LoopOnce)
    this.animations.set(name, animation)
    this.listeners.set(name, new Map())
  }

  play(name) {
    const animation = this.animations.get(name)
    if (this.current && this.current !== animation) this.current.stop()
    this.current = animation
    if (this.current.isRunning()) return
    this.fireListener( this.current._clip.name, 'start')
    this.current.play()
  }

  isPlaying(name) {
    return this.animations.get(name).isRunning()
  }

  update(dt) {
    this.mixer.update(dt)
  }

  fireListener(name, event) {
    const listener = this.listeners.get(name)
    if (listener.get(event)) listener.get(event)()
  }

  on(name, event, callback) {
    this.listeners.get(name).set(event, callback)
  }
}
