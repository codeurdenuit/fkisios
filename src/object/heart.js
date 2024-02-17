import Collectable from './collectable'
const HP = 1

export default class Heart extends Collectable {
  static sound = new Audio('./sound/heart.wav')

  constructor(mesh, position) {
    super(mesh, position)
  }

  onCollect(entity) {
    Heart.sound.play()
    entity.addHP(HP)
  }
}
