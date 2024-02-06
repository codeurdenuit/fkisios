import {createElement} from '../tool/function'


export default class UI  {

  constructor(Player) {
    const player = Player.instances[0]
    const hp = createElement('div', 'hp')
    for(let i=0; i<player.hp;  i++) 
    hp.appendChild(createElement('div', `heart p${i}`))
    document.body.appendChild(hp)

    const rubies = createElement('div', 'rubies')
    rubies.appendChild(createElement('div', 'icon'))
    rubies.appendChild(createElement('div', 'value', '00'))
    document.body.appendChild(rubies)

    this.rubyDom = rubies.children[1]
    this.htDom = hp
    this.value = 0
  }

  update(Player) {
    const player = Player.instances[0]
    if(!player) return
    this.setRubies(player.rubies)
    this.setHP(player.hp)
  }

  setRubies(value) {
    if(value===0)
    this.rubyDom.textContent = '00'
    else if(value<10)
    this.rubyDom.textContent = `0${value}`
    else 
    this.rubyDom.textContent = value
  }

  setHP(value) {
    if( this.value !== value ) {
      this.htDom.className = `hp h${value*2}`
      this.value = value
    }
  }

}



