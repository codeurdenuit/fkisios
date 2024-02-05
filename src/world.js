import Rapier from '@dimforge/rapier3d-compat'
import { Object3D, AmbientLight, DirectionalLight, Vector2 } from 'three'
import materialTree from './shader/tree'
import { replaceMaterial } from './function/function'
import Sound from './engine/sound'

export default class World extends Object3D {
  constructor(meshesSolid, meshesCollider, physic) {
    super()
    this.initPhysic(physic, meshesCollider)
    this.initVisual(meshesSolid)
    this.initLights()
    const ambient = new Sound('sound/ambient.mp3', 0.5, true)
    const music = new Sound('sound/AddingTheSun.mp3', 0.4, true)
    ambient.play()
    music.play()
    this.soundAmbient = ambient
    this.soundMusic = music
  }

  initPhysic(physic, meshesCollider) {
    for (const mesh of meshesCollider) {
      this.createCollider(mesh, physic)
    }
  }

  createCollider(mesh, physic) {
    const vertices = new Float32Array(mesh.geometry.attributes.position.array)
    const indices = new Float32Array(mesh.geometry.index.array)
    physic.createCollider(Rapier.ColliderDesc.trimesh(vertices, indices))
  }

  initVisual(meshes) {
    for (const mesh of meshes) {
      if (mesh.name.includes('tree')) replaceMaterial(mesh, materialTree)
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

  update(dt, Player) {
    const player = Player.instances[0]
    if (player && player.active) {
      this.dirLight.position.set(
        player.position.x - 10,
        20,
        player.position.z + 10
      )
      this.dirLight.target.position.set(
        player.position.x,
        0,
        player.position.z - 5
      )
    }
    const shader = materialTree.userData.shader
    if (shader) shader.uniforms.time.value += dt
  }

  start() {
    this.soundAmbient.stop()
    this.soundMusic.stop()
  }
}
