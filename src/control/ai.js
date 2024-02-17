import {
  randomInt,
  getDistance,
  angleOfVector,
  getAngle,
  getGapAbs,
  randomBool
} from '../tool/function'

const SCOPE = 4.5
const FOV = Math.PI * 0.8
const SENSITIV = 2
const VIEW = 5
const HITBOX = 1.7

import { Vector2 } from 'three'

export default class Ai {
  origin = null
  angle = 0
  time = 0
  outOfScope = false
  axis = new Vector2()
  focus = false
  attack = false

  constructor(tempo = 4, position, motionProb = 0.8) {
    this.origin = position
    this.motionProb = motionProb
    this.tempo = tempo
  }

  compute(dt, player, position) {
    this.time += dt
    this.attack = false
    this.focus = false

    if (player) {
      this.updateFocus(player.position, position)
    }
    if (this.focus) {
      this.computeAttack(player.position, position)
      if (!this.attack) {
        this.goToPosition(player.position, position)
      }
    } else {
      this.randomMove(position)
    }
  }

  updateFocus(targetPosition, position) {
    this.focus = this.isVisible(targetPosition, position)
  }

  randomMove(position) {
    if (this.time >= this.tempo && !this.outOfScope) {
      this.time = 0
      if (Math.random() < this.motionProb) {
        this.axis.x = randomInt(-1, 1)
        this.axis.y = randomInt(-1, 1)
        this.axis.normalize()
      } else {
        this.axis.set(0, 0)
      }
    }
    if (getDistance(position, this.origin) > SCOPE && !this.outOfScope) {
      this.axis.x = this.origin.x - position.x
      this.axis.y = this.origin.z - position.z
      this.axis.normalize()
      this.outOfScope = true
    } else if (getDistance(position, this.origin) < SCOPE * 0.8 && this.outOfScope) {
      this.outOfScope = false
    }
    if (this.axis.lengthSq() > 0) {
      this.angle = angleOfVector(this.axis)
    }
  }

  goToPosition(point, position) {
    const distance = getDistance(point, position)
    this.angle = getAngle(point, position)
    if (distance > HITBOX) {
      this.axis.x = Math.cos(this.angle - Math.PI / 2)
      this.axis.y = Math.sin(this.angle + Math.PI / 2)
    } else {
      this.axis.x = 0
      this.axis.y = 0
    }
  }

  computeAttack(point, position) {
    if (this.time > this.tempo) {
      const distance = getDistance(point, position)
      if (distance < HITBOX) {
        this.time = 0
        this.attack = randomBool(0.6)
      }
    }
  }

  delete() {}

  isVisible(point, position) {
    const distance = getDistance(point, position)
    const angle1 = getAngle(point, position)
    const angle2 = this.angle
    const gap = getGapAbs(angle1, angle2)
    if (distance < SENSITIV) return true
    return gap < FOV && distance < VIEW
  }

  get moving() {
    return !!this.axis.length()
  }
}
