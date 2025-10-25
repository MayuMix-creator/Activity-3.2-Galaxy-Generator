import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Generate Galaxy
const parameters = {}
parameters.count = 1000
parameters.size = 0.02
parameters.radius = 5
parameters.branches = 3
parameters.spin = 1
parameters.randomness = 0.2
parameters.randomnessPower = 3
parameters.insideColorRGB = { r: 224, g: 97, b: 24 }
parameters.outsideColorRGB = { r: 231, g: 231, b: 231 }

let geometry = null
let material = null
let points = null

const generateGalaxy = () => {
    if (points !== null) {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    geometry = new THREE.BufferGeometry()
    const position = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)

    const colorInside = new THREE.Color(
        parameters.insideColorRGB.r / 255,
        parameters.insideColorRGB.g / 255,
        parameters.insideColorRGB.b / 255
    )
    const colorOutside = new THREE.Color(
        parameters.outsideColorRGB.r / 255,
        parameters.outsideColorRGB.g / 255,
        parameters.outsideColorRGB.b / 255
    )
    const mixedColor = new THREE.Color()

    for(let i = 0; i < parameters.count; i++){
        const i3 = i * 3
        const radius = Math.random() * parameters.radius
        const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2
        const spinAngle = radius * parameters.spin
        
        // Position calculation
        const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1: - 1) * parameters.randomness * radius
        const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1: - 1) * parameters.randomness * radius
        const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1: - 1) * parameters.randomness * radius

        position[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
        position[i3 + 1] = randomY
        position[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        // Color calculation 
        mixedColor.copy(colorInside)
        mixedColor.lerp(colorOutside, radius / parameters.radius)

        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    material = new THREE.PointsMaterial({
        size: parameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })
        
    points = new THREE.Points(geometry, material)
    scene.add(points)
}
generateGalaxy()

gui.add(parameters, 'count').min(0).max(10000).step(1).name('stars').onFinishChange(generateGalaxy)
gui.add(parameters, 'size').min(0).max(0.1).step(0.001).name('size').onFinishChange(generateGalaxy)
gui.add(parameters, 'radius').min(0).max(10).step(0.01).name('radius').onFinishChange(generateGalaxy)
gui.add(parameters, 'branches').min(2).max(20).step(1).name('branches').onFinishChange(generateGalaxy)
gui.add(parameters, 'spin').min(-5).max(5).step(0.001).name('spin').onFinishChange(generateGalaxy)
gui.add(parameters, 'randomness').min(0).max(2).step(0.001).name('randomness').onFinishChange(generateGalaxy)
gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).name('randomnessPower').onFinishChange(generateGalaxy)

//Inside Color GUI
const insideFolder = gui.addFolder('Inside Color (RGB 0-255)')
insideFolder.add(parameters.insideColorRGB, 'r').min(0).max(255).step(1).onFinishChange(generateGalaxy)
insideFolder.add(parameters.insideColorRGB, 'g').min(0).max(255).step(1).onFinishChange(generateGalaxy)
insideFolder.add(parameters.insideColorRGB, 'b').min(0).max(255).step(1).onFinishChange(generateGalaxy)

//Outside Color GUI
const outsideFolder = gui.addFolder('Outside Color (RGB 0-255)')
outsideFolder.add(parameters.outsideColorRGB, 'r').min(0).max(255).step(1).onFinishChange(generateGalaxy)
outsideFolder.add(parameters.outsideColorRGB, 'g').min(0).max(255).step(1).onFinishChange(generateGalaxy)
outsideFolder.add(parameters.outsideColorRGB, 'b').min(0).max(255).step(1).onFinishChange(generateGalaxy)

/**
 * Sizes and Setup... (omitted for brevity, assume correct)
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(3, 3, 3)
scene.add(camera)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    if (points) {
        points.rotation.y = elapsedTime * 0.1 
    }

    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()