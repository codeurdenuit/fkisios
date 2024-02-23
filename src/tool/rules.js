import { findByName, nearest } from './function'
import Sound from '../engine/sound'


export default class Rules {
  list = []
  cbOver = null

  constructor(player, blocks, boxes, areas, mobs, world, menu, light) {
    const sound = new Sound('./sound/secret.wav')
    const soundFall = new Sound('./sound/fall.wav')
    const soundDanger = new Sound('./sound/danger.mp3',0, true)
    soundDanger.play()
    
    /////// OPEN THE WAY /////////////////
    this.list.push(() => {
      const box = findByName('box_A_cast_receive', boxes)
      if (!box) {
        sound.play()
        return true
      }
    })

    /////// PLAYER DEAD /////////////////
    let t0 = 0

    this.list.push((dt) => {
      if (player.hp<=0) {
        if ((t0 += dt) > 2) {
          soundDanger.stop()
          debugger
          this.gameover()
        }
      }
    })

    /////// PUSH BLOCK TO PASS /////////////////
    /*const block = findByName('block_cast_receive', blocks)
    const area = findByName('area_trigger', areas)
    let t1 = 0
    this.list.push((dt) => {
      if (area.containsPoint(block.position)) {
        if ((t1 += dt) > 1) {
          sound.play()
          return true
        }
      } else {
        t1 = 0
      }
    })*/

    /////// FALL INTO THE VOID /////////////////
    let t2 = 0
    this.list.push((dt) => {
      if (player.position.y < -5) {
        if (t2 === 0) {
          player.ctrl.disable()
          soundFall.play()
        }
        if ((t2 += dt) > 1) {
          soundFall.stop()
          debugger
          this.gameover()
        }
      } else {
        t2 = 0
      }
    })

    /////// END GAME /////////////////
    let t3 = 0
    const areaEnd = findByName('area_wood_end', areas)
    this.list.push((dt) => {
      if (!player.ctrl.active && !menu.displayed) {
        if ((t3 += dt) > 1.5) {
          this.gameover()
        }
      } else if (areaEnd.containsPoint(player.position)) {
        player.ctrl.disable()
        player.ctrl.axis.y = -1
        player.ctrl.axis.x = 0
      } else {
        t3 = 0
      }
    })


    /////// CAVE LIGHT /////////////////
    let t4 = 0
    this.list.push((dt) => {
      if (player.position.z < -18 && player.position.z > -48) {
        t4 += dt
        t4 = Math.min(1, t4)
      } else {
        t4 -= dt
        t4 = Math.max(0, t4)
      }
      light.setRGB(1 - 0.9 * t4, 1 - 0.9 * t4, 1 - 0.7 * t4)
      light.intensity = 4 - 0.5 * t4
    })

    ///////  SOUND MOBS /////////////////
    this.list.push((dt) => {
      const mob = nearest(player.position, mobs)
      if(mob && mob.distance<7) {
        const factor = (1-mob.distance/7)
        const dv1=(0.6*factor-soundDanger.volume)*dt
        soundDanger.volume = soundDanger.volume+dv1
        const dv2=(0.3*factor-world.volume)*dt
        world.volume = world.volume+dv2
      } else {
        const dv1=(0-soundDanger.volume)*dt
        soundDanger.volume = soundDanger.volume+dv1
        const dv2=(0.2-world.volume)*dt
        world.volume = world.volume+dv2
      }
    })
  }

  gameover() {
    this.cbOver()
  }

  onGameover(callback) {
    this.cbOver = callback
  }

  update(dt) {
    for (let i = 0; i < this.list.length; i++) {
      if (this.list[i](dt)) {
        this.list.splice(i, 1)
        i--
      }
    }
  }
}
