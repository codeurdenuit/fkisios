import { WebGLRenderer, Clock } from 'three'

export default class Graphic extends WebGLRenderer {
  scene = null
  clock = new Clock()
  cbUpdate = null
  camera = null
  cbLoop = null

  constructor(scene, camera) {
    super({ canvas, antialias: true })
    this.scene = scene
    this.camera = camera
    this.cbLoop = this.loop.bind(this)
    this.shadowMap.enabled = true
  }

  loop() {
    const dt = this.clock.getDelta()
    this.cbUpdate(dt)
    this.render(this.scene, this.camera)
    requestAnimationFrame(this.cbLoop)
  }

  start() {
    this.loop()
  }

  onUpdate(callback) {
    this.cbUpdate = callback
  }
}
