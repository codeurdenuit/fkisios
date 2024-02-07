import { getSrc, randomInt, clamp1 } from '../tool/function'

export default class Sound {
  audios = []
  current = null

  constructor(src, volume = 1, loop = false) {
    const urls = getSrc(src)
    for (const url of urls) {
      const audio = new Audio(url)
      audio.volume = volume
      audio.loop = loop
      this.audios.push(audio)
    }
  }

  stop() {
    if (this.current === null) return
    this.current.pause()
    this.current.currentTime = 0
  }

  play(volume) {
    this.stop()
    const index = randomInt(0, this.audios.length - 1)
    this.audios[index].play()
    if (volume !== undefined) this.audios[index].volume = clamp1(volume)
    this.current = this.audios[index]
  }
  get isPlaying() {
    return !this.current.paused
  }

  set volume(value) {
    this.current.volume = value
  }

  get volume() {
    return this.current.volume
  }
}
