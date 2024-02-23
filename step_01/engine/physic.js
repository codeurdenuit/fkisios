import Rapier from '@dimforge/rapier3d-compat'
await Rapier.init()

export default new Rapier.World({ x: 0, y: -9.81, z: 0 })
