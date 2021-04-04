import './style.css'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as dat from 'dat.gui'
import * as TWEEN from '@tweenjs/tween.js'

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

const loader = new GLTFLoader()

function modelLoader(url){
    return new Promise((resolve, reject) => {
        loader.load(url, data => resolve(data), null, reject)
    })
}

async function init(){
    const gltfData = await modelLoader('model/scene.gltf'),

    model = gltfData.scene

    model.traverse( child => {
        if(child.material) child.material.metalness = 0.9
    })
    
    const box = new THREE.Box3().setFromObject(model)
    const center = box.getCenter( new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())

    const maxAxis = Math.max(size.x, size.y, size.z)
    model.scale.multiplyScalar(1.0 / maxAxis)

    box.setFromObject(model)
    box.getCenter(center)
    box.getSize(size)

    model.position.copy(center).multiplyScalar(-1)
    model.position.y -= (size.y * 0.5)

    const pivot = new THREE.Group()
    
    scene.add(pivot)
    pivot.add(model)

    const clock = new THREE.Clock()

    const tick = () => {

        const elapsedTime = clock.getElapsedTime()

        model.rotation.y = .2 * elapsedTime

        TWEEN.update()

        renderer.render(scene, camera)

        window.requestAnimationFrame(tick)
    }

    tick()

    let btn1Active = false

    document.getElementById('btn1').addEventListener('click', e => {
        if(btn1Active === false){            
            new TWEEN.Tween(camera.position)
                .to({x: -0.1,y: -.85,z:  0.45}, 1500)
                .start()
            new TWEEN.Tween(hemiLight)
                .to({intensity: 8}, 2500)
                .start()
            console.log(hemiLight.intensity)
            btn1Active = true
        } else {
            new TWEEN.Tween(camera.position)
                .to({x: 0,y: -.55,z:  1.2}, 800)
                .start()
            new TWEEN.Tween(hemiLight)
                .to({intensity: 5}, 1500)
                .start()
            console.log(hemiLight.intensity)
            camera.position.set(0, -0.55, 1.2)
            btn1Active = false
        }
    })
}

init().catch(error => {
    console.log(error)
})

// Lights

const pointLight = new THREE.PointLight(0xffffff, 2)
pointLight.position.set(-18, 18, -10)
scene.add(pointLight)

const pointLightHelper = new THREE.PointLightHelper(pointLight, 1)
scene.add(pointLightHelper)

const lightGui = gui.addFolder('light')
lightGui.add(pointLight.position, 'x').min(-20).max(20).step(.01)
lightGui.add(pointLight.position, 'y').min(-20).max(20).step(.01)
lightGui.add(pointLight.position, 'z').min(-20).max(20).step(.01)
lightGui.add(pointLight, 'intensity').min(0).max(10).step(.01)

///////////////////////////////////////////

const directionalLight = new THREE.DirectionalLight( 0xffffff, 2 );
directionalLight.position.set(20, -16, 3)
scene.add( directionalLight )

const directionalLightGui = gui.addFolder('directional light')
directionalLightGui.add(directionalLight.position, 'x').min(-20).max(20).step(.01)
directionalLightGui.add(directionalLight.position, 'y').min(-20).max(20).step(.01)
directionalLightGui.add(directionalLight.position, 'z').min(-20).max(20).step(.01)
directionalLightGui.add(directionalLight, 'intensity').min(0).max(20).step(.01)

///////////////////////////////////////////

const hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 5 );
hemiLight.position.set( 0, 20, 0 );
scene.add( hemiLight );

const hemiGui = gui.addFolder('hemi')

hemiGui.add(hemiLight, 'intensity').min(0).max(20).step(.01)

///////////////////////////////////////////

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

///////////////////////////////////////////

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, -0.55, 1.2)
scene.add(camera)

const cameraGui = gui.addFolder('camera')
cameraGui.add(camera.position, 'x').min(-10).max(10)
cameraGui.add(camera.position, 'y').min(-10).max(10)
cameraGui.add(camera.position, 'z').min(-10).max(10)
cameraGui.add(camera.rotation, 'y').step(.001)

///////////////////////////////////////////

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))