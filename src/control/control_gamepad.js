import { Vector2 } from 'three'
import {round } from '../tool/function'
import 'joypad.js'


export const keys = {
  'z':'up',
  's':'down',
  'q':'left',
  'd':'right',
  'l':'attack',
  'm':'jump',
  'shift':'lock',
  'button_0':'attack',
  'button_1':'jump',
  'button_7':'lock'
}

export class Ctrl {

  active = false
  angle = 0
  axis = new Vector2()
  lock = false
  attack = false
  jump = false
  attackLoaded = false
  attackTurbo = false

  pressed = {}
  tempoPress = 0
  countPress = 0
  tempoCount = 0
  previousJump = false

  constructor(entity) {
    this.angle = entity.rotation.y

    joypad.on('button_press', e => {
      this.pressed[keys[e.detail.buttonName]] = true
    })

    joypad.on('button_release', e => {
      this.pressed[keys[e.detail.buttonName]] = false
      if(keys[e.detail.buttonName]=== 'attack') this.countPress++
    })

    document.addEventListener('keydown', e=>{
      this.pressed[keys[e.key.toLowerCase()]] = true
    })

    document.addEventListener('keyup', e=>{
      this.pressed[keys[e.key.toLowerCase()]] = false
      if(keys[e.key] === 'attack') this.countPress++
    })
  }

  compute(dt) {
    if(!this.active) return
    this.updateFocus()
    this.updateJump()
    this.updateAxis()
    this.updateAttack()
    this.updateAttackLoaded(dt)
    this.updateAttackTurbo(dt)
    this.updateAngle()
  }
  updateFocus() {
    this.lock = !!this.pressed.lock
  }
  updateJump() {
    this.jump = (this.previousJump === false && this.pressed.jump === true) 
    this.previousJump = this.pressed.jump
  }
  updateAxis() {
    if(joypad.instances[0]) {
      const axes = joypad.instances[0].axes
      this.axis.x = round(axes[0], 10)
      this.axis.y =  round(axes[1], 10)
    } else {
      const pressed = this.pressed
      if(pressed.up && !pressed.down) {
        this.axis.y = -1
      } else if (!pressed.up && pressed.down) {
        this.axis.y = 1
      } else {
        this.axis.y = 0
      }
      if(pressed.left && !pressed.right) {
        this.axis.x = -1
      } else if (!pressed.left && pressed.right) {
        this.axis.x = 1
      } else {
        this.axis.x = 0
      }
      this.axis.normalize()
    }
  }

  updateAttack() {
    this.attack = !!this.pressed.attack
  }

  updateAttackLoaded(dt) {
    if(this.pressed.attack) {
      this.tempoPress += dt
      if(this.tempoPress > 1) {
        this.attackLoaded = true
      }
    }else {
      this.tempoPress = 0
      this.attackLoaded = false
    }
  }

  updateAttackTurbo(dt) {
    this.tempoCount += dt
    if(this.tempoCount>1) {
      this.tempoCount = 0
      if(this.countPress>4)
        this.attackTurbo = true
      else 
        this.attackTurbo = false
      this.countPress = 0
    }
  }

  updateAngle() {
    const axis = this.axis
    if(axis.length()!==0 ) {
      this.angle = Math.atan2(-axis.y, axis.x) + Math.PI/2
    }
  }

  disable() {
    this.active = false
  }

  enable() {
    this.active = true
  }

  get magnitude() {
    return this.axis.length()
  }

  get moving() {
    return !!this.axis.length()
  }

}
