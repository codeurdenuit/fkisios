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
  getDistance,
  getAngle,
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

export default class Player extends Entity {
  static instances = []
  static hitAngle = Math.PI / 4
  static hitDistance = 2.5
  static velocity = 3
  hp = 4
  hpMax = 4
  rubies = 0
  cls = {}

  constructor(mesh, origin, physic) {
    super(mesh, origin, physic)
    this.speed = 0
    this.eyelid = null
    this.ctrl = new Ctrl(this)
    this.initVisual(mesh)
    this.initAnimations()
    this.initSounds()
    this.focused = null
    this.focus = false
    this.contact = null
    this.groundType = null
    this.light = new PointLight(0x77aa77, 0, 8)
    this.light.position.set(0.2, 0.3, 1.2)
    this.add(this.light)
    Player.instances.push(this)
  }

  initVisual(mesh) {
    browse(mesh, (m) => {
      m.castShadow = true
      m.receiveShadow = true
      if (m.name === 'eyelid') {
        this.eyelid = m
        this.eyelid.userData.timer = 0
        this.eyelid.userData.duration = 1
      }
      if (m.name === 'head') {
        m.receiveShadow = false
      }
    })
    mesh.position.y -= 0.5
    mesh.scale.set(1.2, 1.2, 1.2)
    this.add(mesh)
  }

