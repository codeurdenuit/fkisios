import { Vector2, AmbientLight, DirectionalLight, Object3D } from 'three'

export default class Light extends Object3D {
  constructor() {
    super()

    const ambient = new AmbientLight(0xffffff, 0.8)

    const dirLight = new DirectionalLight(0xffffff, 1)
    dirLight.position.set(24, 5, 10)
    dirLight.target = new Object3D()
    dirLight.castShadow = true
    dirLight.shadow.mapSize = new Vector2(1024 * 2, 1024 * 2)
    dirLight.shadow.camera.top = 7
    dirLight.shadow.camera.bottom = -7
    dirLight.shadow.camera.left = -7
    dirLight.shadow.camera.right = 7
    dirLight.shadow.bias = -0.0001
    dirLight.target.position.set(20, 0, 0)

    this.add(ambient)
    this.add(dirLight)
    this.add(dirLight.target)
  }

  update(pl) {
    if (pl && pl.active) {
      this.children[1].position.set(pl.position.x - 10, 20, pl.position.z + 10)
      this.children[1].target.position.set(pl.position.x, 0, pl.position.z - 5)
    }
  }

  setRGB(r, g, b) {
    this.children[0].color.setRGB(r, g, b)
    this.children[1].color.setRGB(r, g, b)
  }

  set intensity(value) {
    this.children[1].intensity = value
  }
}
