import './style.css'
import ReactDOM from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import Experience from './Experience.jsx'
import Overlay from './Overlay'

const root = ReactDOM.createRoot(document.querySelector('#root'))

root.render(
    <>
        <Canvas
            camera={ {
                fov: 45,
                near: 0.1,
                far: 2000,
                position: [ 0, 2, 9 ],
                // lookAt: [ 0, 0, 1 ]
                // position: [ -3, 1.5, 4 ]
            } }
        >
            <Experience />
        </Canvas>
        <Overlay />
    </>
)