  update(dt, Mob, Grass, Box, Area) {
    this.ctrl.compute(dt)
    if (!this.isAttack && !this.isCooldown && !this.isRoll) {
      this.updateEyelid(dt)
      const velocity = this.rigidBody.linvel()
      if (velocity.y < -2.5) {
        this.updateAnimFall()
        return
      }

      this.focused = null
      if (this.ctrl.focus) {
        if (this.focus === false) {
          this.sound(SHIELD)
        }
        this.focus = true
        this.focused = this.hasTarget(Mob)
        if (this.focused) {
          this.lock(this.focused)
        }
      } else {
        if (this.focus === true) {
          this.sound(REST)
        }
        this.focus = false
      }

      if (this.ctrl.attack) {
        this.positionVel.set(0, 0)
        this.rotationVel = 0
        this.updateAnimAttack(Mob, Grass, Box)
      } else {
        const maxVelosity = Player.velocity * this.ctrl.magnitude
        this.speed = Math.min(this.speed + dt * 6, maxVelosity)
        this.positionVel.x = this.ctrl.axis.x * this.speed
        this.positionVel.y = this.ctrl.axis.y * this.speed

        const lock = this.updateAnimPuch()
        if (lock) return

        if (this.ctrl.roll && this.ctrl.magnitude > 0.5) {
          const angle = getGap(angleOfVector(this.ctrl.axis), this.rotation.y)
          if (Math.abs(angle) > (Math.PI * 3) / 4) {
            this.positionVel.x = 4 * Math.cos(this.rotation.y + Math.PI / 2)
            this.positionVel.y = -4 * Math.sin(this.rotation.y + Math.PI / 2)
          } else if (angle > Math.PI / 4) {
            this.positionVel.x = 4 * Math.cos(this.rotation.y)
            this.positionVel.y = -4 * Math.sin(this.rotation.y)
          } else if (angle < -Math.PI / 4) {
            this.positionVel.x = 4 * Math.cos(this.rotation.y + Math.PI)
            this.positionVel.y = -4 * Math.sin(this.rotation.y + Math.PI)
          } else {
            this.positionVel.x = 4 * Math.cos(this.rotation.y - Math.PI / 2)
            this.positionVel.y = -4 * Math.sin(this.rotation.y - Math.PI / 2)
          }
        }
        if (this.ctrl.focus) {
          this.rotationVel = 0
        } else {
          this.rotationVel = getGap(this.ctrl.angle, this.rotation.y) * dt * 10
        }
        this.updateAnimMove()
        this.updateGround(Area)
      }
    }
    super.update(dt)
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

  updateAnimMove() {
    this.rotation.z = 0
    this.rotation.x = 0
    if (this.positionVel.length() !== 0) {
      if (this.ctrl.focus) {
        const moveAngle = angleOfVector(this.ctrl.axis)
        const bodyAngle = this.rotation.y
        const angle = getGap(moveAngle, bodyAngle)
        if (Math.abs(angle) > (Math.PI * 3) / 4) {
          if (this.ctrl.roll) {
            if (!this.isAnim(JUMP)) {
              this.anim(JUMP)
              this.sound(ROLL_VOICE)
            }
          } else {
            if (!this.isAnim(RUN_SHIELD)) {
              this.anim(RUN_SHIELD, -1)
              this.playSoundStep()
            }
          }
        } else if (angle > Math.PI / 4) {
          if (this.ctrl.roll) {
            if (!this.isAnim(JUMP)) {
              this.anim(JUMP)
              this.sound(ROLL_VOICE)
            }
          } else {
            if (!this.isAnim(STRAF)) {
              this.anim(STRAF, -1)
              this.playSoundStep()
            }
          }
        } else if (angle < -Math.PI / 4) {
          if (this.ctrl.roll) {
            if (!this.isAnim(JUMP)) {
              this.anim(JUMP)
              this.sound(ROLL_VOICE)
            }
          } else {
            if (!this.isAnim(STRAF)) {
              this.anim(STRAF, 1)
              this.playSoundStep()
            }
          }
        } else {
          if (this.ctrl.roll) {
            if (!this.isAnim(ROLL)) {
              this.anim(ROLL)
              this.sound(ROLL)
              this.sound(ROLL_VOICE)
            }
          } else {
            if (!this.isAnim(RUN_SHIELD)) {
              this.anim(RUN_SHIELD, 1)
              this.playSoundStep()
            }
          }
        }
      } else if (this.ctrl.roll) {
        if (!this.isAnim(ROLL)) {
          this.anim(ROLL)
          this.sound(ROLL)
          this.sound(ROLL_VOICE)
        }
      } else {
        if (!this.isAnim(RUN)) {
          this.anim(RUN)
          this.playSoundStep()
        }
        this.setAnimDuration(RUN, (0.5 * 3) / (this.speed + 0.5))
      }
    } else if (this.ctrl.focus) {
      this.anim(IDLE_SHIELD)
    } else {
      this.anim(IDLE)
    }
  }

  playSoundStep() {
    this.mixer._listeners = {}
    this.onAnimLoop(() => {
      const volume = this.speed / Player.velocity
      if (this.groundType === 'stone') this.sound(STEP_L_STONE, volume)
      else if (this.groundType === 'dirt') this.sound(STEP_L_DIRT, volume)
      else if (this.groundType === 'wood') this.sound(STEP_L_WOOD, volume)
      else this.sound(STEP_L_GRASS, volume)
    })
    this.onAnimHalf(() => {
      const volume = this.speed / Player.velocity
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

  hasTarget(Mob) {
    const entity = nearest(this.position, Mob.instances)
    if (!entity) return null
    const distance = getDistance(entity.position, this.position)
    return distance < 4 ? entity : null
  }

  lock(entity) {
    this.rotation.y = getAngle(entity.position, this.position)
  }

  updateAnimPuch() {
    if (this.contact)
      if (this.contact) {
        if (
          this.positionVel.length() &&
          ((this.contact.x === 0 &&
            -Math.sign(this.contact.y) === Math.sign(this.positionVel.y)) ||
            (this.contact.y === 0 &&
              -Math.sign(this.contact.x) === Math.sign(this.positionVel.x)))
        ) {
          this.rotationVel = 0
          const angle = angleOfVector(this.contact)
          this.rigidBody.lockTranslations(true)
          if (!this.isPlaying('push')) {
            this.sound(PUSH)
          }
          if (this.contact.x === 0) {
            this.positionVel.x = 0
            this.anim(PUSH)
            this.rotation.y = angle + Math.PI
            this.rigidBody.setEnabledTranslations(false, true, true, true)
            this.contact = null
            return true
          } else {
            this.positionVel.y = 0
            this.anim(PUSH)
            this.rotation.y = -angle
            this.rigidBody.setEnabledTranslations(true, true, false, true)
            this.contact = null
            return true
          }
        }
      }
    this.stopSound(PUSH)
    this.contact = null
    this.rigidBody.setEnabledTranslations(true, true, true)
    return false
  }

  startAnimPush(normal) {
    this.contact = normal
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

  updateGround(Area) {
    for (const area of Area.instances) {
      if (area.containsPoint(this.position)) {
        this.groundType = area.type
        return
      }
    }
    this.groundType = null
  }

  updateEyelid(dt) {
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
    this.loadSound(STEP_L_GRASS, 'sound/step_grass[1-2].wav')
    this.loadSound(STEP_R_GRASS, 'sound/step_grass[3-4].wav')
    this.loadSound(STEP_L_DIRT, 'sound/step_dirt[1-2].wav')
    this.loadSound(STEP_R_DIRT, 'sound/step_dirt[3-4].wav')
    this.loadSound(DEAD, 'sound/death.wav')
    this.loadSound(PUSH, 'sound/push.wav')
  }

  get active() {
    return this.ctrl.active
  }

  set active(value) {
    this.ctrl.active = value
  }

  static update(dt, Mob1, Grass, Box, Area) {
    for (const player of Player.instances)
      player.update(dt, Mob1, Grass, Box, Area)
  }
}
