
export default class Sound {
  tracks = new Map()

  load(key) {
    const track = new Audio(key)
    this.tracks.set(key, track)
  }

  play(key) {
    const track = this.tracks.get(key)
    track.currentTime = 0
    track.play()
  }
}
