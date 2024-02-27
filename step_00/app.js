import { Scene } from 'three'
import Graphic from './engine/graphic'
import Camera from './engine/camera'
import Light from './engine/light'
import World from './entity/world'
import loadAssets from './tool/loader'

const meshes = await loadAssets('./glb/world0.glb')

const scene = new Scene()
const world = new World(meshes.visuals)
const light = new Light()
const camera = new Camera()
const graphic = new Graphic(scene, camera)

scene.add(world)
scene.add(light)

graphic.onUpdate((dt) => {})

graphic.start()
