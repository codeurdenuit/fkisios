import { WebGLRenderer, Clock } from 'three'
import { getCanvas } from '../tool/function'

export default class Graphic extends WebGLRenderer {
  scene = null
  clock = new Clock()
  camera = null
  cbUpdate = null
  cbLoop = null

  constructor(scene, camera) {
    const canvas = getCanvas()
    super({ canvas })
    this.scene = scene
    this.camera = camera
    this.cbLoop = this.loop.bind(this)
    this.shadowMap.enabled = true
    this.loop()
  }

  loop() {
    const dt = this.clock.getDelta()
    if (this.cbUpdate) this.cbUpdate(dt)
    this.render(this.scene, this.camera)
    requestAnimationFrame(this.cbLoop)
  }

  onUpdate(callback) {
    this.cbUpdate = callback
  }
}
