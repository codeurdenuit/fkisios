import {
  randomInt,
  getDistance,
  angleOfVector,
  getAngle,
  getGapAbs,
  randomBool
} from '../function/function'
import { Vector2 } from 'three'

export default class Ai {
  static distanceMax = 4
  static viewDistance = 5
  static earDistance = 2
  static viewFov = Math.PI * 0.8
  static contactDistance = 1.7

  constructor(tempo = 4, origin, motionProb = 0.8) {
    this.origin = origin
    this.motionProb = motionProb
    this.angle = 0
    this.tempo = tempo
    this.time = 0
    ;(this.axis = new Vector2()), (this.outOfBounds = false)
    this.focus = false
    this.attack = false
  }

  compute(dt, Player, position) {
    this.time += dt
    //const entity = nearest(position, Player.instances)
    const entity = Player.instances[0]
    if (entity) {
      this.focus = this.isVisible(entity.position, position)
    } else {
      this.focus = false
    }

    this.attack = false
    if (this.focus) {
      this.goToPosition(entity.position, position)
      this.computeAttack(dt, entity.position, position)
    } else {
      this.randomMove(position)
    }
  }

  randomMove(position) {
    if (this.time >= this.tempo && !this.outOfBounds) {
      this.time = 0
      if (Math.random() < this.motionProb) {
        this.axis.x = randomInt(-1, 1)
        this.axis.y = randomInt(-1, 1)
        this.axis.normalize()
      } else {
        this.axis.set(0, 0)
      }
    }
    if (
      getDistance(position, this.origin) > Ai.distanceMax &&
      !this.outOfBounds
    ) {
      this.axis.x = this.origin.x - position.x
      this.axis.y = this.origin.z - position.z
      this.axis.normalize()
      this.outOfBounds = true
    } else if (
      getDistance(position, this.origin) < Ai.distanceMax * 0.8 &&
      this.outOfBounds
    ) {
      this.outOfBounds = false
    }

    if (this.axis.lengthSq() > 0) {
      this.angle = angleOfVector(this.axis)
    }
  }

  goToPosition(point, position) {
    this.axis.x = 0
    this.axis.y = 0
    if (this.attack) return
    const distance = getDistance(point, position)
    this.angle = getAngle(point, position)
    if (distance > Ai.contactDistance) {
      this.axis.x = Math.cos(this.angle - Math.PI / 2)
      this.axis.y = Math.sin(this.angle + Math.PI / 2)
    }
  }

  computeAttack(dt, point, position) {
    if (this.time > this.tempo) {
      const distance = getDistance(point, position)
      if (distance < Ai.contactDistance) {
        this.time = 0
        this.attack = randomBool(0.6)
      }
    }
    this.time += dt
  }

  isVisible(point, position) {
    const distance = getDistance(point, position)
    const angle1 = getAngle(point, position)
    const angle2 = this.angle
    const gap = getGapAbs(angle1, angle2)
    if (distance < Ai.earDistance) return true
    return gap < Ai.viewFov && distance < Ai.viewDistance
  }
}
