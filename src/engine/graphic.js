import { WebGLRenderer, Clock, TextureLoader } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
//import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js'
import { Mesh, AnimationMixer, AnimationClip, LoopOnce } from 'three'
import overwrite from '../tool/overwrite'
import { getCanvas } from '../tool/function'
overwrite(Mesh, AnimationMixer, AnimationClip, LoopOnce)

export default class Graphic extends WebGLRenderer {
  scene = null
  clock = null
  cbUpdate = null
  camera = null
  cbLoop = null
  killed = false

  constructor(scene, camera, fx) {
    const canvas = getCanvas()
    super({ canvas, antialias: true })
    this.shadowMap.enabled = true
    this.autoClear = false
    this.clock = new Clock()
    this.scene = scene
    this.camera = camera
    this.scene.background = new TextureLoader().load('./image/sky.jpg')
    this.fx = fx
    this.cbLoop = this.loop.bind(this)
    window.addEventListener('resize', this.resize.bind(this), false)

    this.composer = new EffectComposer(this)
    const renderPass = new RenderPass(scene, camera)

    this.composer.addPass(renderPass)

    const gtaoPass = new GTAOPass(
      scene,
      camera,
      window.innerWidth,
      window.innerHeight
    )
    gtaoPass.output = GTAOPass.OUTPUT.Default
    this.composer.addPass(gtaoPass)
    gtaoPass.blendIntensity = 0.8
    const aoParameters = {
      radius: 0.4,
      distanceExponent: 1.43,
      thickness: 0.23,
      scale: 0.9,
      samples: 10,
      distanceFallOff: 0.9,
      screenSpaceRadius: true
    }
    const pdParameters = {
      lumaPhi: 10,
      depthPhi: 2,
      normalPhi: 3,
      radius: 4,
      radiusExponent: 1,
      rings: 2,
      samples: 8
    }

    gtaoPass.updateGtaoMaterial(aoParameters)
    gtaoPass.updatePdMaterial(pdParameters)

    /*const gui = new GUI();

    gui.add( gtaoPass, 'output', {
      'Default': GTAOPass.OUTPUT.Default,
      'Diffuse': GTAOPass.OUTPUT.Diffuse,
      'AO Only': GTAOPass.OUTPUT.AO,
      'AO Only + Denoise': GTAOPass.OUTPUT.Denoise,
      'Depth': GTAOPass.OUTPUT.Depth,
      'Normal': GTAOPass.OUTPUT.Normal
    } ).onChange( function ( value ) {
      gtaoPass.output = value;
    } );
    gui.add( gtaoPass, 'blendIntensity' ).min( 0 ).max( 1 ).step( 0.01 );
    gui.add( aoParameters, 'radius' ).min( 0.01 ).max( 1 ).step( 0.01 ).onChange( () => gtaoPass.updateGtaoMaterial( aoParameters ) );
    gui.add( aoParameters, 'distanceExponent' ).min( 1 ).max( 4 ).step( 0.01 ).onChange( () => gtaoPass.updateGtaoMaterial( aoParameters ) );
    gui.add( aoParameters, 'thickness' ).min( 0.01 ).max( 10 ).step( 0.01 ).onChange( () => gtaoPass.updateGtaoMaterial( aoParameters ) );
    gui.add( aoParameters, 'distanceFallOff' ).min( 0 ).max( 1 ).step( 0.01 ).onChange( () => gtaoPass.updateGtaoMaterial( aoParameters ) );
    gui.add( aoParameters, 'scale' ).min( 0.01 ).max( 2.0 ).step( 0.01 ).onChange( () => gtaoPass.updateGtaoMaterial( aoParameters ) );
    gui.add( aoParameters, 'samples' ).min( 2 ).max( 32 ).step( 1 ).onChange( () => gtaoPass.updateGtaoMaterial( aoParameters ) );
    gui.add( aoParameters, 'screenSpaceRadius' ).onChange( () => gtaoPass.updateGtaoMaterial( aoParameters ) );
    gui.add( pdParameters, 'lumaPhi' ).min( 0 ).max( 20 ).step( 0.01 ).onChange( () => gtaoPass.updatePdMaterial( pdParameters ) );
    gui.add( pdParameters, 'depthPhi' ).min( 0.01 ).max( 20 ).step( 0.01 ).onChange( () => gtaoPass.updatePdMaterial( pdParameters ) );
    gui.add( pdParameters, 'normalPhi' ).min( 0.01 ).max( 20 ).step( 0.01 ).onChange( () => gtaoPass.updatePdMaterial( pdParameters ) );
    gui.add( pdParameters, 'radius' ).min( 0 ).max( 32 ).step( 1 ).onChange( () => gtaoPass.updatePdMaterial( pdParameters ) );
    gui.add( pdParameters, 'radiusExponent' ).min( 0.1 ).max( 4. ).step( 0.1 ).onChange( () => gtaoPass.updatePdMaterial( pdParameters ) );
    gui.add( pdParameters, 'rings' ).min( 1 ).max( 16 ).step( 0.125 ).onChange( () => gtaoPass.updatePdMaterial( pdParameters ) );
    gui.add( pdParameters, 'samples' ).min( 2 ).max( 32 ).step( 1 ).onChange( () => gtaoPass.updatePdMaterial( pdParameters ) );
    */

    this.bokehPass = new BokehPass(scene, camera, {
      focus: camera.distance,
      aperture: 0.001,
      maxblur: 0.01,
      width: window.innerWidth,
      height: window.innerHeight,
      renderToScreen: true
    })

    this.composer.addPass(this.bokehPass)

    const gammaCorrection = new ShaderPass(GammaCorrectionShader)
    this.composer.addPass(gammaCorrection)
  }

  loop() {
    if (this.killed) return
    const dt = this.clock.getDelta()
    this.cbUpdate(dt)
    this.bokehPass.uniforms.focus.value = this.camera.distance + 1
    this.composer.render()
    //this.render(this.scene, this.camera)
    this.clearDepth()
    if (this.fx) this.render(this.fx, this.camera)
    requestAnimationFrame(this.cbLoop)
  }

  start() {
    this.loop()
  }

  stop() {
    cancelAnimationFrame(this.reqId)
    this.killed = true
    this.clear()
    this.dispose()
  }

  onUpdate(callback) {
    this.cbUpdate = callback
  }

  resize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.setSize(window.innerWidth, window.innerHeight)
  }
}
