import { Mesh } from 'three'
import Rapier from '@dimforge/rapier3d-compat'

export default class Block extends Mesh {
  static instances = []
  static soundPush = new Audio('sound/push.wav')
  static soundDrop = new Audio('sound/drop.wav')

  physic = null
  rigidBody = null
  collision = false

  constructor(mesh, physic) {
    super()
    this.initVisual(mesh)
    this.initPhysic(physic)
    Block.instances.push(this)
  }

  initVisual(mesh) {
    this.copy(mesh)
    this.castShadow = true
    this.receiveShadow = true
  }

  initPhysic(physic) {
    const rigidBodyDesc = Rapier.RigidBodyDesc.dynamic()
    rigidBodyDesc.setTranslation(...this.position)
    this.rigidBody = physic.createRigidBody(rigidBodyDesc)
    this.collider = physic.createCollider(
      Rapier.ColliderDesc.cuboid(0.75, 0.75, 0.75).setDensity(2),
      this.rigidBody
    )
    this.physic = physic
  }

  update(Player) {
    const player = Player.instances[0]
    this.position.copy(this.rigidBody.translation())
    this.rigidBody.setEnabledTranslations(true, true, true)
    this.collision = false
    if (player && player.position.y <= this.position.y)
      this.physic.contactPair(this.collider, player.collider, (manifold) => {
        const normal = manifold.normal()
        const contactDir = { x: normal.x, y: normal.z }
        if (Math.abs(contactDir.x) > Math.abs(contactDir.y)) {
          contactDir.y = 0
          this.rigidBody.lockTranslations()
          this.rigidBody.setEnabledTranslations(true, true, false, true)
        } else {
          contactDir.x = 0
          this.rigidBody.lockTranslations()
          this.rigidBody.setEnabledTranslations(false, true, true, true)
        }
        if (contactDir.x !== 0 || contactDir.y !== 0) {
          this.collision = true
          player.setContactWithBlock(contactDir)
        }
      })
  }

  static update(Player) {
    for (const block of Block.instances) block.update(Player)
  }
}
