import { Mesh } from 'three'
import Rapier from '@dimforge/rapier3d-compat'
import Particles from '../effect/particles'
import { removeFromArray, randomInt } from '../function/function'

export default class Box extends Mesh {
  static instances = []
  static cbBreak = null
  static soundHit1 = new Audio('sound/hit_wood1.wav')
  static soundHit2 = new Audio('sound/hit_wood2.wav')
  static soundHit3 = new Audio('sound/hit_wood3.wav')
  static soundBreak = new Audio('sound/break.wav')

  constructor(mesh, physic) {
    super()
    this.copy(mesh)
    this.castShadow = true
    this.initPhysic(physic)
    this.hp = 4
    this.progress = 0
    this.yOrigin = this.position.y
    Box.instances.push(this)
  }

  initPhysic(physic) {
    this.collider = physic.createCollider(
      Rapier.ColliderDesc.cuboid(0.75, 0.72, 0.75).setTranslation(
        this.position.x,
        this.position.y,
        this.position.z
      )
    )
    this.physic = physic
  }

  update(dt) {
    if (this.hp <= 0) {
      if (this.progress <= 1) {
        this.morphTargetInfluences[0] =
          Math.sin((Math.PI / 2) * this.progress) + this.progress
        //this.morphTargetInfluences[ 0 ] = Math.min((Math.pow(Math.exp(this.progress),2))/7.5,1.2)
        //this.morphTargetInfluences[ 0 ] = this.progress
        this.position.y =
          this.yOrigin +
          0.8 * Math.sin(Math.PI * this.progress * 1.4) -
          this.progress
      } else {
        this.delete()
      }
      this.progress += dt
    }
  }

  hit(entity) {
    if (this.hp > 0) {
      this.createParticles(entity)
      this.hp -= 1
      Box[`soundHit${randomInt(1, 3)}`].play()
      if (this.hp === 0) {
        Box.soundBreak.play()
        if (Box.cbBreak) Box.cbBreak(this.position.clone())
      }
    }
  }

  createParticles(entity) {
    this.parent.add(new Particles(this.position))
  }

  delete() {
    this.removeFromParent()
    this.physic.removeCollider(this.collider)
    removeFromArray(this, Box.instances)
  }

  static onBreak(callback) {
    this.cbBreak = callback
  }

  static update(dt) {
    for (const box of Box.instances) box.update(dt)
  }
}
