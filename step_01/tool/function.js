import Rapier from '@dimforge/rapier3d-compat'
window.canvas = document.getElementById('canvas')
window.canvas.width = innerWidth
window.canvas.height = innerHeight

export function creatRigidBody(position, physic) {
  const rigidBodyDesc = Rapier.RigidBodyDesc.dynamic()
  rigidBodyDesc.setTranslation(position.x, position.y, position.z)
  const rigidBody = physic.createRigidBody(rigidBodyDesc)
  const colliderDesc = Rapier.ColliderDesc.ball(0.25)
  const collider = physic.createCollider(colliderDesc, rigidBody)
  return { rigidBody, collider }
}

export function createCollider(mesh, physic) {
  const geo = mesh.geometry
  const vertices = new Float32Array(geo.attributes.position.array)
  const indices = new Float32Array(geo.index.array)
  const colliderDesc = Rapier.ColliderDesc.trimesh(vertices, indices)
  return physic.createCollider(colliderDesc)
}

export function floor(number, max=0.2) {
  return Math.abs(number) < max ? 0 : number
}