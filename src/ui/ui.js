import { createElement } from '../tool/function'

export default class UI {
  constructor(player) {
    const hp = createElement('div', 'hp')
    for (let i = 0; i < player.hp; i++)
      hp.appendChild(createElement('div', `heart p${i}`))

    const rubies = createElement('div', 'rubies')
    rubies.appendChild(createElement('div', 'icon'))
    rubies.appendChild(createElement('div', 'value', '00'))

    document.body.appendChild(hp)
    document.body.appendChild(rubies)

    this.rubyDom = rubies
    this.htDom = hp
    this.rubyValueDom = rubies.children[1]
    this.value = 0
  }

  update(player) {
    if (!player) return
    this.setRubies(player.rubies)
    this.setHP(player.hp)
  }

  setRubies(value) {
    if (value === 0) this.rubyValueDom.textContent = '00'
    else if (value < 10) this.rubyValueDom.textContent = `0${value}`
    else this.rubyValueDom.textContent = value
  }

  setHP(value) {
    if (this.value !== value) {
      this.htDom.className = `hp h${value * 2}`
      this.value = value
    }
  }

  delete() {
    document.body.removeChild(this.rubyDom)
    document.body.removeChild(this.htDom)
  }
}
