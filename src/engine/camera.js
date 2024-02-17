import { PerspectiveCamera } from 'three'
import { getDistance } from '../tool/function'

export default class CameraPlayer extends PerspectiveCamera {
  static distance = 5

  constructor(player) {
    super(40, innerWidth / innerHeight)
    this.position.copy(player.position)
    this.position.x += 0
    this.position.y += 1.2
    this.position.z += 3
    this.lookAt(player.position)
    this.position.x += 0.2
    this.position.y += 0.1
    this.distance = getDistance(this.position, player.position)
  }

  update(player) {
    if (!player || !player.active) return
    this.position.set(
      player.position.x,
      player.position.y + 0.9 * CameraPlayer.distance,
      player.position.z + 1 * CameraPlayer.distance
    )
    this.lookAt(player.position)
    this.distance = getDistance(this.position, player.position)
  }
}
