import { Mesh } from 'three'
import { removeFromArray, inBox } from '../tool/function'
const HITBOX = 0.8
const HP = 1

export default class Heart extends Mesh {
  static instances = []
  static sound = new Audio('sound/heart.wav')
  progress = 0
  holder = null
  yOrigin = null

  constructor(mesh, position) {
    super()
    this.initVisual(mesh)
    this.initState(position)
    Heart.instances.push(this)
  }

  initVisual(mesh) {
    this.copy(mesh, true)
    this.castShadow = true
  }

  initState(position) {
    if (position) this.position.copy(position)
    this.yOrigin = this.position.y
  }

  checkPlayer(Player) {
    if (this.holder) return
    for (const player of Player.instances) {
      if (inBox(this.position, player.position, HITBOX)) {
        this.collect(player)
      }
    }
  }

  collect(entity) {
    this.holder = entity
    this.position.copy(this.holder.position)
    this.position.y += 1.5
    this.rotation.y = 0
    this.progress = 0
    Heart.sound.play()
    entity.addHP(HP)
    setTimeout(() => {
      this.removeFromParent()
      removeFromArray(this, Heart.instances)
    }, 500)
  }

  update(dt, Player) {
    this.checkPlayer(Player)
    if (this.holder) {
      this.position.x = this.holder.position.x
      this.position.z = this.holder.position.z
      const scal = 0.5 + 0.5 * Math.sin(Math.PI * this.progress)
      this.scale.set(scal, scal, scal)
      this.progress += dt * 2
    } else {
      this.rotateY(dt)
      if (this.progress < 1) {
        this.position.y = Math.sin(Math.PI * this.progress) + this.yOrigin
        this.progress += dt * 3
      } else {
        this.position.y = this.yOrigin
      }
    }
  }

  static update(dt, Player) {
    for (const heart of Heart.instances) heart.update(dt, Player)
  }
}
