import { MathUtils } from 'three'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'
import Rapier from '@dimforge/rapier3d-compat'

export function getCanvas() {
  const canvas = document.getElementsByTagName('canvas')[0]
  canvas.width = innerWidth
  canvas.height = innerHeight
  return canvas
}

export function getGap(angle1, angle2) {
  let angle = ((angle1 - angle2 + Math.PI) % (Math.PI * 2)) - Math.PI
  angle < -Math.PI ? angle + Math.PI * 2 : angle
  return angle
}

export function getGapAbs(angle1, angle2) {
  let angle = ((angle1 - angle2 + Math.PI) % (Math.PI * 2)) - Math.PI
  angle < -Math.PI ? angle + Math.PI * 2 : angle
  return Math.abs(angle)
}

export function getAngle(point1, point2) {
  const dx = point1.x - point2.x
  const dz = point1.z - point2.z
  return Math.atan2(-dz, dx) + Math.PI / 2
}

export function getDistance(point1, point2) {
  const dx = point1.x - point2.x
  const dz = point1.z - point2.z
  return Math.sqrt(dx * dx + dz * dz)
}

export function inBox(point1, point2, size) {
  return point2.x < point1.x - size ||
    point2.x > point1.x + size ||
    point2.z < point1.z - size ||
    point2.z > point1.z + size
    ? false
    : true
}

export function angleOfVector(point) {
  return Math.atan2(-point.y, point.x) + Math.PI / 2
}

export function randomBool(positiveProbability = 0.5) {
  return Math.random() < positiveProbability
}

export function randomInt(min = 0, max = 1) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function proba(value) {
  return Math.random() < value
}

export function spreadAround(pos, dx, dz) {
  const newPos = pos.clone()
  newPos.x += MathUtils.randFloatSpread(dx)
  newPos.z += MathUtils.randFloatSpread(dz)
  return newPos
}

export function inHitBox(objOrigin, objTarget, hitAngleForce) {
  const hitAngle = hitAngleForce || objOrigin.constructor.hitAngle
  const hitRange = objOrigin.constructor.hitRange
  const originPos = objOrigin.position
  const targetPox = objTarget.position
  const originDir = objOrigin.rotation.y
  const targetDir = getAngle(targetPox, originPos)
  const deltaPos = getDistance(targetPox, originPos)
  const deltaDir = getGapAbs(targetDir, originDir)
  return deltaPos < hitRange && deltaDir < hitAngle
}

export function castShadowRecursive(object) {
  if (object.isMesh) object.castShadow = true
  const children = object.children
  for (let i = 0; i < children.length; i++) {
    castShadowRecursive(children[i])
  }
}

export function browse(object, callback) {
  if (object.isMesh) callback(object)
  const children = object.children
  for (let i = 0; i < children.length; i++) {
    browse(children[i], callback)
  }
}

export function nearest(position, objects) {
  objects.sort((a, b) => {
    return position.distanceTo(a.position) - position.distanceTo(b.position)
  })
  return objects[0]
}

export function floor(float, max = 0.2) {
  return Math.abs(float) < max ? 0 : float
}

export function removeFromArray(item, array) {
  const index = array.indexOf(item)
  array.splice(index, 1)
  return array
}

export function findByName(name, list) {
  return list.find((a) => name === a.name)
}

export function clone(mesh) {
  const cloned = cloneSkeleton(mesh)
  cloned.animations = mesh.animations
  return cloned
}

export function replaceMaterial(mesh, material) {
  material.map = mesh.material.map
  material.normalMap = mesh.material.normalMap
  mesh.material = material
  return mesh
}

const reg = /\[(.*?)\]/
export function getSrc(src) {
  const match = src.match(reg)
  if (match !== null) {
    const range = match[1].split('-')
    const iBegin = parseInt(range[0], 10)
    const iEnd = parseInt(range[1], 10)
    const size = iEnd - iBegin + 1
    const source = src.split('[')[0]
    const ext = src.split(']')[1]
    return new Array(size).fill(null).map((e, i) => source + (i + iBegin) + ext)
  }
  return [src]
}

export function clamp1(val) {
  return val > 1 ? 1 : val < 0 ? 0 : val
}

export function getTarget(position, mobs, distance) {
  const entity = nearest(position, mobs)
  if (!entity) return null
  const dis = getDistance(entity.position, position)
  return dis < distance ? entity : null
}

let _seed = 42
export function random() {
  _seed ^= _seed << 13
  _seed ^= _seed >> 17
  _seed ^= _seed >> 5
  _seed = _seed < 0 ? ~_seed + 1 : _seed
  return _seed / 2147483647
}

export function probaSeed(value) {
  return random() < value
}

export function getRubisValue(mesh, value) {
  return value ? value : mesh.isRootName('rubisB') ? 10 : 1
}

export function createElement(tag, className, value, onclick) {
  const element = document.createElement(tag)
  element.className = className
  if (value) {
    if (tag === 'img') element.src = value
    else if (tag === 'input') element.value = value
    else element.textContent = value
  }
  if (onclick) tag === 'a' ? (element.href = onclick) : (element.onclick = onclick)
  return element
}

export function drawInput(name, value, callback) {
  const container = createElement('div', `key ${name}`)
  const input = createElement('input', '', value)
  input.id = `${value}_${name}`
  input.addEventListener('input', callback)
  container.appendChild(input)
  return container
}

export function cleanGame(objects3d, graphic, ui) {
  for (let key in objects3d) {
    const object = objects3d[key]
    if (Array.isArray(object)) {
      for (const obj of object) {
        obj.delete()
      }
    } else {
      object.delete()
    }
  }
  ui.delete()
  graphic.scene.clear()
  graphic.stop()
}

export function creatRigidBody(position, physic) {
  const rigidBodyDesc = Rapier.RigidBodyDesc.dynamic()
  rigidBodyDesc.setTranslation(...position)
  const rigidBody = physic.createRigidBody(rigidBodyDesc)
  const collider = physic.createCollider(Rapier.ColliderDesc.ball(0.5), rigidBody)
  return { rigidBody, collider }
}

export function creatRigidBox(position, physic, size) {
  const rigidBodyDesc = Rapier.RigidBodyDesc.dynamic()
  rigidBodyDesc.setTranslation(...position)
  const rigidBody = physic.createRigidBody(rigidBodyDesc)
  const collider = physic.createCollider(
    Rapier.ColliderDesc.cuboid(size, size, size).setDensity(2),
    rigidBody
  )
  rigidBody.lockRotations(true)
  return { rigidBody, collider }
}

export function createCollider(mesh, physic) {
  const vertices = new Float32Array(mesh.geometry.attributes.position.array)
  const indices = new Float32Array(mesh.geometry.index.array)
  return physic.createCollider(Rapier.ColliderDesc.trimesh(vertices, indices))
}
