import {Vector3, LoopOnce, PointLight} from 'three'
import Ctrl from '../control/control_gamepad'
import Entity from './entity'
import Particles from '../effect/particles'
import {getGap, inHitBox, browse, nearest, angleOfVector, getDistance, getAngle, randomInt} from '../function/function'


export default class Player extends Entity {

  static instances = []
  static hitAngle = Math.PI/4
  static hitDistance = 2.5
  static velocity = 3
  hp = 4
  hpMax = 4
  rubies = 0

  constructor(mesh, origin, physic) {
    super(mesh, origin, physic)
    this.speed = 0
    this.eyelid = null
    this.ctrl = new Ctrl(this)
    this.initVisual(mesh)
    this.initAnimation(mesh)
    this.initSounds()
    this.focused = null
    this.focus = false
    this.contact = null
    this.groundType = null
    this.light = new PointLight( 0x77aa77, 0, 8 );
    this.light.position.set(0.2,0.3,1.2)
    this.add(this.light)
    Player.instances.push(this)
  }

  initVisual(mesh) {
    browse(mesh, m=>{
      m.castShadow = true
      m.receiveShadow  = true
      if(m.name === 'eyelid') {
        this.eyelid = m
        this.eyelid.userData.timer = 0
        this.eyelid.userData.duration = 1
      }
      if(m.name === 'head') {
        m.receiveShadow  = false
      }
    })
    mesh.position.y -= 0.5
    mesh.scale.set(1.2,1.2,1.2)
    this.add(mesh)
  }

  update(dt, Mob, Grass, Box, Area) {
    super.update(dt)
    this.ctrl.compute(dt)
    if(this.isAttack()||this.isCooldown()||this.isRoll()) return
    this.updateEyelid(dt)
    const velocity = this.rigidBody.linvel()
    if(velocity.y<-2.5) {
      this.updateClipFall()
      return
    }

    this.focused = null
    if(this.ctrl.focus) {
      if(this.focus === false){
        this.playSound('shield')
      }
      this.focus = true
      this.focused = this.hasTarget(Mob)
      if(this.focused) {
        this.lock(this.focused)
      }
    } else {
      if(this.focus === true) {
        this.playSound('shieldout')
      }
      this.focus = false
    }

    if(this.ctrl.attack) {
      this.positionVel.set(0,0)
      this.rotationVel = 0
      this.updateClipAttack(Mob, Grass, Box)
    } else {
      const maxVelosity = Player.velocity*this.ctrl.magnitude
      this.speed = Math.min(this.speed+dt*6,maxVelosity)
      this.positionVel.x = this.ctrl.axis.x*this.speed
      this.positionVel.y = this.ctrl.axis.y*this.speed


      const lock = this.updateClipPuch()
      if(lock) return


      if(this.ctrl.roll&&this.ctrl.magnitude>0.5) {
        const angle = getGap(angleOfVector(this.ctrl.axis), this.rotation.y, )
        if (Math.abs(angle)>Math.PI*3/4) {
          this.positionVel.x = 4*Math.cos(this.rotation.y+Math.PI/2)
          this.positionVel.y = -4*Math.sin(this.rotation.y+Math.PI/2)
        } else if(angle>Math.PI/4) {
          this.positionVel.x = 4*Math.cos(this.rotation.y)
          this.positionVel.y = -4*Math.sin(this.rotation.y)
        } else if (angle<-Math.PI/4) {
          this.positionVel.x = 4*Math.cos(this.rotation.y+Math.PI)
          this.positionVel.y = -4*Math.sin(this.rotation.y+Math.PI)
        } else {
          this.positionVel.x = 4*Math.cos(this.rotation.y-Math.PI/2)
          this.positionVel.y = -4*Math.sin(this.rotation.y-Math.PI/2)
        }
      }
      if(this.ctrl.focus){
        this.rotationVel = 0
      } else {
        this.rotationVel = getGap(this.ctrl.angle, this.rotation.y)*dt*10
      }
      this.updateClipMove()
      this.updateGround(Area)

    }
  }

