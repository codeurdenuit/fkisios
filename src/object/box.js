import { Mesh, Vector3 } from 'three'
import Rapier from '@dimforge/rapier3d-compat'
import Particles from '../effect/particles'
import Sound from '../engine/sound'
import { removeFromArray } from '../tool/function'

export default class Box extends Mesh {
  static cbBreak = null
  static cbDelete = null
  static soundHit = new Sound('./sound/hit_wood[1-3].wav')
  static soundBreak = new Audio('./sound/break.wav')
  hp = 4
  progress = 0
  yOrigin = 0
  physic = null
  collider = null

  constructor(mesh, physic) {
    super()
    this.initVisual(mesh)
    this.initPhysic(physic)
    this.initState()
  }

  initVisual(mesh) {
    this.copy(mesh)
    this.castShadow = true
  }

  initPhysic(physic) {
    const desc = Rapier.ColliderDesc.cuboid(0.75, 0.72, 0.75)
    .setTranslation( ...this.position )
    this.collider = physic.createCollider(desc)
    this.physic = physic
  }

  initState() {
    this.yOrigin = this.position.y
  }

  update(dt) {
    if (this.hp <= 0) {
      if (this.progress <= 1) {
        this.morphTargetInfluences[0] =
          Math.sin((Math.PI / 2) * this.progress) + this.progress
        this.position.y =
          this.yOrigin +
          0.8 * Math.sin(Math.PI * this.progress * 1.4) -
          this.progress
      } else {
        Box.cbDelete(this)
        this.delete()
      }
      this.progress += dt
    }
  }

  hit(entity) {
    if (this.hp > 0) {
      this.createParticles(entity)
      this.hp -= 1
      Box.soundHit.play()
      if (this.hp === 0) {
        Box.soundBreak.play()
        if (Box.cbBreak) Box.cbBreak(this.position.clone())
      }
    }
  }

  createParticles(entity) {
    const x = (this.position.x + entity.position.x * 1) / 2
    const z = (this.position.z + entity.position.z * 1) / 2
    this.parent.add(new Particles(new Vector3(x, this.position.y, z)))
  }

  delete() {
    this.removeFromParent()
    this.physic.removeCollider(this.collider)
  }

  static onBreak(callback) {
    this.cbBreak = callback
  }

  static onDelete(callback) {
    this.cbDelete = callback
  }
}
