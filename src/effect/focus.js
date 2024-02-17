import { Object3D, Mesh, ConeGeometry, MeshBasicMaterial } from 'three'
const geometry = new ConeGeometry(1 / 10, 1 / 10, 8)
const material = new MeshBasicMaterial({ color: 0xffff00 })

export default class Focus extends Object3D {
  timer = 0
  previousFocus = null
  soundFocus = new Audio('./sound/focus.wav')
  soundCancel = new Audio('./sound/cancel.wav')

  constructor() {
    super()
    this.arrowTop = new Mesh(geometry, material)
    this.arrowTop.rotation.z = Math.PI
    this.arrowTop.position.y = 0.5
    this.arrowBottom = new Mesh(geometry, material)
    this.arrowBottom.rotation.z = 0
    this.arrowBottom.position.y = -0.5
    this.arrowLeft = new Mesh(geometry, material)
    this.arrowLeft.rotation.z = Math.PI / 2
    this.arrowLeft.position.x = 0.5
    this.arrowRight = new Mesh(geometry, material)
    this.arrowRight.rotation.z = -Math.PI / 2
    this.arrowRight.position.x = -0.5
    this.add(this.arrowTop)
    this.add(this.arrowBottom)
    this.add(this.arrowLeft)
    this.add(this.arrowRight)
    this.renderOrder = 1
  }

  update(dt, player, camera) {
    if (player && player.focus) {
      if (this.previousFocus !== player.focus) {
        this.timer = 0
        this.soundFocus.play()
      }
      this.visible = true
      const progress = Math.pow(Math.max(1 - this.timer, 0), 2)
      this.position.copy(player.focus.position)
      this.arrowTop.position.y = 0.5 + progress
      this.arrowBottom.position.y = -0.5 - progress
      this.arrowLeft.position.x = 0.5 + progress
      this.arrowRight.position.x = -0.5 - progress
      this.updateWorldMatrix(true, true)
      this.lookAt(camera.position)
      this.rotateZ(this.timer / 4)
      this.timer += dt * 10
      this.previousFocus = player.focus
    } else {
      if (this.timer !== 0) this.soundCancel.play()
      this.visible = false
      this.timer = 0
      this.previousFocus = null
    }
  }

  delete() {
    this.removeFromParent()
  }
}
