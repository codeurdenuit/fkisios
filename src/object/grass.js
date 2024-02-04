import { Mesh, Clock } from 'three'
import materialGrass from '../shader/grass'
import materialPlant from '../shader/plant'
import { replaceMaterial } from '../function/function'

export default class Grass extends Mesh {
  static instances = []
  static cbCut = null
  static sound = new Audio('sound/cut.wav')

  constructor(mesh) {
    super()
    this.initVisual(mesh)
    this.children[0].visible = false
    this.clock = null
    this.progress = 0
    Grass.instances.push(this)
  }

  initVisual(mesh) {
    if (mesh.name.includes('plant')) replaceMaterial(mesh, materialPlant)
    else replaceMaterial(mesh, materialGrass)
    this.copy(mesh)
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
    this.progress += dt * 2.5
    if (this.progress <= 1) {
      this.children[0].morphTargetInfluences[0] = Math.sin(
        (Math.PI / 2) * this.progress
      )
      this.children[0].morphTargetInfluences[1] =
        Math.pow(Math.exp(this.progress), 2) / 7.5
      this.children[0].position.y = 0.1 * Math.sin(Math.PI * this.progress)
      requestAnimationFrame(this.animation)
    } else {
      this.children[0].visible = false
    }
  }

  static onCut(callback) {
    this.cbCut = callback
  }

  static update(dt, Player) {
    const player = Player.instances[0]
    const shaderGrass = materialGrass.userData.shader
    const shaderPlant = materialPlant.userData.shader
    if (!player || !shaderGrass || !shaderPlant) return
    player.getWorldPosition(shaderGrass.uniforms.playerPos.value)
    player.getWorldPosition(shaderPlant.uniforms.playerPos.value)
    shaderGrass.uniforms.time.value += dt
    shaderPlant.uniforms.time.value += dt
  }
}
