import {clone, spreadAround, proba, cleanGame, removeFromArray} from './tool/function'
import { Scene } from 'three'
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
import Graphic from './engine/graphic'
import Camera from './engine/camera'
import Light from './engine/light'
import Rules from './tool/rules'
import UI from './ui/ui'
import Home from './ui/home'
import loadAssets from './tool/loader'
import physic from './engine/physic'


const ast = await loadAssets()
const home = new Home()

async function main() {
  const scene = new Scene()

  const rubies = ast.meshesRubis.map((m) => new Rubis(m))
  const hearts = ast.meshesHeart.map((m) => new Heart(m))
  const bloks = ast.meshesBlock.map((m) => new Block(m, physic))
  const boxes = ast.meshesBox.map((m) => new Box(m, physic))
  const areas = ast.meshesArea.map((m) => new Area(m))
  const grasses = ast.meshesGrass.map((m) => new Grass(m))
  const player = new Player(clone(ast.meshPlayer), ast.spawn, physic)
  const mobs1 = ast.spawnsMobA.map((m) => new Mob1(clone(ast.meshMob1), m, physic))
  const mobs2 = ast.spawnsMobB.map((m) => new Mob2(clone(ast.meshMob2), m, physic))
  const world = new World(ast.meshesSolid, ast.meshesCollider, physic)
  const camera = new Camera(player)
  const focus = new Focus()
  const ui = new UI(player)
  const light = new Light()
  const graphic = new Graphic(scene, camera, focus)
  const mobs = mobs1.concat(mobs2)
  const rules = new Rules(player, bloks, boxes, areas, mobs, world, home, light)

  scene.add(...rubies)
  scene.add(...hearts)
  scene.add(...bloks)
  scene.add(...boxes)
  scene.add(...grasses)
  scene.add(...mobs)
  scene.add(player)
  scene.add(world)
  scene.add(light)

  graphic.onUpdate((dt) => {
    physic.step()
    for (const mob of mobs) mob.update(dt, player)
    for (const rubis of rubies) rubis.update(dt, player)
    for (const heart of hearts) heart.update(dt, player)
    for (const blok of bloks) blok.update(player)
    for (const box of boxes) box.update(dt)
    player.update(dt, mobs, grasses, boxes, areas)
    Grass.update(dt, player)
    world.update(dt)
    focus.update(dt, player, camera)
    camera.update(player)
    rules.update(dt)
    light.update(player)
    ui.update(player)
  })

  Grass.onCut((pos) => {
    if (proba(0.05)) createRubis(pos)
    if (proba(0.05) && player.hp < 4) createHeart(pos)
  })

  Box.onBreak((pos) => {
    for (let i = 0; i < 4; i++) createRubis(pos)
    createRubis(pos, 10)
  })

  Box.onDelete((instance) => {
    removeFromArray(instance, boxes)
  })

  Mob1.onDelete((pos, instance) => {
    if (proba(0.2)) createHeart(pos)
    if (proba(0.2)) createRubis(pos, 10)
    removeFromArray(instance, mobs)
  })

  Mob2.onDelete((pos, instance) => {
    if (proba(0.25)) createHeart(pos)
    removeFromArray(instance, mobs)
  })

  home.onStart(() => {
    home.hide()
    world.playSound()
    player.active = true
  })

  rules.onGameover(() => {
    const objects3D = {player, mobs, bloks, boxes, grasses, hearts, rubies, focus, world }
    cleanGame(objects3D, graphic, ui)
    main()
  })

  home.show()
  graphic.start()

  function createRubis(pos, val = 1) {
    const ruby = new Rubis(ast.meshesRubis[0], spreadAround(pos, 1, 1), val)
    rubies.push(ruby)
    scene.add(ruby)
  }

  function createHeart(pos) {
    const heart = new Heart(ast.meshesHeart[0], spreadAround(pos, 1, 1))
    hearts.push(heart)
    scene.add(heart)
  }
}

main()
