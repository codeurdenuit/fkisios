import { Vector3, PointLight } from 'three'
import Ctrl from '../control/control_gamepad'
import Entity from './entity'
import Particles from '../effect/particles'
import {
  getGap,
  inHitBox,
  browse,
  nearest,
  angleOfVector,
  getTarget,
  getAngle
} from '../function/function'

const ATTACK = 1
const SWORD = 2
const ROLL = 3
const ROLL_VOICE = 4
const SHIELD = 5
const REST = 6
const CRY = 7
const YELL = 8
const HIT = 9
const STEP_L_STONE = 10
const STEP_R_STONE = 11
const STEP_L_WOOD = 12
const STEP_R_WOOD = 13
const STEP_L_GRASS = 14
const STEP_R_GRASS = 15
const STEP_L_DIRT = 16
const STEP_R_DIRT = 17
const DEAD = 18
const PUSH = 19
const ATTACK_LOADED = 20
const JUMP = 21
const FALL = 22
const IDLE = 23
const IDLE_SHIELD = 24
const RUN = 25
const RUN_SHIELD = 26
const STRAF = 27
const FORWARD = 1
const BACKWARD = 2
const LEFT = 3
const RIGHT = 4
const VELOCITY = 3

export default class Player extends Entity {
  static instances = []
  static hitAngle = Math.PI / 4
  static hitRange = 2.5
  hp = 4
  hpMax = 4
  rubies = 0
  speed = 0
  groundType = null
  focused = null
  contact = null
  eyelid = null
  light = null
  ctrl = null

  constructor(mesh, origin, physic) {
    super(mesh, origin, physic)
    this.ctrl = new Ctrl(this)
    this.initVisual(mesh)
    this.initAnimations()
    this.initSounds()
    Player.instances.push(this)
  }

  initVisual(mesh) {
    browse(mesh, (m) => {
      m.castShadow = true
      m.receiveShadow = true
    })
    mesh.getObjectByName('head').receiveShadow = false
    this.eyelid = mesh.getObjectByName('eyelid')
    this.eyelid.userData = {timer:0,duration:1}
    mesh.position.y -= 0.5
    mesh.scale.set(1.2, 1.2, 1.2)
    this.add(mesh)
    this.light = new PointLight(0x77aa77, 0, 8)
    this.light.position.set(0.2, 0.3, 1.2)
    this.add(this.light)
  }

  onUpdate(dt, Mob, Grass, Box, Area) {
    this.cancelPush()
    this.alwayslookTarget()
    if (this.isBusy) return
    if (this.isFall) return this.updateAnimFall()

    this.updateEyes(dt)
    this.updateGround(Area)
    this.updateFocus(Mob)

    if (this.isPushing) {
      this.updatePropsPush(dt)
      this.updateAnimPush()
    } else if (this.ctrl.attack) {
      this.updatePropsAttack()
      this.updateAnimAttack(Mob, Grass, Box)
    } else if (!this.ctrl.jump && this.ctrl.moving) {
      this.updatePropsWalk(dt)
      this.updateAnimWalk()
    } else if (this.ctrl.moving) {
      this.updatePropsJump(dt)
      this.updateAnimJump()
    } else {
      this.updatePropsIdle(dt)
      this.updateAnimIdle()
    }
    this.contact = null
  }

  cancelPush() {
    if (!this.contact || !this.ctrl.moving) {
      this.stopSound(PUSH)
      this.rigidBody.setEnabledTranslations(true, true, true, true)
    }
  }

  alwayslookTarget() {
    if (this.focused)
      this.rotation.y = getAngle(this.focused.position, this.position)
  }

  updateFocus(Mob) {
    this.updateFocusSound()
    this.updateFocused(Mob)
  }

  updateFocusSound() {
    if (this.ctrl.focus) {
      if (!this.isShield) this.sound(SHIELD)
    } else {
      if (this.isShield) this.sound(REST)
    }
  }

  updateFocused(Mob) {
    if (this.ctrl.focus) this.focused = getTarget(this.position, Mob, 4)
    else this.focused = null
  }

  updatePropsAttack() {
    this.positionVel.set(0, 0)
    this.rotationVel = 0
  }

