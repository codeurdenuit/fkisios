import Rapier from '@dimforge/rapier3d-compat'
import Sound from '../engine/sound'
import materialTree1 from '../shader/tree'
import { replaceMaterial, probaSeed } from '../tool/function'
import { Object3D, AmbientLight, DirectionalLight, Vector2, Color } from 'three'

const materialTree2 = materialTree1.clone()
materialTree2.color = new Color('#a2d1c3')

export default class World extends Object3D {
  colliders = []
  physic = null
  constructor(meshesSolid, meshesCollider, physic) {
    super()
    this.initPhysic(physic, meshesCollider)
    this.initVisual(meshesSolid)
    this.initLights()
    this.initSounds()
  }

  initPhysic(physic, meshesCollider) {
    for (const mesh of meshesCollider) {
      this.createCollider(mesh, physic)
    }
    this.physic = physic
  }

  createCollider(mesh, physic) {
    const vertices = new Float32Array(mesh.geometry.attributes.position.array)
    const indices = new Float32Array(mesh.geometry.index.array)
    const col = physic.createCollider(Rapier.ColliderDesc.trimesh(vertices, indices))
    this.colliders.push(col)
  }

  initVisual(meshes) {
    for (const mesh of meshes) {
      if (mesh.name.includes('tree')) {
        replaceMaterial(mesh, probaSeed(0.8) ? materialTree1 : materialTree2)
      }
      this.add(mesh)
    }
  }

  initLights() {
    const ambient = new AmbientLight(0xffffff, 0.8)
    this.add(ambient)
    const dirLight = new DirectionalLight(0xffffff, 1)
    dirLight.position.set(-10, 20, 0)
    dirLight.target = new Object3D()
    dirLight.castShadow = true
    dirLight.shadow.mapSize = new Vector2(1024 * 2, 1024 * 2)
    dirLight.shadow.camera.top = 7
    dirLight.shadow.camera.bottom = -7
    dirLight.shadow.camera.left = -7
    dirLight.shadow.camera.right = 7
    dirLight.shadow.bias = -0.0001
    this.add(dirLight)
    this.add(dirLight.target)
    this.ambient = ambient
    this.dirLight = dirLight
    this.dirLight.position.set(24, 5, 10)
    this.dirLight.target.position.set(20, 0, 0)
  }

  initSounds() {
    this.soundAmbient = new Sound('sound/ambient.mp3', 0.3, true)
    this.soundMusic = new Sound('sound/AddingTheSun.mp3', 0.4, true)
    this.soundAmbient.play()
    this.soundMusic.play()
  }

  update(dt, Player) {
    const pl = Player.getInstance(0)
    if (pl && pl.active) {
      this.dirLight.position.set(pl.position.x - 10, 20, pl.position.z + 10)
      this.dirLight.target.position.set(pl.position.x, 0, pl.position.z - 5)
    }
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
