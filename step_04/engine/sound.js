import { clamp1 } from '../tool/function'

export default class Sound {
  tracks = new Map()
  current = null

  load(key) {
    const track = new Audio(key)
    this.tracks.set(key, track)
  }

  play(key, volume = 1) {
    if (this.current) this.current.pause()
    const track = this.tracks.get(key)
    track.currentTime = 0
    track.play()
    track.volume = clamp1(volume)
    this.current = track
  }
}
