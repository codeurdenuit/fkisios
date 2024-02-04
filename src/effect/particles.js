import {
  Points,
  PointsMaterial,
  BufferGeometry,
  Float32BufferAttribute,
  Clock,
  Vector3,
  MathUtils
} from 'three'

export default class Particles extends Points {
  static count = 30

  constructor(position) {
    super()
    this.position.copy(position)
    this.scale.set(2, 2, 2)
    this.position.y += (Math.random() - 0.5) * 0.5
    const positions = Particles.randVector3Array()
    this.velocities = Particles.randVector3Array(1, 1, 0.0)
    this.aceleration = Particles.randVector3Array(1, 1, 0.0)

    this.geometry = new BufferGeometry()
    this.geometry.setAttribute(
      'position',
      new Float32BufferAttribute(positions, 3)
    )
    this.material = new PointsMaterial({ color: 0xffffff, size: 0.16, depthTest: false })
    this.clock = new Clock()
    this.lifeOrigin = 1
    this.life = this.lifeOrigin
    this.loop = this.loop.bind(this)
    this.renderOrder = 1
    this.loop()
  }

  loop() {
    const dt = this.clock.getDelta()
    this.life -= dt
    const count = Particles.count
    const positions = this.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      positions[i * 3] +=
        this.velocities[i * 3] * dt * Math.pow(this.life / this.lifeOrigin, 2)
      positions[i * 3 + 1] +=
        this.velocities[i * 3 + 1] * dt * Math.pow(this.life / this.lifeOrigin, 2)
      positions[i * 3 + 2] +=
        this.velocities[i * 3 + 2] * dt * Math.pow(this.life / this.lifeOrigin, 2)
    }
    this.geometry.attributes.position.needsUpdate = true
    this.material.size *= Math.pow(this.life / this.lifeOrigin, 2)
    if (this.life <= 0 || this.material.size < 0.01) {
      this.autoDelete()
    } else {
      requestAnimationFrame(this.loop)
    }
  }

  autoDelete() {
    this.geometry.dispose()
    this.removeFromParent()
  }

  static randVector3Array(rangeX = 0, rangeY = 0, rangeZ = 0) {
    const count = Particles.count
    const array = new Float32Array(count * 3)
    const vec = new Vector3()
    for (let i = 0; i < count; i++) {
      vec.x = MathUtils.randFloatSpread(rangeX)
      vec.y = MathUtils.randFloatSpread(rangeY)
      vec.z = MathUtils.randFloatSpread(rangeZ)
      vec.normalize()
      vec.multiplyScalar(MathUtils.randFloat(0.5, 1))
      array[i * 3] = vec.x
      array[i * 3 + 1] = vec.y
      array[i * 3 + 2] = vec.z
    }
    return array
  }
}
