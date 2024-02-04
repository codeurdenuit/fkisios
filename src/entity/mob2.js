import {Vector3, LoopOnce} from 'three'
import Ai from '../control/control_ai'
import Particles from '../effect/particles'
import Entity from './entity'
import Mob1 from './mob1'
import {getGap, inHitBox, castShadowRecursive, getDistance} from '../function/function'

export default class Mob2 extends Entity {

  static instances = Mob1.instances
  static hitAngle = Math.PI/2
  static hitDistance = 1.8
  static velocity = 0.4
  static hearing = 0.5
  static cbDead = null

  constructor(mesh, origin, physic) {
    super(mesh, origin, physic)
    this.ctrl = new Ai(2, origin, 0.5)
    this.initVisual(mesh)
    this.initAnimation(mesh)
    this.initSounds()
    this.hp = 5
    this.distance = 999
    Mob2.instances.push(this)
  }

  initVisual(mesh) {
    castShadowRecursive(mesh)
    mesh.position.y -= 0.4
    mesh.scale
    this.add(mesh)
  }

  update(dt, Player) {
    super.update(dt)
    if(this.isBusy()) return
    this.ctrl.compute(dt, Player, this.position)
    this.positionVel.x = this.ctrl.axis.x*Mob2.velocity
    this.positionVel.y = this.ctrl.axis.y*Mob2.velocity
    this.rotationVel = getGap(this.ctrl.angle, this.rotation.y)*dt*2
    if(this.ctrl.attack) {
      this.updateClipAttack(Player)
    } else {
      this.updateClipMove()
    }
    this.updateDistance(Player)
  }

  updateClipAttack(Player) {
    const player = Player.instances[0]
    if(!player) return
    if(this.isAttack()) return
    this.positionVel.x = 3*Math.cos(this.rotation.y-Math.PI/2)
    this.positionVel.y = -3*Math.sin(this.rotation.y-Math.PI/2)
    this.playClip('attack')
    this.playSound('jump')
    this.onClipHalf(()=> {
      if(inHitBox(this, player )) {
        player.hit(this, 0.5)
      }
    })
    this.onClipEnd(()=> {
      this.positionVel.x = 0
      this.positionVel.y = 0
    })
  }

  updateClipMove() {
    if(this.positionVel.length()!==0 )  {
      if(!this.isClip('jump')) {
        this.playClip('jump')
        this.onClipHalf(()=> {
          this.playSound('jump').volume = Math.min(Mob2.hearing/this.distance,1)
        })
      }
    } else {
      if(!this.isClip('idle')) {
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

  updateClipHit() {
    this.playClip('hit')
    this.playSound('hitmob')
    this.onClipEnd(()=> {
      this.playClip('idle')
    })
  }

  hit(entity) {
    if(this.isHit()) return
    this.createParticles(entity)
    this.hp -= 1
    this.positionVel.set(0,0)
    this.rotationVel = 0
    if(this.hp > 0)
      this.updateClipHit()
    else
      this.updateClipDaying()
  }

  updateClipDaying() {
    this.scale.set(0,0,0)
    this.playSound('dead')
    if(Mob2.cbDead)
    Mob2.cbDead(this.position)
    this.delete()
  }

  createParticles(entity) {
    const x = (this.position.x*3 + entity.position.x*1)/4
    const z = (this.position.z*3 + entity.position.z*1)/4
    this.parent.add(new Particles(new Vector3(x,this.position.y-0.2,z)))
  }


  isBusy() {
    return this.isClip('hit') || this.isClip('attack') ||  this.hp<=0
  }

  isHit() {
    return this.isClip('hit')||this.hp<=0
  }

  isAttack() {
    return this.isClip('attack')
  }

  initAnimation(mesh) {
    const anims = mesh.animations
    this.loadClip('attack', anims[ 0 ], 1.0, LoopOnce )
    this.loadClip('hit', anims[ 2 ], 0.4, LoopOnce  )
    this.loadClip('idle', anims[ 3 ], 2 )
    this.loadClip('idle2', anims[ 4 ], 2 )
    this.loadClip('jump', anims[ 5 ], 1.0)
  }

  initSounds() {
    this.loadSound('jump', 'sound/jump.wav')
    this.loadSound('hitmob', 'sound/hit_mob.wav') 
    this.loadSound('dead', 'sound/death.wav')
  }

  static onDead(callback) {
    this.cbDead = callback
  }

  static update(dt, Player){
    for (const mob of Mob2.instances) mob.update(dt, Player)
  }

}