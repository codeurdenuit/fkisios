import {
  Mesh,
  TextureLoader,
  EquirectangularReflectionMapping,
  MeshPhongMaterial
} from 'three'
import { removeFromArray, inBox } from '../function/function'

const texture = new TextureLoader().load('sky.jpg')
texture.mapping = EquirectangularReflectionMapping
const material = new MeshPhongMaterial({
  color: '#00ff00',
  specular: '#ffffff',
  shininess: 5,
  envMap: texture
})
const material10 = new MeshPhongMaterial({
  color: '#ff0000',
  specular: '#ffffff',
  shininess: 5,
  envMap: texture
})
export default class Rubis extends Mesh {
  static instances = []
  static sound1 = new Audio('sound/get_rubis.wav')
  static sound2 = new Audio('sound/get_rubis2.wav')

  constructor(mesh, position, value) {
    super()
    this.copy(mesh, true)
    this.value = mesh.name.includes('rubisB') ? 10 : 1
    if (value) this.value = value
    if (this.value === 1) {
      this.material = material
    } else {
      this.material = material10
    }

    this.castShadow = true
    if (position) this.position.copy(position)
    this.yOrigin = this.position.y
    this.progress = 0
    this.holder = null
    Rubis.instances.push(this)
  }

  checkPlayer(Player) {
    if (this.holder) return
    for (const player of Player.instances) {
      if (inBox(this.position, player.position, 0.8)) {
        this.collect(player)
      }
    }
  }

  collect(entity) {
    this.holder = entity
    this.position.copy(this.holder.position)
    this.holder.rubies += this.value
    this.position.y += 1.5
    this.rotation.y = 0
    this.progress = 0
    Rubis.sound1.pause()
    Rubis.sound1.currentTime = 0
    this.value === 1 ? Rubis.sound1.play() : Rubis.sound2.play()

    setTimeout(() => {
      this.removeFromParent()
      removeFromArray(this, Rubis.instances)
    }, 500)
  }

  update(dt, Player) {
    this.checkPlayer(Player)
    if (this.holder) {
      this.position.x = this.holder.position.x
      this.position.z = this.holder.position.z
      const scal = 0.5 + 0.5 * Math.sin(Math.PI * this.progress)
      this.scale.set(scal, scal, scal)
      this.progress += dt * 2
    } else {
      this.rotateY(dt)
      if (this.progress < 1) {
        this.position.y = 1.0 * Math.sin(Math.PI * this.progress) + this.yOrigin
        this.progress += dt * 3
      } else {
        this.position.y = this.yOrigin
      }
    }
  }

  static update(dt, Player) {
    for (const rubis of Rubis.instances) rubis.update(dt, Player)
  }
}
