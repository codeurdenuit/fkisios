import Collectable from './collectable'
import Sound from '../engine/sound'
import { getRubisValue } from '../tool/function'
import { materialA, materialB } from '../shader/rubis'

export default class Rubis extends Collectable {
  static sound1 = new Sound('./sound/get_rubis.wav')
  static sound2 = new Sound('./sound/get_rubis2.wav')

  value = 0

  constructor(mesh, position, value) {
    const val = getRubisValue(mesh, value)
    super(mesh, position, val)
    this.value = val
  }

  initVisual(mesh, value) {
    this.copy(mesh)
    this.material = value === 1 ? materialA : materialB
    this.castShadow = true
  }

  onCollect(entity) {
    entity.rubies += this.value
    this.value === 1 ? Rubis.sound1.play() : Rubis.sound2.play()
  }
}
