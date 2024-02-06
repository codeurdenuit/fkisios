import { LoopOnce } from 'three'
import { randomInt, getSrc, findByName } from '../tool/function'

export default class Clip {
  animations = []
  mixer = null
  current = null

  constructor(mixer, clips, name, duration, once) {
    const names = getSrc(name)
    const clipsUsed = names.map((n) => findByName(n, clips))
    for (const clip of clipsUsed) {
      const anim = mixer.clipAction(clip)
      anim.setDuration(duration)
      if (once) anim.setLoop(LoopOnce)
      anim.clampWhenFinished = true
      this.animations.push(anim)
    }
    this.mixer = mixer
  }

  stop() {
    if (this.current === null) return
    this.current.stop()
  }

  play(sign) {
    if (this.playing) return
    this.mixer._listeners = {}
    const index = randomInt(0, this.animations.length - 1)
    const anim = this.animations[index]
    anim.play()
    if (sign) anim.timeScale = Math.abs(anim.timeScale) * sign
    this.current = anim
    return anim
  }

  get playing() {
    for (let i = 0; i < this.animations.length; i++)
      if (this.animations[i].isRunning()) return true
    return false
  }

  set duration(value) {
    this.current.setDuration(value)
  }
}
