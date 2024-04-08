import { getSrc, randomInt, clamp1 } from '../tool/function'

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
    if (this.current) this.current.pause()
    const track = this.tracks.get(key)
    const index = randomInt(track.length)
    track[index].currentTime = 0
    track[index].play()
    track[index].volume = clamp1(volume)
    this.current = track[index]
  }
}
