import {Vector3, LoopOnce} from 'three'
import Ai from '../control/control_ai'
import Particles from '../effect/particles'
import Entity from './entity'

import {getGap, inHitBox, castShadowRecursive, randomInt, getDistance} from '../function/function'

export default class Mob1 extends Entity {

  static instances = []
  static hitAngle = Math.PI/2
  static hitDistance = 1.8
  static velocity = 0.4
  static hearing = 2
  static cbDead = null

  constructor(mesh, origin, physic) {
    super(mesh, origin, physic)
    this.ctrl = new Ai(4, origin, 0.5)
    this.initVisual(mesh)
    this.initAnimation(mesh)
    this.initSounds()

    this.hp = 2
    Mob1.instances.push(this)
  }

  initVisual(mesh) {
    castShadowRecursive(mesh)
    mesh.position.y -= 0.5
    mesh.scale.set(1.5,1.5,1.5)
    this.add(mesh)
  }

  update(dt, Player) {
    super.update(dt)
    if(this.isBusy()) return
    this.ctrl.compute(dt, Player, this.position)
    if(this.ctrl.attack) {
      this.positionVel.set(0,0)
      this.rotationVel = 0
      this.updateClipAttack(Player)
    } else {
      this.positionVel.x = this.ctrl.axis.x*Mob1.velocity
      this.positionVel.y = this.ctrl.axis.y*Mob1.velocity
      this.rotationVel = getGap(this.ctrl.angle, this.rotation.y)*dt*2
      this.updateClipMove()
    }
    this.updateDistance(Player)
  }

  updateClipAttack(Player) {
    const player = Player.instances[0]
    if(!player) return
    if(this.isClip('attack')) return
    this.playClip('attack')
    this.onClipHalf(()=> {
      this.playSound('attackmob')
      if(inHitBox(this, player )) {
        player.hit(this, 1)
      }
    })
    this.onClipEnd(()=>{
      this.playClip('idle shield')
    })
  }

  updateClipMove() {
    if(this.positionVel.length()!==0 )  {
      if(this.ctrl.focus){
        if(!this.isClip('walk shield')) {
          this.playClip('walk shield')
          this.playSoundStep()
        }
      } else {
        if(!this.isClip('walk')){
          this.playClip('walk')
          this.playSoundStep()
        }
      }
    } else {
      if(Math.abs(this.rotationVel)>0.01) {
        if(!this.isClip('straff shield')) {
          this.playClip('straff shield', Math.sign(this.rotationVel))
          this.playSoundStep()
        }
      } else if(this.ctrl.focus){
        this.playClip('idle shield')
      } else {
        this.playClip('idle')
      }
    }
  }

  updateDistance(Player) {
    const player = Player.instances[0]
    if(player) {
      this.distance = getDistance(player.position, this.position)
    }
  }

  playSoundStep() {
    this.onClipLoop(()=> {
      this.playSound('stepiron1').volume = Math.min(Mob1.hearing/this.distance,1)
    })
    this.onClipHalf(()=> {
      this.playSound('stepiron2').volume = Math.min(Mob1.hearing/this.distance,1)
    })
  }

  updateClipHit() {
    if(this.isClip('attack')) {
      this.playClip('hit')
      this.playSound('hitmob')
    }else {
      this.playClip('block')
      this.playSound('iron',1,3)
    }
    this.onClipEnd(()=> {
      this.playClip('idle shield')
    })
  }

  hit(entity) {
    if(this.isHit()) return
    this.createParticles(entity)
    if(this.isClip('attack')||!inHitBox(this, entity, Math.PI )){
      this.hp -= 1
    }
    this.positionVel.set(0,0)
    this.rotationVel = 0
    if(this.hp > 0)
      this.updateClipHit()
    else
      this.updateClipDaying()
  }

  updateClipDaying() {
    this.playClip('death')
    this.playSound('hitmob')
    this.onClipEnd(()=> {
      this.scale.set(0,0,0)
      this.playSound('dead')
      this.delete()
      if(Mob1.cbDead)
      Mob1.cbDead(this.position)
    })
  }

  createParticles(entity) {
    const x = (this.position.x*2 + entity.position.x*1)/3
    const z = (this.position.z*2 + entity.position.z*1)/3
    this.parent.add(new Particles(new Vector3(x,this.position.y,z)))
  }


  isBusy() {
    return this.isClip('hit') || this.isClip('block') || this.isClip('attack')||this.hp<=0
  }

  isHit() {
    return this.isClip('hit') || this.isClip('block')||this.hp<=0
  }


  initAnimation(mesh) {
    const anims = mesh.animations
    this.loadClip('attack', anims[ 0 ], 2, LoopOnce  )
    this.loadClip('block', anims[ 1 ], 0.2, LoopOnce  )
    this.loadClip('death', anims[ 2 ], 2.0, LoopOnce)
    this.loadClip('hit', anims[ 3 ], 0.5, LoopOnce  )
    this.loadClip('idle', anims[ 4 ], 2.0 )
    this.loadClip('idle shield', anims[ 5 ], 2.0 )
    this.loadClip('straff shield', anims[ 6 ], 0.5 )
    this.loadClip('walk shield', anims[ 7 ], 1.48 )
    this.loadClip('walk', anims[ 8 ], 1.48 )
  }

  initSounds() {
    this.loadSound('iron1', 'sound/hit_iron1.wav')
    this.loadSound('iron2', 'sound/hit_iron2.wav')  
    this.loadSound('iron3', 'sound/hit_iron3.wav') 
    this.loadSound('hitmob', 'sound/hit_mob.wav') 
    this.loadSound('attackmob', 'sound/attack_mob.wav') 
    this.loadSound('stepiron1', 'sound/step_iron1.wav') 
    this.loadSound('stepiron2', 'sound/step_iron3.wav') 
    this.loadSound('dead', 'sound/death.wav')
  }

  static onDead(callback) {
    this.cbDead = callback
  }

  static update(dt, Player){
    for (const mob of Mob1.instances) mob.update(dt, Player)
  }

}