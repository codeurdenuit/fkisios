import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
const loaderGlb = new GLTFLoader()

export default async function loadAssets(path) {
  const gltf = await loaderGlb.loadAsync(path)

  const visuals = []

  for (const mesh of gltf.scene.children) {
    const name = mesh.name
    if (name.includes('visual')) {
      visuals.push(mesh)
    }
  }

  return { visuals }
}