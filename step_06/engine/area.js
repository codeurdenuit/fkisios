import { Box3 } from 'three'

export default class Area extends Box3 {
  constructor(mesh) {
    super()
    this.type = mesh.name.split('_')[1]
    this.copy(mesh.geometry.boundingBox)
  }

  in(position) {
    const col = this.containsPoint(position)
    if(col) return this.type
  }
}
