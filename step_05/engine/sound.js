import { getSrc, randomInt } from '../tool/function'

export default class Sound {
  tracks = new Map()
  current = null

  load(key) {
    const urls = getSrc(key)
    const track = []
    for (const url of urls) {
      const audio = new Audio(url)
      track.push(audio)
    }
    this.tracks.set(key, track)
  }

  play(key, volume = 1) {
    this.stop()
    const track = this.tracks.get(key)
    const index = randomInt(track.length)
    track[index].play()
    this.current = track[index]
  }

  stop() {
    if (!this.current) return
    this.current.pause()
    this.current.currentTime = 0
  }
}
