import { Vector2, AmbientLight, PointLight, Object3D } from 'three'

export default class Light extends Object3D {
  constructor() {
    super()

    const ambient = new AmbientLight(0xffffff, 0.7)

    const light = new PointLight(0xffffff, 80, 30)
    light.castShadow = true
    light.shadow.bias = -0.001
    light.shadow.mapSize = new Vector2(1024 * 2, 1024 * 2)
    light.position.set(-4, 6, 6)

    this.add(ambient)
    this.add(light)
  }

  update(player) {
    this.position.copy(player.position)
  }
}
