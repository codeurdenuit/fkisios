import { Box3 } from 'three'

export default class Area extends Box3 {
  static instances = []
  constructor(mesh) {
    super()
    this.type = mesh.name.split('_')[1]
    this.name = mesh.name
    this.copy(mesh.geometry.boundingBox)
    Area.instances.push(this)
  }

  update(player) {
    const col = this.containsPoint(player.position)
    if (col) {
      player.groundType = this.type
    }
  }
}
