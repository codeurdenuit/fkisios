import { Scene } from 'three'
import physic from './engine/physic'
import Graphic from './engine/graphic'
import Camera from './engine/camera'
import Light from './engine/light'
import loadAssets from './tool/loader'
import Character from './entity/character'
import World from './entity/world'

const meshes = await loadAssets('./glb/world0.glb')

const scene = new Scene()

const world = new World(meshes.visuals, meshes.colliders, physic)
const player = new Character(meshes.players[0], physic)
const light = new Light()

scene.add(world)
scene.add(player)
scene.add(light)

const camera = new Camera()

const graphic = new Graphic(scene, camera)

graphic.onUpdate((dt) => {
  physic.step()
  player.update()
  camera.update(player)
  light.update(player)
})


graphic.start()