  updateAnimAttack(Mob, Grass, Box) {
    if (this.isAttack) return
    if (this.ctrl.attackPowerful) {
      this.anim(ATTACK_LOADED)
      this.sound(YELL)
      this.onAnimHalf(() => {
        this.sound(ROLL)
        this.attack(Mob, Grass, Box, Math.PI * 1.5)
      })
    } else if (this.ctrl.attackTurbo) {
      this.anim(ATTACK).setDuration(0.15)
      this.sound(ATTACK)
      this.sound(SWORD)
      this.onAnimHalf(() => {
        this.attack(Mob, Grass, Box)
      })
    } else {
      this.anim(ATTACK).setDuration(0.4)
      this.sound(ATTACK)
      this.sound(SWORD)
      this.onAnimHalf(() => {
        this.attack(Mob, Grass, Box)
      })
    }
    this.onAnimEnd(() => {
      this.anim(IDLE_SHIELD)
      this.light.intensity = 0
    })
  }

  attack(Mob, Grass, Box, range) {
    const mob = nearest(this.position, Mob.instances)
    this.light.intensity = 0.1
    const grasses = Grass.instances
    let length = grasses.length
    let posOr = this.position
    for (let i = 0; i < length; i++) {
      const grass = grasses[i]
      if (grass.isCut) continue
      const posTa = grass.position
      if (
        Math.abs(posTa.x - posOr.x) < 4.5 &&
        Math.abs(posTa.z - posOr.z) < 4.5
      ) {
        if (inHitBox(this, grass, range)) {
          this.light.intensity = 0.7
          grass.cut()
        }
      }
    }

    const boxes = Box.instances
    length = boxes.length
    posOr = this.position
    for (let i = 0; i < length; i++) {
      const box = boxes[i]
      const posTa = box.position
      if (
        Math.abs(posTa.x - posOr.x) < 4.5 &&
        Math.abs(posTa.z - posOr.z) < 4.5
      ) {
        if (inHitBox(this, box, range)) {
          this.light.intensity = 1.5
          box.hit(this)
        }
      }
    }

    if (mob && inHitBox(this, mob, range)) {
      mob.hit(this)
      this.light.intensity = 1.5
    }
  }

  updatePropsWalk(dt) {
    const maxVelosity = VELOCITY * this.ctrl.magnitude
    this.speed = Math.min(this.speed + dt * 6, maxVelosity)
    this.positionVel.x = this.ctrl.axis.x * this.speed
    this.positionVel.y = this.ctrl.axis.y * this.speed
    if (this.ctrl.focus) this.rotationVel = 0
    if (this.focused)
      this.rotation.y = getAngle(this.focused.position, this.position)
    else this.rotationVel = getGap(this.ctrl.angle, this.rotation.y) * dt * 10
  }

  updateAnimWalk() {
    if (this.ctrl.focus) {
      switch (this.getMoveDirection()) {
        case BACKWARD:
          if (!this.anim(RUN_SHIELD, -1)) return
          this.playSoundStep()
          break
        case LEFT:
          if (!this.anim(STRAF, -1)) return
          this.playSoundStep()
          break
        case RIGHT:
          if (!this.anim(STRAF, 1)) return
          this.playSoundStep()
          break
        case FORWARD:
          if (!this.anim(RUN_SHIELD, 1)) return
          this.playSoundStep()
      }
    } else {
      if (this.anim(RUN)) {
        this.playSoundStep()
      }
      this.setAnimDuration(RUN, (0.5 * 3) / (this.speed + 0.5))
    }
  }

  updatePropsJump(dt) {
    switch (this.getMoveDirection()) {
      case BACKWARD:
        this.positionVel.x = 4 * Math.cos(this.rotation.y + Math.PI / 2)
        this.positionVel.y = -4 * Math.sin(this.rotation.y + Math.PI / 2)
        break
      case LEFT:
        this.positionVel.x = 4 * Math.cos(this.rotation.y)
        this.positionVel.y = -4 * Math.sin(this.rotation.y)
        break
      case RIGHT:
        this.positionVel.x = 4 * Math.cos(this.rotation.y + Math.PI)
        this.positionVel.y = -4 * Math.sin(this.rotation.y + Math.PI)
        break
      case FORWARD:
        this.positionVel.x = 4 * Math.cos(this.rotation.y - Math.PI / 2)
        this.positionVel.y = -4 * Math.sin(this.rotation.y - Math.PI / 2)
    }
  }

