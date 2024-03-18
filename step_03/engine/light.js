import { AmbientLight, PointLight, Object3D, Vector2 } from 'three'

export default class Light extends Object3D {
  constructor() {
    super()
    const ambient = new AmbientLight(0xffffff, 0.7)
    const point = new PointLight(0xffffff, 80, 30)
    point.position.set(-4, 6, 6)
    point.castShadow = true
    point.shadow.bias = -0.001
    point.shadow.mapSize = new Vector2(2048, 2048)

    this.add(ambient)
    this.add(point)
  }

  update(player) {
    this.position.copy(player.position)
  }
}