  attack(Mob, Grass, Box, range) {
    const mob = nearest(this.position, Mob.instances)
    this.light.intensity = 0.1
    const grasses = Grass.instances
    let length = grasses.length
    let posOr = this.position
    for(let i=0; i<length; i++) {
      const grass = grasses[i]
      if(grass.isCut) continue
      const posTa = grass.position
      if(Math.abs(posTa.x-posOr.x)<4.5&&Math.abs(posTa.z-posOr.z)<4.5) {
        if(inHitBox(this, grass, range )) {
          this.light.intensity = 0.7
          grass.cut()
        }
      }
    }

    const boxes = Box.instances
    length = boxes.length
    posOr = this.position
    for(let i=0; i<length; i++) {
      const box = boxes[i]
      const posTa = box.position
      if(Math.abs(posTa.x-posOr.x)<4.5&&Math.abs(posTa.z-posOr.z)<4.5) {
        if(inHitBox(this, box, range )) {
          this.light.intensity = 1.5
          box.hit(this)
        }
      }
    }

    if(mob && inHitBox(this, mob, range )) {
      mob.hit(this)
      this.light.intensity = 1.5
    }
  }

  updateClipAttack(Mob, Grass, Box) {
    if(this.isAttack()) return
    if(this.ctrl.attackPowerful) {
      this.playClip('attack powerful')
      this.playSound('yell')
      this.onClipHalf(()=> {
        this.playSound('roll')
        this.attack(Mob, Grass, Box, Math.PI*1.5)
      })
    } else if(this.ctrl.attackTurbo) {
      this.playClip(`attack${randomInt(1,3)}`).setDuration(0.15)
      this.playSound('attack',4, 4)
      this.playSound('sword',1, 2)
      this.onClipHalf(()=> {
        this.attack(Mob, Grass, Box)
      })
    } else {
      this.playClip(`attack${randomInt(1,3)}`).setDuration(0.4)
      this.playSound('attack',1, 4)
      this.playSound('sword',1, 2)
      this.onClipHalf(()=> {
        this.attack(Mob, Grass, Box)
      })
    }
    this.onClipEnd(()=> {
      this.playClip('idle shield')
      this.light.intensity = 0
    })
  }


  updateClipMove() {
    this.rotation.z = 0
    this.rotation.x = 0
    if(this.positionVel.length()!==0 )  {
      if(this.ctrl.focus) {
        const moveAngle = angleOfVector(this.ctrl.axis)
        const bodyAngle = this.rotation.y
        const angle = getGap(moveAngle,bodyAngle)
        if (Math.abs(angle)>Math.PI*3/4) {
          if(this.ctrl.roll) {
            if(!this.isClip('backflip')){
              this.playClip('backflip') 
              this.playSound('rollvoice',1, 3)
            }
          } else {
            if(!this.isClip('run shield')){
              this.playClip('run shield', -1)
              this.playSoundStep()
            }
          }
        } else if(angle>Math.PI/4) {
          if(this.ctrl.roll) {
            if(!this.isClip('backflip')){
              this.playClip('backflip')
              this.playSound('rollvoice',1, 3)
            }
          } else {
            if(!this.isClip('straf')){
              this.playClip('straf', -1)
              this.playSoundStep()
            }
          }
        } else if (angle<-Math.PI/4) {
          if(this.ctrl.roll) {
            if(!this.isClip('backflip')){
              this.playClip('backflip')
              this.playSound('rollvoice',1, 3)
            }
          } else {
            if(!this.isClip('straf')){
              this.playClip('straf',1)
              this.playSoundStep()
            }
          }
        } else {
          if(this.ctrl.roll) {
            if(!this.isClip('roll')){
              this.playClip('roll') 
              this.playSound('roll')
              this.playSound('rollvoice',1, 3)
            }
          } else {
            if(!this.isClip('run shield')){
              this.playClip('run shield', 1)
              this.playSoundStep()
            }
          }
        }
      } else if (this.ctrl.roll) {
        if(!this.isClip('roll')){
          this.playClip('roll') 
          this.playSound('roll')
          this.playSound('rollvoice',1, 3)
        }
      } else {
        if(!this.isClip('run')){
          this.playClip('run')
          this.playSoundStep()
        }
        this.setDurationClip('run', 0.5*3/(this.speed+0.5))

      }
    } else if (this.ctrl.focus) {
      this.playClip('idle shield')
    } else {
      this.playClip('idle')
    }

  }