  updateAnimJump() {
    switch (this.getMoveDirection()) {
      case BACKWARD:
        if (!this.anim(JUMP)) return
        this.sound(ROLL_VOICE)
        break
      case LEFT:
        if (!this.anim(JUMP)) return
        this.sound(ROLL_VOICE)
        break
      case RIGHT:
        if (!this.anim(JUMP)) return
        this.sound(ROLL_VOICE)
        break
      case FORWARD:
        if (!this.anim(ROLL)) return
        this.sound(ROLL)
        this.sound(ROLL_VOICE)
    }
  }

  updatePropsIdle(dt) {
    this.positionVel.set(0, 0)
    this.rotationVel = 0
  }

  updateAnimIdle() {
    if (this.ctrl.focus) {
      this.anim(IDLE_SHIELD)
    } else {
      this.anim(IDLE)
    }
  }

  playSoundStep() {
    this.mixer._listeners = {}
    this.onAnimLoop(() => {
      const volume = this.speed / VELOCITY
      if (this.groundType === 'stone') this.sound(STEP_L_STONE, volume)
      else if (this.groundType === 'dirt') this.sound(STEP_L_DIRT, volume)
      else if (this.groundType === 'wood') this.sound(STEP_L_WOOD, volume)
      else this.sound(STEP_L_GRASS, volume)
    })
    this.onAnimHalf(() => {
      const volume = this.speed / VELOCITY
      if (this.groundType === 'stone') this.sound(STEP_R_STONE, volume)
      else if (this.groundType === 'dirt') this.sound(STEP_R_DIRT, volume)
      else if (this.groundType === 'wood') this.sound(STEP_R_WOOD, volume)
      else this.sound(STEP_R_GRASS, volume)
    })
  }

  updateAnimHit() {
    this.anim(HIT)
    this.sound(CRY)
  }

  updateAnimFall() {
    return this.anim(FALL)
  }

  hit(entity, damage) {
    if (this.isCooldown) return
    this.createParticles(entity)
    this.hp -= damage
    this.rotationVel = 0
    this.positionVel.set(0, 0)
    this.sound(HIT)
    this.closeEyes()
    if (this.hp > 0) {
      this.updateAnimHit()
    } else this.updateAnimDaying()
  }

  updateAnimDaying() {
    this.anim(DEAD)
    this.onAnimEnd(() => {
      this.sound(DEAD)
      this.delete()
    })
  }

  closeEyes() {
    this.eyelid.scale.set(1, 1, 1)
  }

  openEyes() {
    this.eyelid.scale.set(0, 0, 0)
  }

  addHP(value) {
    this.hp += value
    this.hp = Math.min(this.hp, this.hpMax)
  }

  createParticles(entity) {
    const x = (this.position.x * 2 + entity.position.x * 1) / 3
    const z = (this.position.z * 2 + entity.position.z * 1) / 3
    this.parent.add(new Particles(new Vector3(x, this.position.y, z)))
  }

  updatePropsPush(dt) {
    const maxVelosity = VELOCITY * this.ctrl.magnitude
    this.speed = Math.min(this.speed + dt * 6, maxVelosity)
    this.positionVel.x = this.ctrl.axis.x * this.speed
    this.positionVel.y = this.ctrl.axis.y * this.speed
    this.rotationVel = 0
    this.rigidBody.lockTranslations(true)
    const angle = angleOfVector(this.contact)
    if (this.contact.x === 0) {
      this.positionVel.x = 0
      this.rotation.y = angle + Math.PI
      this.rigidBody.setEnabledTranslations(false, true, true, true)
    } else {
      this.positionVel.y = 0
      this.rotation.y = -angle
      this.rigidBody.setEnabledTranslations(true, true, false, true)
    }
    this.contact = null
  }
  updateAnimPush() {
    if (!this.anim(PUSH)) return
    this.sound(PUSH)
  }

  setContactWithBlock(normal) {
    this.contact = normal
  }

  get isBusy() {
    return this.isAttack || this.isCooldown
  }

  get isCooldown() {
    return (
      this.isAnim(HIT) || this.isAnim(JUMP) || this.isAnim(ROLL) || this.hp <= 0
    )
  }

  get isRoll() {
    return this.isAnim(ROLL) || this.isAnim(JUMP)
  }

  get isAttack() {
    return this.isAnim(ATTACK) || this.isAnim(ATTACK_LOADED)
  }

  get isShield() {
    return this.isAnim(IDLE_SHIELD) || !this.isAnim(RUN_SHIELD)
  }

