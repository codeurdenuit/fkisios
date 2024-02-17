import { PerspectiveCamera } from 'three'

export default class Camera extends PerspectiveCamera {
  constructor() {
    super(70, innerWidth / innerHeight)
    this.position.y +=3*1.8
    this.position.z += 5*1.8
    this.lookAt(0,0,1*1.8)
  }
}