  playSoundStep() {
    this.mixer._listeners = {}
      this.onClipLoop(()=> {
        if(this.groundType==='stone')
        this.playSound('stepS',1,2).volume = 0.5*this.speed/Player.velocity
        else if(this.groundType==='dirt')
        this.playSound('stepD',1, 2).volume = Math.min(this.speed/Player.velocity,1)
        else if(this.groundType==='wood')
        this.playSound('stepW1').volume = Math.min(this.speed/Player.velocity,1)
        else
        this.playSound('stepG',1, 2).volume = 0.5*this.speed/Player.velocity
      })
      this.onClipHalf(()=> {
        if(this.groundType==='stone')
        this.playSound('stepS', 3,4).volume = 0.5*this.speed/Player.velocity
        else if(this.groundType==='dirt')
        this.playSound('stepD', 3,4).volume = Math.min(this.speed/Player.velocity,1)
        else if(this.groundType==='wood')
        this.playSound('stepW1').volume = Math.min(this.speed/Player.velocity,1)
        else
        this.playSound('stepG', 3,4).volume = 0.5*this.speed/Player.velocity
      })
  }

  updateClipHit() {
    this.playClip('hit')
    this.playSound('cry')
  }

  updateClipFall() {
    return  this.playClip('fall')
  }

  hit(entity, damage) {
    if(this.isCooldown()) return
    this.createParticles(entity)
    this.hp -= damage
    this.rotationVel = 0
    this.positionVel.set(0,0)
    this.playSound('hit')
    this.closeEyes()
    if(this.hp > 0) {
      this.updateClipHit()
    }
    else
    this.updateClipDaying()
  }

  updateClipDaying() {
    this.playClip('daying')
    this.onClipEnd(()=> {
      this.playSound('dead')
      this.delete()
    })
  }

  closeEyes() {
    this.eyelid.scale.set(1,1,1)
  }

  openEyes() {
    this.eyelid.scale.set(0,0,0)
  }

  addHP(value) {
    this.hp +=value
    this.hp = Math.min(this.hp, this.hpMax)
  }

  createParticles(entity) {
    const x = (this.position.x*2 + entity.position.x*1)/3
    const z = (this.position.z*2 + entity.position.z*1)/3
    this.parent.add(new Particles(new Vector3(x,this.position.y,z)))
  }

  hasTarget(Mob) {
    const entity = nearest(this.position, Mob.instances)
    if(!entity) return null
    const distance = getDistance(entity.position, this.position)
    return distance<4 ? entity : null
  }

  lock(entity) {
    this.rotation.y = getAngle(entity.position, this.position)
  }


  updateClipPuch() {
    if(this.contact)
    if(this.contact)  {
      if(
        this.positionVel.length() && (
          this.contact.x === 0 && -Math.sign(this.contact.y)===Math.sign(this.positionVel.y)||
          this.contact.y === 0 && -Math.sign(this.contact.x)===Math.sign(this.positionVel.x)
        )
      ) {
        this.rotationVel = 0
        const angle = angleOfVector(this.contact)
        this.rigidBody.lockTranslations(true)
        if(!this.isPlaying('push')) {
          this.playSound('push')
        }
        if(this.contact.x===0) {
          console.log('---vert')
          this.positionVel.x = 0
          this.playClip('push')
          this.rotation.y  = angle+Math.PI
          this.rigidBody.setEnabledTranslations(false, true, true, true)
          this.contact = null
          return true
        } else {
          this.positionVel.y = 0
          this.playClip('push')
          this.rotation.y = -angle
          this.rigidBody.setEnabledTranslations(true, true, false, true)
          this.contact = null
          return true
        }
      }
    }
    this.stop('push')
    this.contact = null
    this.rigidBody.setEnabledTranslations(true, true, true)
    return false

  }

  startClipPush(normal) {
    this.contact = normal
  }

  isCooldown() {
    return this.isClip('hit')|| this.isClip('backflip') || this.isClip('roll')||this.hp<=0
  }
  
  isRoll() {
    return  this.isClip('roll')||this.isClip('backflip')
  }

  isAttack() {
    return  this.isClip('attack1')|| this.isClip('attack powerful')|| this.isClip('attack2')|| this.isClip('attack3')
  }

  updateGround(Area) {
   for(const area of Area.instances) {
    if(area.containsPoint(this.position)) {
     this.groundType = area.type
     return
    }
   }
   this.groundType = null
  }

