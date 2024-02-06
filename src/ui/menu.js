import {createElement} from '../tool/function'
const text = `
Javascript has no limits.
I'm preparing a ThreeJS tutorial for creating video games. 
`


export default class Menu  {

  display= true

  constructor() {
    const menu = createElement('div', 'menu')
    const title = createElement('div', 'title', '𐌅𐌊𐌉𐌔𐌉𐌏𐌔')
    const pic = createElement('img', 'tech', 'tech.png')
    const desc = createElement('div','desc', text )
    const button1 = createElement('div','button', 'START', ()=>{this.onStartCb()})
    const button2 = createElement('a','button', 'Github', 'https://github.com/codeurdenuit/fkisios')

    menu.appendChild(title)
    menu.appendChild(pic)
    menu.appendChild(desc)
    menu.appendChild(button1)
    menu.appendChild(button2)

    document.body.appendChild(menu)
    this.menu = menu

  }

  onStart(callback) {
    this.onStartCb = callback
  }


  hide() {
    this.menu.className = 'menu hide'
    this.display = false
  }

  show() {
    this.menu.display = 'menu'
    this.display = true
  }

}



