import { findInstanceByName } from './function'

export default class Rules {
  list = []

  constructor(Player, Block, Box, Area, world, menu) {
    const sound = new Audio('sound/secret.wav')
    const soundFall = new Audio('sound/fall.wav')
    const player = Player.getInstance(0)

    this.list.push(() => {
      const box = findInstanceByName('box_A_cast_receive', Box)
      if (!box) {
        sound.play()
        return true
      }
    })

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

    let t2 = 0
    this.list.push((dt) => {
      if (player.position.y < -5) {
        if (t2 === 0) {
          player.ctrl.disable()
          soundFall.play()
        }
        if ((t2 += dt) > 1) {
          window.location.href = window.location.href
        }
      } else {
        t2 = 0
      }
    })

    let t3 = 0
    const areaEnd = findInstanceByName('area_wood_end', Area)
    this.list.push((dt) => {
      if (!player.ctrl.active && !menu.display) {
        if ((t3 += dt) > 1.5) {
          window.location.href = window.location.href
        }
      } else if (areaEnd.containsPoint(player.position)) {
        player.ctrl.disable()
        player.ctrl.axis.y = -1
        player.ctrl.axis.x = 0
      } else {
        t3 = 0
      }
    })

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
