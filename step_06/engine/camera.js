import { PerspectiveCamera } from 'three'

export default class Camera extends PerspectiveCamera {
  constructor() {
    super(40, innerWidth / innerHeight)
    this.position.set(0, 5.4, 9)
    this.lookAt(0, 0, 1.8)
  }

  update(player) {
    this.position.copy(player.position)
    this.position.y += 4
    this.position.z += 3.8
  }
}
