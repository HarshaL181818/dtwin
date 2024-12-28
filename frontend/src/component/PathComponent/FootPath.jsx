import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';

function FootPath({ position=[0,0,0], rotation=[0,0,0], args }) {
    const pathTexture = useLoader(THREE.TextureLoader, '/pathTexture.jpg');

        pathTexture.wrapS = pathTexture.wrapT = THREE.RepeatWrapping;
        pathTexture.repeat.set(10,1);

        return (
            <>
                <mesh position={position} rotation={rotation}>
                    <planeGeometry args={args} />
                    <meshStandardMaterial map={pathTexture} />
                </mesh>
            </>
        );
}

export default function FootPathLayout() {
    return (
        <>
            <FootPath position={[-36,0,13]} rotation={[-Math.PI/2, 0,Math.PI/2]} args={[20,2]} />
            <FootPath position={[-22,0,34]} rotation={[-Math.PI /2,0, 0]} args={[30,2]}  />
            <FootPath position={[-22,0,24]} rotation={[-Math.PI /2,0, 0]} args={[30,2]}  />
            <FootPath position={[-36,0,2]} rotation={[-Math.PI /2,0, 0]} args={[58,2]} />
            <FootPath position={[27,0,2]} rotation={[-Math.PI/2, 0,0]} args={[40,2]} />
            <FootPath position={[6,0,26]} rotation={[-Math.PI/2, 0,Math.PI/2]} args={[50,2]} />
            <FootPath position={[-6,0,-18.5]} rotation={[-Math.PI/2, 0,Math.PI/2]} args={[23,2]} />
            <FootPath position={[-18,0,-39]} rotation={[-Math.PI/2, 0,0]} args={[23,2]} />
            <FootPath position={[-6,0,-49.5]} rotation={[-Math.PI/2, 0,Math.PI/2]} args={[23,2]} />
            <FootPath position={[6,0,-31]} rotation={[-Math.PI/2, 0,Math.PI/2]} args={[48,2]} />
            <FootPath position={[-32,0,-8]} rotation={[-Math.PI/2, 0,0]} args={[50,2]} />
            <FootPath position={[-32,0,-29]} rotation={[-Math.PI/2, 0,0]} args={[50,2]} />
            <FootPath position={[32,0,-8]} rotation={[-Math.PI/2, 0,0]} args={[50,2]} />
            <FootPath position={[-6,0,13]} rotation={[-Math.PI/2, 0,Math.PI/2]} args={[24,2]} />
            <FootPath position={[-6,0,45]} rotation={[-Math.PI/2, 0,Math.PI/2]} args={[24,2]} />
        </>
    );
}

