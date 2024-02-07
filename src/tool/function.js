import { MathUtils } from 'three'
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js'

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

export function round(number, precision) {
  return (Math.floor(precision * Math.abs(number)) / precision) * Math.sign(number)
}

export function removeFromArray(item, array) {
  const index = array.indexOf(item)
  array.splice(index, 1)
  return array
}

export function findInstanceByName(name, aClass) {
  return aClass.instances.find((c) => name === c.name)
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

export function getTarget(position, Mob, distance) {
  const entity = nearest(position, Mob.instances)
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

export function cleanGame(Classes, focus, world, graphic, ui) {
  for (const Class of Classes) {
    for (let i = 0; i < Class.instances.length; i++) {
      Class.instances[i].delete()
      i--
    }
  }
  ui.delete()
  focus.delete()
  world.delete()
  graphic.scene.clear()
  graphic.stop()
}
