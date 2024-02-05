import { getSrc, randomInt, clamp1 } from '../function/function'

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

  play(volume = 1) {
    this.stop()
    const index = randomInt(0, this.audios.length - 1)
    this.audios[index].play()
    this.audios[index].volume = clamp1(volume)
    this.current = this.audios[index]
  }
}
