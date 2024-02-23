import { Vector3 } from 'three'
import { floor } from '../tool/function'

const ATTACK = 0
const JUMP = 1
const LOCK = 7
const X = 0
const Z = 1

export default class Gamepad {
  axis = new Vector3()
  lock = false
  attack = false
  jump = false

  update() {
    const gamepad = navigator.getGamepads()[0]
    if (!gamepad) return
    this.axis.x = floor(gamepad.axes[X])
    this.axis.z = floor(gamepad.axes[Z])
    this.attack = gamepad.buttons[ATTACK].pressed
    this.jump = gamepad.buttons[JUMP].pressed
    this.lock = gamepad.buttons[LOCK].pressed
  }
}
