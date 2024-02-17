import { Mesh } from 'three'
import { removeFromArray, inBox } from '../tool/function'
const HITBOX = 0.8

export default class Collectable extends Mesh {

  static cbDelete = null
  progress = 0
  holder = null
  yOrigin = null

  constructor(mesh, position, params) {
    super()
    this.initVisual(mesh, params)
    this.initState(position, params)
  }

  initVisual(mesh) {
    this.copy(mesh, true)
    this.castShadow = true
  }

  initState(position) {
    if (position) this.position.copy(position)
    this.yOrigin = this.position.y
  }

  checkPlayer(player) {
    if (this.holder) return
    if (inBox(this.position, player.position, HITBOX)) {
      this.collect(player)
    }
  }

  collect(entity) {
    this.holder = entity
    this.position.copy(this.holder.position)
    this.position.y += 1.5
    this.rotation.y = 0
    this.progress = 0
    this.onCollect(entity)
    setTimeout(()=>{
      if(Collectable.cbDelete) Collectable.cbDelete(this)
      this.delete()
    }, 500)
  }

  delete() {
    this.removeFromParent()
  }

  update(dt, player) {
    this.checkPlayer(player)
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

  static onDelete(callback) {
    this.cbDelete = callback
  }

}
