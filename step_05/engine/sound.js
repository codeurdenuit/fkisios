import { getSrc, randomInt } from '../tool/function'

export default class Sound {
  tracks = new Map()

  load(key) {
    const srcs = getSrc(key)
    const track = []
    for (const src of srcs) {
      const audio = new Audio(src)
      track.push(audio)
    }
    this.tracks.set(key, track)
  }

  play(key) {
    const track = this.tracks.get(key)
    const index = randomInt(track.length)
    track[index].currentTime = 0
    track[index].play()
  }
}
