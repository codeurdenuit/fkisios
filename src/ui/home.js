import { createElement, drawInput } from '../tool/function'
import { keys } from '../control/gamepad'
const text = `
Javascript has no limits.
I'm preparing a ThreeJS tutorial for creating video games. 
`

export default class Home {
  display = true

  constructor() {
    const home = createElement('div', 'container')
    const menu = createElement('div', 'menu')
    const title = createElement('div', 'title', '𐌅𐌊𐌉𐌔𐌉𐌏𐌔')
    const pic = createElement('img', 'tech', './image/tech.png')
    const desc = createElement('div', 'desc', text)
    const button1 = createElement('div', 'button start', 'START', () => {
      this.onStartCb()
    })
    const inputs = createElement('div', 'config')
    this.drawInputs(inputs)
    menu.appendChild(title)
    menu.appendChild(pic)
    menu.appendChild(desc)
    menu.appendChild(inputs)
    home.appendChild(button1)
    home.appendChild(menu)
    document.body.appendChild(home)
    this.home = home
  }

  drawInputs(div) {
    for (let key in keys) {
      const action = keys[key]
      div.appendChild(drawInput(action, key, this.onKeyChange.bind(this)))
    }
  }

  onKeyChange(event) {
    const conf = event.currentTarget.id.split('_')
    const newKey = event.data
    const key = conf[0]
    const action = conf[1]
    delete keys[key]
    keys[newKey] = action
    event.currentTarget.id = `${key}_${action}`
  }

  onStart(callback) {
    this.onStartCb = callback
  }

  hide() {
    this.home.className = 'container hide'
    this.display = false
  }

  show() {
    this.home.className = 'container'
    this.display = true
  }

  get displayed() {
    return this.display
  }
}
