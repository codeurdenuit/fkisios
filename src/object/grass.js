import { Mesh, Clock } from 'three'
import materialGrass from '../shader/grass'
import materialPlant from '../shader/plant'
import { replaceMaterial } from '../tool/function'

export default class Grass extends Mesh {

  static cbCut = null
  static sound = new Audio('./sound/cut.wav')
  progress = 0
  clock = null

  constructor(mesh) {
    super()
    this.initVisual(mesh)
  }

  initVisual(mesh) {
    const isPlant = mesh.isRootName('plant')
    replaceMaterial(mesh, isPlant ? materialPlant : materialGrass)
    this.copy(mesh)
    this.children[0].visible = false
  }

  cut() {
    this.morphTargetInfluences[0] = 1
    this.children[0].visible = true
    this.clock = new Clock()
    this.animation = this.animation.bind(this)
    this.animation()
    if (Grass.sound.paused) Grass.sound.play()
    if (Grass.cbCut) {
      const pos = this.position.clone()
      pos.y += 0.5
      Grass.cbCut(pos)
    }
  }

  get isCut() {
    return this.progress >= 1
  }

  animation() {
    const dt = this.clock.getDelta()
    const child = this.children[0]
    this.progress += dt * 2.5
    if (this.progress <= 1) {
      child.morphTargetInfluences[0] = Math.sin((Math.PI / 2) * this.progress)
      child.morphTargetInfluences[1] = Math.pow(Math.exp(this.progress), 2) / 7
      child.position.y = 0.1 * Math.sin(Math.PI * this.progress)
      requestAnimationFrame(this.animation)
    } else {
      child.visible = false
    }
  }

  delete() {
    this.clear()
    this.removeFromParent()
  }

  static onCut(callback) {
    this.cbCut = callback
  }

  static update(dt, player) {
    const shaderGrass = materialGrass.userData.shader
    const shaderPlant = materialPlant.userData.shader
    if (!player || !shaderGrass || !shaderPlant) return
    player.getWorldPosition(shaderGrass.uniforms.playerPos.value)
    player.getWorldPosition(shaderPlant.uniforms.playerPos.value)
    shaderGrass.uniforms.time.value += dt
    shaderPlant.uniforms.time.value += dt
  }
  
}