  updateEyelid(dt) {
    if(this.eyelid.userData.timer > this.eyelid.userData.duration) {
      this.eyelid.userData.timer = 0
      if(this.eyelid.scale.x === 0) {
        this.eyelid.userData.duration =Math.random()*0.4
        this.closeEyes()
      } else {
        this.eyelid.userData.duration =2+Math.random()*3
        this.openEyes()
      }
    }
    this.eyelid.userData.timer += dt
  }

  initAnimation(mesh) {
    const anims = mesh.animations
    this.loadClip('attack powerful', anims[ 0 ], 2, LoopOnce  )
    this.loadClip('attack1', anims[ 1 ], 0.3, LoopOnce )
    this.loadClip('attack2', anims[ 2 ], 0.3, LoopOnce )
    this.loadClip('attack3', anims[ 3 ], 0.3, LoopOnce )
    this.loadClip('backflip', anims[ 4 ], 0.5, LoopOnce )
    this.loadClip('daying', anims[ 5 ], 4, LoopOnce, true  )
    this.loadClip('fall', anims[ 6 ], 1.5 )
    this.loadClip('idle', anims[ 7 ], 3 )
    this.loadClip('idle shield', anims[ 8 ], 3 )
    this.loadClip('hit', anims[ 9 ], 0.5, LoopOnce  )
    this.loadClip('push', anims[ 10 ], 1 )
    this.loadClip('roll', anims[ 11 ], 0.75, LoopOnce  )
    this.loadClip('run', anims[ 12 ], 0.5 )
    this.loadClip('run shield', anims[ 13 ], 0.5 )
    this.loadClip('straf', anims[ 14 ], 0.5 )
  }

  initSounds() {
    this.loadSound('attack1', 'sound/attack1.wav')
    this.loadSound('attack2', 'sound/attack2.wav')
    this.loadSound('attack3', 'sound/attack3.wav')
    this.loadSound('attack4', 'sound/attack4.wav')
    this.loadSound('sword1', 'sound/sword1.wav')
    this.loadSound('sword2', 'sound/sword2.wav')
    this.loadSound('roll', 'sound/roll.wav')
    this.loadSound('rollvoice1', 'sound/rollvoice1.wav')
    this.loadSound('rollvoice2', 'sound/rollvoice2.wav')
    this.loadSound('rollvoice3', 'sound/rollvoice3.wav')
    this.loadSound('shield', 'sound/shield.wav')
    this.loadSound('shieldout', 'sound/shieldout.wav')
    this.loadSound('cry', 'sound/cry.wav')
    this.loadSound('yell', 'sound/yell.wav')
    this.loadSound('hit', 'sound/hit_player.wav')
    this.loadSound('stepS1', 'sound/step_stone1.wav', 0.3)
    this.loadSound('stepS2', 'sound/step_stone2.wav', 0.3)
    this.loadSound('stepS3', 'sound/step_stone3.wav', 0.3)
    this.loadSound('stepS4', 'sound/step_stone4.wav', 0.3)
    this.loadSound('stepW1', 'sound/step_wood1.wav', 0.5)
    this.loadSound('stepW2', 'sound/step_wood2.wav', 0.5)
    this.loadSound('stepG1', 'sound/step_grass1.wav', 0.5)
    this.loadSound('stepG2', 'sound/step_grass2.wav', 0.5)
    this.loadSound('stepG3', 'sound/step_grass3.wav', 0.5)
    this.loadSound('stepG4', 'sound/step_grass4.wav', 0.5)
    this.loadSound('stepD1', 'sound/step_dirt1.wav', 0.5)
    this.loadSound('stepD2', 'sound/step_dirt2.wav', 0.5)
    this.loadSound('stepD3', 'sound/step_dirt3.wav', 0.5)
    this.loadSound('stepD4', 'sound/step_dirt4.wav', 0.5)
    this.loadSound('dead', 'sound/death.wav')
    this.loadSound('push', 'sound/push.wav')
  }

  get active() {
    return this.ctrl.active
  }

  set active( value ) {
    this.ctrl.active = value
  }

  static update(dt, Mob1, Grass, Box, Area){
    for (const player of Player.instances) 
      player.update(dt, Mob1, Grass, Box, Area)
  }

}