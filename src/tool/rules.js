import { findInstanceByName } from './function'
import Sound from '../engine/sound'


export default class Rules {
  list = []
  cbOver = null

  constructor(Player, Block, Box, Area, Mob, world, menu) {
    const sound = new Sound('sound/secret.wav')
    const soundFall = new Sound('sound/fall.wav')
    const soundDanger = new Sound('sound/danger.mp3',0, true)
    soundDanger.play()
    
    const player = Player.getInstance(0)

    /////// OPEN THE WAY /////////////////
    this.list.push(() => {
      const box = findInstanceByName('box_A_cast_receive', Box)
      if (!box) {
        sound.play()
        return true
      }
    })

    /////// PLAYER DEAD /////////////////
    let t0 = 0
    this.list.push((dt) => {
      if (!Player.getInstance(0)) {
        if ((t0 += dt) > 2) {
          soundDanger.stop()
          this.gameover()
        }
      }
    })

    /////// CAVE LIGHT /////////////////
    const block = findInstanceByName('block_cast_receive', Block)
    const area = findInstanceByName('area_trigger', Area)
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
    })

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
          this.gameover()
        }
      } else {
        t2 = 0
      }
    })

    /////// END GAME /////////////////
    let t3 = 0
    const areaEnd = findInstanceByName('area_wood_end', Area)
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

    /////// PUSH BLOCK TO PASS /////////////////
    let t4 = 0
    this.list.push((dt) => {
      if (player.position.z < -18 && player.position.z > -48) {
        t4 += dt
        t4 = Math.min(1, t4)
      } else {
        t4 -= dt
        t4 = Math.max(0, t4)
      }
      world.dirLight.color.setRGB(1 - 0.9 * t4, 1 - 0.9 * t4, 1 - 0.7 * t4)
      world.ambient.color.setRGB(1 - 0.8 * t4, 1 - 0.8 * t4, 1 - 0.6 * t4)
      world.dirLight.intensity = 4 - 0.5 * t4
    })

    ///////  SOUND MOBS /////////////////
    this.list.push((dt) => {
      const mob = Mob.nearest(player.position)
      if(mob && mob.distance<7) {
        const factor = (1-mob.distance/7)
        const dv1=(0.8*factor-soundDanger.volume)*dt
        soundDanger.volume = soundDanger.volume+dv1
        const dv2=(0.4*factor-world.volume)*dt
        world.volume = world.volume+dv2
      } else {
        const dv1=(0-soundDanger.volume)*dt
        soundDanger.volume = soundDanger.volume+dv1
        const dv2=(0.4-world.volume)*dt
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
