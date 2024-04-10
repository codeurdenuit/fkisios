
export default class Sound {
  tracks = new Map()
  current = null

  load(key) {
    const track = new Audio(key)
    this.tracks.set(key, track)
  }

  play(key) {
    this.stop()
    const track = this.tracks.get(key)
    track.play()
    this.current = track
  }

  stop() {
    if (!this.current) return
    this.current.pause()
    this.current.currentTime = 0
  }
}
