import { ColliderDesc, RigidBodyDesc } from '@dimforge/rapier3d-compat'

export function getCanvas() {
  const canvas = document.getElementsByTagName('canvas')[0]
  canvas.width = innerWidth
  canvas.height = innerHeight
  return canvas
}

export function createCollider(mesh, physic) {
  const geo = mesh.geometry
  const vertices = new Float32Array(geo.attributes.position.array)
  const indices = new Float32Array(geo.index.array)
  const colliderDesc = ColliderDesc.trimesh(vertices, indices)
  return physic.createCollider(colliderDesc)
}

export function createRigidBody(position, physic) {
  const rigidBodyDesc = RigidBodyDesc.dynamic()
  rigidBodyDesc.setTranslation(...position)
  const rigidBody = physic.createRigidBody(rigidBodyDesc)
  const colliderDesc = ColliderDesc.ball(0.25)
  const collider = physic.createCollider(colliderDesc, rigidBody)
  return { rigidBody, collider }
}

export function floor(float, max = 0.2) {
  return Math.abs(float) < max ? 0 : float
}
