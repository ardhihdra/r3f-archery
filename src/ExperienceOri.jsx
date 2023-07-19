import * as THREE from 'three'
import { Environment, OrbitControls, FirstPersonControls, useCamera, useGLTF, MapControls, TrackballControls, ArcballControls, FlyControls, DeviceOrientationControls, PointerLockControls, CameraControls, FaceControls } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useControls } from 'leva'
import { useRef } from 'react'

export default function Experience()
{
    const arrowRef = useRef()
    const arrowOriginRef = useRef()
    const arrowGroupRef = useRef()
    const arrowHelperRef = useRef()
    const raycasterRef = useRef()
    const cameraPositionRef = useRef(new THREE.Vector3())
    const pointerLockRef = useRef()
    const { camera } = useThree()

    const arrow = useGLTF('/arrow.gltf')
    const bow = useGLTF('/bow.gltf')
    const coin = useGLTF('/coin.gltf')
    const stand = useGLTF('/stand.gltf')
    const target = useGLTF('/target.gltf')
	const time = Date.now() * 0.0005;


    const arrowAmplitude = 0.5
    const relativePosition = Math.PI * 0


    const { x, y, z, xt } = useControls('Position', {
        // x: { min: -5, max: 5, value: -3.1, step: 0.001},
        // y: { min: -5, max: 5, value: 1.42, step: 0.001},
        // z: { min: -5, max: 5, value: 3.9, step: 0.001},
        x: { min: -5, max: 10, value: 0, step: 0.001},
        y: { min: -5, max: 10, value: 2.8, step: 0.001},
        z: { min: -5, max: 10, value: 8.5, step: 0.001},
        xt: { min: -5, max: 10, value: 0, step: 0.001},
    })

    const { rx, ry, rz } = useControls('Transform Rotation', {
        rx: { min: 0, max: Math.PI*2, value: Math.PI/2, step: 0.001},
        ry: { min: 0, max: Math.PI*2, value: 0, step: 0.001},
        rz: { min: 0, max: Math.PI*2, value: 0, step: 0.001},
    })


    useFrame((state) => {
        const worldDirection = state.camera.getWorldDirection(new THREE.Vector3())
        const worldPosition = state.camera.getWorldPosition(new THREE.Vector3())
        if (
            pointerLockRef.current &&
            // state.camera.rotation.x !== cameraPositionRef.current.x &&
            state.camera.rotation.y !== cameraPositionRef.current
            // state.camera.rotation.z !== cameraPositionRef.current.z 
        ) {
            // cameraPositionRef.current = state.camera.rotation.clone()
            const sign = state.camera.rotation.y > cameraPositionRef.current ? 1.4: -1.2
            // 2.4 - 3.8
            // arrowGroupRef.current.position.setY(
            //     (state.camera.position.y - 0.1) + worldDirection.y * 0.1
            // )
            cameraPositionRef.current = state.camera.rotation.y
        }
        if (raycasterRef.current) {
            raycasterRef.current.set(state.camera.getWorldPosition(new THREE.Vector3()), state.camera.getWorldDirection(new THREE.Vector3()));
            arrowHelperRef.current.setDirection(raycasterRef.current.ray.direction)
        }
        if (arrowGroupRef.current) {
            // arrowGroupRef.current.position.lerp(new THREE.Vector3(
            //     state.camera.position.x - Math.sin((state.camera.rotation.y + relativePosition)) * arrowAmplitude,
            //     arrowGroupRef.current.position.y,
            //     // state.camera.position.y - 0.2 + Math.sin(state.camera.position.x + state.camera.position.z)*0.01,
            //     state.camera.position.z - Math.cos((state.camera.rotation.y + relativePosition)) * arrowAmplitude + Math.abs(worldDirection.y * 0.5)
            // ), 0.1)
            const horVec1 = new THREE.Vector2(worldDirection.x, arrowGroupRef.current.position.z)
            const horVec2 = new THREE.Vector2(worldDirection.x, worldDirection.z)
            // arrowGroupRef.current.rotation.set(
            //     (worldDirection.y + 1.1) * Math.PI/2,
            //     arrowGroupRef.current.rotation.y,
            //     -Math.PI + (state.camera.rotation.y * 0.07) + horVec1.angleTo(horVec2) * (state.camera.rotation.y > 0 ? 1: -1)
            // )
        }
    })

    return <>

        <Environment background preset='forest'/>
        {/* <ambientLight intensity={0.5}/> */}
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
                0x000000,
                0.5,
                0.02
        ]}/>
        <mesh rotation={[-Math.PI/2, 0, 0]} scale={20}> 
            <planeGeometry />
            {/* <meshPhongMaterial color="brown" /> */}
        </mesh>
        <group
            ref={arrowOriginRef}
            position={camera.position.clone()}
            rotation={camera.rotation.clone()}
        >
            <group
                ref={arrowGroupRef}
                rotation={[-Math.PI/2, 0, 0]}
            >
            </group>
            <primitive
                ref={arrowRef}
                object={arrow.scene}
                scale={[0.25, 0.4, 0.25]}
            />
            <primitive
                object={bow.scene}
                // rotation-x={Math.PI/2}
                position={[0, -1, 0.05]}
                scale={[0.5, 0.5, 0.5]}
            />
        </group>
        {/* <primitive object={stand.scene} position={[0, 0, -10]}/> */}

    </>
}