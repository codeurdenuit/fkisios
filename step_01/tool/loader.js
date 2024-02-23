import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const loaderGlb = new GLTFLoader()

export default async function loadAssets(path) {
  const glb = await loaderGlb.loadAsync(path)
  const visuals = []
  const colliders = []
  const players = []

  for (const mesh of glb.scene.children) {
    const name = mesh.name
    if (name.includes('visual')) {
      visuals.push(mesh)
    } else if (name.includes('collider')) {
      colliders.push(mesh)
    } else if (name.includes('player')) {
      players.push(mesh)
    }
  }

  return { visuals, colliders, players }
}
