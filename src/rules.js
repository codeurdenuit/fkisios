import { findInstanceByName } from './function/function'

export default class Rules {
  list = []

  constructor(Player, Block, Box, Area, world, menu) {
    const sound = new Audio('sound/secret.wav')
    const soundFall = new Audio('sound/fall.wav')
    const player = Player.instances[0]

    this.list.push(() => {
      const box = findInstanceByName('box_A_cast_receive', Box)
      if (!box) {
        sound.play()
        return true
      }
    })

    const block = findInstanceByName('block_cast_receive', Block)
    const area = findInstanceByName('area_trigger', Area)
    let timer = 0
    this.list.push((dt) => {
      if (area.containsPoint(block.position)) {
        if ((timer += dt) > 1) {
          sound.play()
          return true
        }
      } else {
        timer = 0
      }
    })

    let timer2 = 0
    this.list.push((dt) => {
      if (player.position.y < -5) {
        if (timer2 === 0) {
          player.ctrl.disable()
          soundFall.play()
        }
        if ((timer2 += dt) > 1) {
          window.location.href = window.location.href
        }
      } else {
        timer2 = 0
      }
    })

    let timer3 = 0
    const areaEnd = findInstanceByName('area_wood_end', Area)
    this.list.push((dt) => {
      if (!player.ctrl.active && !menu.display) {
        if ((timer3 += dt) > 1.5) {
          window.location.href = window.location.href
        }
      } else if (areaEnd.containsPoint(player.position)) {
        player.ctrl.disable()
        player.ctrl.axis.y = -1
        player.ctrl.axis.x = 0
      } else {
        timer3 = 0
      }
    })

    let timer4 = 0
    this.list.push((dt) => {
      if (player.position.z < -18 && player.position.z > -48) {
        timer4 += dt
        timer4 = Math.min(1, timer4)
      } else {
        timer4 -= dt
        timer4 = Math.max(0, timer4)
      }
      world.dirLight.color.setRGB(
        1 - 0.9 * timer4,
        1 - 0.9 * timer4,
        1 - 0.7 * timer4
      )
      world.ambient.color.setRGB(
        1 - 0.8 * timer4,
        1 - 0.8 * timer4,
        1 - 0.6 * timer4
      )
      world.dirLight.intensity = 4 - 0.5 * timer4
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
