import Rapier from '@dimforge/rapier3d-compat'
window.canvas = document.getElementById('canvas')
window.canvas.width = innerWidth
window.canvas.height = innerHeight

export function creatRigidBody(position, physic) {
  const rigidBodyDesc = Rapier.RigidBodyDesc.dynamic()
  rigidBodyDesc.setTranslation(position.x, position.y, position.z)
  const rigidBody = physic.createRigidBody(rigidBodyDesc)
  const collider = physic.createCollider(Rapier.ColliderDesc.ball(0.5), rigidBody)
  return { rigidBody, collider }
}

export function createCollider(mesh, physic) {
  const vertices = new Float32Array(mesh.geometry.attributes.position.array)
  const indices = new Float32Array(mesh.geometry.index.array)
  return physic.createCollider(Rapier.ColliderDesc.trimesh(vertices, indices))
}

export function round(number) {
  const precision = 10
  return Math.round(precision * number) / precision
}

export function floor(number, max=0.2) {
  return Math.abs(number) < max ? 0 : number
}