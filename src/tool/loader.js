import { DoubleSide } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
const loaderGlb = new GLTFLoader()

function loadObject(path) {
  return new Promise((resolve, reject) => {
    loaderGlb.load(
      path,
      function (gltf) {
        if (gltf.scene.children.length === 1) {
          const mesh = gltf.scene.children[0]
          mesh.animations = gltf.animations
          resolve(mesh)
        } else {
          resolve(gltf.scene.children)
        }
      },
      undefined,
      function (e) {
        console.error(e)
        reject(e)
      }
    )
  })
}

function initMaterial(mesh, name) {
  if (name.includes('cast')) {
    mesh.material.side = DoubleSide
    mesh.castShadow = true
  }
  if (name.includes('receive')) {
    mesh.receiveShadow = true
  }
}

export default async function loadAssets() {
  const meshPlayer = await loadObject('./glb/character.glb')
  const meshMob1 = await loadObject('./glb/mob1.glb')
  const meshMob2 = await loadObject('./glb/mob2.glb')
  const meshes = await loadObject('./glb/world.glb')

  const meshesGrass = []
  const meshesRubis = []
  const meshesHeart = []
  const meshesSolid = []
  const meshesBlock = []
  const meshesBox = []
  const meshesCollider = []
  const meshesArea = []
  const spawnsMobA = []
  const spawnsMobB = []
  let spawn = null

  for (const mesh of meshes) {
    const name = mesh.name
    initMaterial(mesh, mesh.name)
    if (name.includes('grass')) meshesGrass.push(mesh)
    else if (name.includes('plant')) meshesGrass.push(mesh)
    else if (name.includes('collider')) meshesCollider.push(mesh)
    else if (name.includes('rubis')) meshesRubis.push(mesh)
    else if (name.includes('heart')) meshesHeart.push(mesh)
    else if (name.includes('block')) meshesBlock.push(mesh)
    else if (name.includes('box')) meshesBox.push(mesh)
    else if (name.includes('spawn')) spawn = mesh
    else if (name.includes('mobA')) spawnsMobA.push(mesh)
    else if (name.includes('mobB')) spawnsMobB.push(mesh)
    else if (name.includes('area')) meshesArea.push(mesh)
    else meshesSolid.push(mesh)
  }
  return {
    meshesGrass,
    meshesRubis,
    meshesHeart,
    meshesSolid,
    meshesBlock,
    meshesBox,
    meshesCollider,
    meshesArea,
    meshPlayer,
    meshMob1,
    meshMob2,
    spawnsMobA,
    spawnsMobB,
    spawn
  }
}
