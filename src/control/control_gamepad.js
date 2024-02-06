import { Vector2 } from 'three'
import {round } from '../tool/function'
import 'joypad.js'


const keys = {
  'z':'up',
  's':'down',
  'q':'left',
  'd':'right',
  'v':'attack',
  'b':'jump',
  'm':'focus',
  'button_0':'attack',
  'button_1':'jump',
  'button_7':'focus'
}

export default class Ctrl {

  constructor(entity) {
    this.active = false
    this.angle = entity.rotation.y
    this.axis = new Vector2()
    this.focus = false
    this.attack = false
    this.magnitude = 1
    this.jump = false
    this.attackPowerful = false
    this.attackTurbo = false

    this.pressed = {}
    this.tempoPress = 0
    this.countPress = 0
    this.tempoCount = 0
    this.previousRoll = false

    joypad.on('button_press', e => {
      this.pressed[keys[e.detail.buttonName]] = true
    })

    joypad.on('button_release', e => {
      this.pressed[keys[e.detail.buttonName]] = false
      if(keys[e.detail.buttonName]=== 'attack') this.countPress++
    })

    document.addEventListener('keydown', e=>{
      this.pressed[keys[e.key]] = true
    })

    document.addEventListener('keyup', e=>{
      this.pressed[keys[e.key]] = false
      if(keys[e.key] === 'attack') this.countPress++
    })
  }

  compute(dt) {
    if(!this.active) return
    this.updateFocus()
    this.updateRoll()
    this.updateAxis()
    this.updateAttack()
    this.updateAttackPowerful(dt)
    this.updateAttackTurbo(dt)
    this.updateAngle()
  }
  updateFocus() {
    this.focus = !!this.pressed.focus
  }
  updateRoll() {
    if(!this.previousRoll && this.pressed.jump ) {
      this.jump = true //uniquement lors d'un relachement
    } else {
      this.jump = false
    }

    this.previousRoll = this.pressed.jump
  }
  updateAxis() {
    if(joypad.instances[0]) {
      const axes = joypad.instances[0].axes
      this.axis.x = round(axes[0], 10)
      this.axis.y =  round(axes[1], 10)
      this.magnitude = this.axis.lengthSq()
      this.axis.normalize()
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
      this.magnitude = this.axis.lengthSq()
    }
  }

  updateAttack() {
    this.attack = !!this.pressed.attack
  }

  updateAttackPowerful(dt) {
    if(this.pressed.attack) {
      this.tempoPress += dt
      if(this.tempoPress > 1) {
        this.attackPowerful = true
      }
    }else {
      this.tempoPress = 0
      this.attackPowerful = false
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
    if(axis.length()!==0&&this.focus===false ) {
      this.angle = Math.atan2(-axis.y, axis.x) + Math.PI/2
    }
  }

  disable() {
    this.active = false
  }

  enable() {
    this.active = true
  }

  get moving() {
    return !!this.axis.length()
  }

}
