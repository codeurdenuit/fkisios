import { PerspectiveCamera } from 'three'

export default class Camera extends PerspectiveCamera {
  constructor() {
    super(50, innerWidth / innerHeight)
  }

  update(player) {
    this.position.copy(player.position)
    this.position.y += 4
    this.position.z += 4
    this.lookAt(player.position)
  }
}
