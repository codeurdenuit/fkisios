import Rapier from '@dimforge/rapier3d-compat'
import Sound from '../engine/sound'
import materialTree1 from '../shader/tree'
import { replaceMaterial, probaSeed, createCollider } from '../tool/function'
import { Object3D, Color } from 'three'

const materialTree2 = materialTree1.clone()
materialTree2.color = new Color('#a2d1c3')

export default class World extends Object3D {
  colliders = []
  physic = null
  constructor(meshesSolid, meshesCollider, physic) {
    super()
    this.initPhysic(physic, meshesCollider)
    this.initVisual(meshesSolid)
    this.initSounds()
  }

  initPhysic(physic, meshesCollider) {
    for (const mesh of meshesCollider) {
      createCollider(mesh, physic)
    }
    this.physic = physic
  }

  initVisual(meshes) {
    for (const mesh of meshes) {
      if (mesh.name.includes('tree')) {
        replaceMaterial(mesh, probaSeed(0.8) ? materialTree1 : materialTree2)
      }
      this.add(mesh)
    }
  }

  initSounds() {
    this.soundAmbient = new Sound('./sound/ambient.mp3', 0.2, true)
    this.soundMusic = new Sound('./sound/AddingTheSun.mp3', 0.2, true)
    this.soundAmbient.play()
    this.soundMusic.play()
  }

  update(dt) {
    const shader = materialTree1.userData.shader
    if (shader) shader.uniforms.time.value += dt
  }

  playSound() {
    if (!this.soundMusic.isPlaying) {
      this.soundAmbient.play()
      this.soundMusic.play()
    }
  }

  delete() {
    this.soundAmbient.stop()
    this.soundMusic.stop()
    this.clear()
    this.removeFromParent()
    for (const col of this.colliders) this.physic.removeCollider(col)
    this.colliders = []
  }

  set volume(value) {
    this.soundMusic.volume = value
  }

  get volume() {
    return this.soundMusic.volume
  }

}
