import * as THREE from 'three'
import ReactDOM from 'react-dom/client'

import { Environment, OrbitControls, FirstPersonControls, useCamera, useGLTF, MapControls, TrackballControls, ArcballControls, FlyControls, DeviceOrientationControls, PointerLockControls, CameraControls, FaceControls, Html } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import { createElement, useEffect, useRef } from 'react'
// import { Physics, usePlane } from '@react-three/cannon'
import { CuboidCollider, InstancedRigidBodies, Physics, RapierRigidBody, RigidBody, useRapier } from '@react-three/rapier'

export default function Experience()
{
    const arrowRef = useRef()
    const arrowMeshRef = useRef()
    const arrowOriginRef = useRef()
    const arrowGroupRef = useRef()
    const arrowStatus = useRef('idle')
    const arrowHelperRef = useRef()
    const bowRef = useRef()
    const raycasterRef = useRef()
    const powerValRef = useRef()
    const powerBarRef = useRef()

    const pointerLockRef = useRef()
    const { camera, scene } = useThree()
    // const rapier = useRapier()

    const arrow = useGLTF('/arrow.gltf')
    const bow = useGLTF('/bow.gltf')
    // const coin = useGLTF('/coin.gltf')
    const stand = useGLTF('/stand.gltf')
    // const target = useGLTF('/target.gltf')
	const time = Date.now() * 0.0005;

    const arrowAmplitude = 0.5
    const relativePosition = Math.PI * 0

    const { x, y, z, xt } = useControls('Position', {
        x: { min: -5, max: 10, value: 0, step: 0.001},
        y: { min: -5, max: 10, value: 2.8, step: 0.001},
        z: { min: -5, max: 10, value: 8.5, step: 0.001},
        xt: { min: -5, max: 10, value: 0, step: 0.001},
    })

    const { rx, ry, rz, rw } = useControls('Transform Rotation', {
        rx: { min: 0, max: Math.PI*2, value: Math.PI/2, step: 0.001},
        ry: { min: 0, max: Math.PI*2, value: 0, step: 0.001},
        rz: { min: 0, max: Math.PI*2, value: 0, step: 0.001},
        rw: { min: 0, max: Math.PI*2, value: 0, step: 0.001},
    })

    const { gr, gh, gs } = useControls('Ground', {
        gr: { min: -50, max: 50, value: 43, step: 0.1},
        gh: { min: -50, max: 50, value: 6, step: 0.1},
        gs: { min: -50, max: 50, value: 30, step: 0.1},

    })

    useEffect(() => {
        window.addEventListener('keypress', (e) => {
            if (e.code === 'Space') {
                powerBarRef.current.style.display = 'block'
                if (!powerValRef.current.value) powerValRef.current.value = 0
                const newPower = Math.min(100, Number(powerValRef.current.value) + 8)
                powerValRef.current.value = newPower
                // powerValRef.current.textContent = `${Math.min(100, newPower.toFixed(2))}%`
                powerValRef.current.style.width = `${newPower}%`
                powerValRef.current.style.backgroundColor =
                    newPower <= 30 ?
                        '#00ff00':
                        newPower > 30 && newPower < 60 ?
                        `#0000ff`: `#ff0000`
            }
        })

        window.addEventListener('keyup', (e) => {
            // console.log(e.code)
            if (e.code === 'Space') {
                arrowStatus.current = 'shoot'
                // powerValRef.current.textContent = `0%`
                powerValRef.current.style.width = `0%`
                powerValRef.current.style.backgroundColor = `#0000ff`
                powerBarRef.current.style.display = 'none'

                const cameraDirection = camera.getWorldDirection(new THREE.Vector3())
                // const ArrayMesh = arrow.scene.clone(true)
                // ArrayMesh.position.set(Math.random()*3, Math.random()*3, Math.random()*3)
                arrowRef.current.setEnabledTranslations(true, true, true, true)
                arrowRef.current.setEnabledRotations(true, true, true, true)
                const power = 0.015 * powerValRef.current.value / 100
                const powerVector = {
                    x: -power * -cameraDirection.x,
                    y: power * cameraDirection.y + 0.00025,
                    z: power * cameraDirection.z,
                }
                arrowRef.current.applyImpulse(powerVector)
                powerValRef.current.value = 0
            }
            
            if (e.code === 'KeyR') {
                arrowStatus.current = 'idle'
                arrowRef.current.setLinvel({ x: 0, y: 0, z: 0})
                arrowRef.current.setAngvel({ x: 0, y: 0, z: 0})
                arrowRef.current.setTranslation({
                    x: 0, y: 1.61, z: 8.19
                })
                // some magic number
                arrowRef.current.setRotation({x: 0.9940289855003357, y: 0, z: 0, w: 0.10911677777767181})
                arrowRef.current.setEnabledTranslations(false, false, false, false)
                arrowRef.current.setEnabledRotations(false, false, false, false)
            }
        })
    }, [])


    useFrame((state) => {
        // console.log(state.camera.getWorldDirection(new THREE.Vector3()))
        if (raycasterRef.current) {
            raycasterRef.current.set(state.camera.getWorldPosition(new THREE.Vector3()), state.camera.getWorldDirection(new THREE.Vector3()));
            arrowHelperRef.current.setDirection(raycasterRef.current.ray.direction)
        }
        if (arrowOriginRef.current)
            arrowOriginRef.current.rotation.copy(state.camera.rotation)

        if (
            arrowRef.current &&
            arrowStatus.current === 'idle'
        ) {
            // move the arrow alongside the bow but using translation and rotation instead of mesh position
            const newPos = bowRef.current.getWorldPosition(new THREE.Vector3())
            newPos.y += 0.05
            const newRotQuaternion = bowRef.current.getWorldQuaternion(new THREE.Quaternion())
            arrowRef.current.setEnabledTranslations(true, true, true, true)
            arrowRef.current.setTranslation(newPos)
            arrowRef.current.setEnabledTranslations(false, false, false, false)
            arrowRef.current.setRotation({
                x: newRotQuaternion.x,
                y: newRotQuaternion.y,
                z: newRotQuaternion.z,
                w: newRotQuaternion.w
            })
        }
    })

    return <>
        <Environment background preset='forest' ground={{ radius: gr, height: gh, scale: gs }}/>
        <ambientLight intensity={0.1}/>
        {/* <OrbitControls ref={pointerLockRef} makeDefault/> */}
        <PointerLockControls ref={pointerLockRef} makeDefault maxAzimuthAngle={-0.1}/>
        {/* <FirstPersonControls lookSpeed={0.5} makeDefault /> */}
        {/* <CameraControls makeDefault /> */}
        <raycaster
            ref={raycasterRef}
            args={[
                camera.getWorldPosition(new THREE.Vector3()),
                camera.getWorldDirection(new THREE.Vector3()),
            ]}
        />
        <arrowHelper
            ref={arrowHelperRef}
            args={[
                camera.getWorldDirection(new THREE.Vector3()),
                camera.getWorldPosition(new THREE.Vector3()),
                2,
                0xff0000,
                0.25,
                0.02
        ]}/>
        <Physics debug={window.location.hash}>
            {/* <RigidBody
                type="fixed"
                restitution={0.2}
                friction={0.7}
            >
                <mesh 
                    position={[0, -0.25, 0]}
                    rotation={[0, 0, 0]}
                    scale={[24, 0.5, 24]}
                > 
                    <boxGeometry />
                    <meshPhongMaterial color="brown" />
                </mesh>
            </RigidBody> */}
            <group
                ref={arrowOriginRef}
                position={camera.position.clone()}
                rotation={camera.rotation.clone()}
            >
                <group
                    ref={arrowGroupRef}
                    position={[0, -0.1, -0.4]}
                >
                    <primitive
                        ref={bowRef}
                        object={bow.scene}
                        rotation-y={Math.PI}
                        position={[0, -0.15, -0.35]}
                        scale={[0.5, 0.5, 0.5]}
                    />
                    <Html position={[0.03, 0.03, 0]}>
                        <div ref={powerBarRef} className="power-bar">
                            <div ref={powerValRef} className="power"></div>
                        </div>
                    </Html>
                </group>
            </group>
            <RigidBody
                ref={arrowRef}
                rotation-x={Math.PI}
                position={[0, -0.1, -0.45]}
                lockTranslations={true}
                lockRotations={false}
            >
                <primitive
                    ref={arrowMeshRef}
                    rotation-x={-Math.PI/2}
                    // position={[0, -0.1, -0.4]}
                    scale={[0.1, 0.4, 0.1]}
                    object={arrow.scene}
                />
            </RigidBody>

            <RigidBody
                type="fixed"
                position={[-4, 0, -4]}
                restitution={0}
                friction={1}
                colliders="trimesh"
            >
                <primitive object={stand.scene}/>
            </RigidBody>


            <RigidBody
                type="fixed"
                position={[0, 0, -4]}
                restitution={0}
                friction={1}
                colliders="trimesh"
            >
                <primitive object={stand.scene.clone(true)}/>
            </RigidBody>


            <RigidBody
                type="fixed"
                position={[4, 0, -4]}
                restitution={0}
                friction={1}
                colliders="trimesh"
            >
                <primitive object={stand.scene.clone(true)}/>
            </RigidBody>
        </Physics>
    </>
}