  get isPushing() {
    const c = this.contact
    if (!c) return false
    if (!this.positionVel.length()) return false
    const pushedY =
      c.x === 0 && -Math.sign(c.y) === Math.sign(this.positionVel.y)
    const pushedX =
      c.y === 0 && -Math.sign(c.x) === Math.sign(this.positionVel.x)
    if (!pushedY && !pushedX) return false
    return true
  }

  get active() {
    return this.ctrl.active
  }

  set active(value) {
    this.ctrl.active = value
  }

  get focus() {
    return this.focused
  }

  updateGround(Area) {
    for (const area of Area.instances) {
      if (area.containsPoint(this.position)) {
        this.groundType = area.type
        return
      }
    }
    this.groundType = null
  }

  updateEyes(dt) {
    if (this.eyelid.userData.timer > this.eyelid.userData.duration) {
      this.eyelid.userData.timer = 0
      if (this.eyelid.scale.x === 0) {
        this.eyelid.userData.duration = Math.random() * 0.4
        this.closeEyes()
      } else {
        this.eyelid.userData.duration = 2 + Math.random() * 3
        this.openEyes()
      }
    }
    this.eyelid.userData.timer += dt
  }

  getMoveDirection() {
    const moveAngle = angleOfVector(this.ctrl.axis)
    const bodyAngle = this.rotation.y
    const angle = getGap(moveAngle, bodyAngle)
    if (Math.abs(angle) > (Math.PI * 3) / 4) {
      return BACKWARD
    } else if (angle > Math.PI / 4) {
      return LEFT
    } else if (angle < -Math.PI / 4) {
      return RIGHT
    } else {
      return FORWARD
    }
  }

  initAnimations() {
    this.loadAnim(ATTACK_LOADED, 'attack powerful', 2, true)
    this.loadAnim(ATTACK, 'attack[1-3]', 0.3, true)
    this.loadAnim(JUMP, 'backflip', 0.5, true)
    this.loadAnim(DEAD, 'daying', 4, true)
    this.loadAnim(FALL, 'fall', 1.5)
    this.loadAnim(IDLE, 'idle', 3)
    this.loadAnim(IDLE_SHIELD, 'idle_shield', 3)
    this.loadAnim(HIT, 'impact', 0.5, true)
    this.loadAnim(PUSH, 'push', 1)
    this.loadAnim(ROLL, 'roll', 0.75, true)
    this.loadAnim(RUN, 'run', 0.5)
    this.loadAnim(RUN_SHIELD, 'run shield', 0.5)
    this.loadAnim(STRAF, 'straf', 0.5)
  }

  initSounds() {
    this.loadSound(ATTACK, 'sound/attack[1-4].wav')
    this.loadSound(SWORD, 'sound/sword[1-2].wav')
    this.loadSound(ROLL, 'sound/roll.wav')
    this.loadSound(ROLL_VOICE, 'sound/rollvoice[1-3].wav')
    this.loadSound(SHIELD, 'sound/shield.wav')
    this.loadSound(REST, 'sound/shieldout.wav')
    this.loadSound(CRY, 'sound/cry.wav')
    this.loadSound(YELL, 'sound/yell.wav')
    this.loadSound(HIT, 'sound/hit_player.wav')
    this.loadSound(STEP_L_STONE, 'sound/step_stone[1-2].wav')
    this.loadSound(STEP_R_STONE, 'sound/step_stone[3-4].wav')
    this.loadSound(STEP_L_WOOD, 'sound/step_wood1.wav')
    this.loadSound(STEP_R_WOOD, 'sound/step_wood2.wav')
    this.loadSound(STEP_L_GRASS, 'sound/step_grass[1-2].wav', 0.8)
    this.loadSound(STEP_R_GRASS, 'sound/step_grass[3-4].wav', 0.8)
    this.loadSound(STEP_L_DIRT, 'sound/step_dirt[1-2].wav')
    this.loadSound(STEP_R_DIRT, 'sound/step_dirt[3-4].wav')
    this.loadSound(DEAD, 'sound/death.wav')
    this.loadSound(PUSH, 'sound/push.wav', 0.8, true)
  }

  static update(dt, Mob1, Grass, Box, Area) {
    for (const player of Player.instances)
      player.update(dt, Mob1, Grass, Box, Area)
  }

  static getInstance(index) {
    return Player.instances[index]
  }
}
