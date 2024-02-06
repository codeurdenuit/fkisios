import {Scene} from 'three'
import World from './entity/world'
import Player from './entity/player'
import Mob1 from './entity/mob1'
import Mob2 from './entity/mob2'
import Grass from './object/grass'
import Block from './object/block'
import Box from './object/box'
import Rubis from './object/rubis'
import Heart from './object/heart'
import Area from './effect/area'
import Focus from './effect/focus'
import physic from './engine/physic'
import Graphic from './engine/graphic'
import Camera from './engine/camera'
import Rules from './tool/rules'
import UI from './ui/ui'
import Menu from './ui/menu'
import loadAssets from './tool/loader'
import { clone, spreadAround, proba } from './tool/function'

const ast = await loadAssets()

const scene = new Scene()

ast.meshesRubis.forEach((m) => scene.add(new Rubis(m)))
ast.meshesHeart.forEach((m) => scene.add(new Heart(m)))
ast.meshesBlock.forEach((m) => scene.add(new Block(m, physic)))
ast.meshesBox.forEach((m) => scene.add(new Box(m, physic)))
ast.meshesArea.forEach((m) => new Area(m))
ast.meshesGrass.forEach((m) => scene.add(new Grass(m)))
ast.spawnsMobA.forEach((s) => scene.add(new Mob1(clone(ast.meshMob1), s, physic)))
ast.spawnsMobB.forEach((s) => scene.add(new Mob2(clone(ast.meshMob2), s, physic)))
ast.spawnsPlayer.forEach((s) =>
  scene.add(new Player(clone(ast.meshPlayer), s, physic))
)
const world = new World(ast.meshesSolid, ast.meshesCollider, physic)
scene.add(world)

const camera = new Camera(Player)
const focus = new Focus()
const ui = new UI(Player)
const menu = new Menu()
const rules = new Rules(Player, Block, Box, Area, world, menu)
const graphic = new Graphic(scene, camera, focus)

graphic.onUpdate((dt) => {
  physic.step()
  Player.update(dt, Mob1, Grass, Box, Area)
  Mob1.update(dt, Player) //instances of MasterClass
  Rubis.update(dt, Player)
  Heart.update(dt, Player)
  Block.update(Player)
  Box.update(dt)
  Grass.update(dt, Player)
  world.update(dt, Player)
  focus.update(dt, Player, camera)
  camera.update(Player)
  rules.update(dt)
  ui.update(Player)
})

menu.onStart(() => {
  menu.hide()
  world.start()
  Player.getInstance(0).active = true
})

Grass.onCut((pos) => {
  const player = Player.getInstance(0)
  if (proba(0.05))
    scene.add(new Rubis(ast.meshesRubis[0], spreadAround(pos, 1, 1)))

  if (proba(0.05) && player.hp < 4)
    scene.add(new Heart(ast.meshesHeart[0], spreadAround(pos, 1, 1)))
})

Box.onBreak((pos) => {
  for (let i = 0; i < 4; i++)
    scene.add(new Rubis(ast.meshesRubis[0], spreadAround(pos, 1, 1)))
  scene.add(new Rubis(ast.meshesRubis[0], spreadAround(pos, 1, 1), 10))
})

Mob1.onDead((pos) => {
  if (proba(0.2)) return
  scene.add(new Heart(ast.meshesHeart[0], spreadAround(pos, 1, 1)))
  if (proba(0.2))
    scene.add(new Rubis(ast.meshesRubis[0], spreadAround(pos, 1, 1)))
})

Mob2.onDead((pos) => {
  if (proba(0.25)) return
  scene.add(new Heart(ast.meshesHeart[0], spreadAround(pos, 1, 1)))
})

graphic.start()
