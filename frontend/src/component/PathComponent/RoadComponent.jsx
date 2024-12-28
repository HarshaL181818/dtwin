import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';

export function MainRoad({ position=[0, 0, 0], rotation=[0,0,0], args }) {
    const roadTexture = useLoader(THREE.TextureLoader, '/road_texture.jpg');
    
    roadTexture.wrapS = roadTexture.wrapT = THREE.RepeatWrapping;
    roadTexture.repeat.set(20, 1);

    
  return (
    <>
        <mesh position={position} rotation={rotation} receiveShadow>
            <planeGeometry args={args} />
            <meshStandardMaterial map={roadTexture} />
        </mesh> 
    </>
  );
}

export function SideRoad({ position=[0, 0, 0], rotation=[0,0,0], args }) {    
    const sideRoadTexture = useLoader(THREE.TextureLoader, 'road_texture.jpg');
    sideRoadTexture.wrapS = sideRoadTexture.wrapT = THREE.RepeatWrapping;
    sideRoadTexture.repeat.set(10,1);

    return(
        <>
            <mesh position={position} rotation={rotation} receiveShadow>
                <planeGeometry args={args} />
                <meshStandardMaterial map={sideRoadTexture} />
            </mesh>
        </>
    );
}

export default function RoadLayout() {
    return (
        <>
            <SideRoad position={[-40, -0.009, -34]} rotation={[-Math.PI / 2, 0, 0]} args={[70, 8]} />
            <SideRoad position={[40, -0.009, -3]} rotation={[-Math.PI / 2, 0, 0]} args={[70, 8]} />
            <SideRoad position={[-40, -0.009, -3]} rotation={[-Math.PI / 2, 0, 0]} args={[70, 8]} />
            <SideRoad position={[-40, -0.009, 29]} rotation={[-Math.PI / 2, 0, 0]} args={[70, 8]} />
            <MainRoad position={[0, -0.009, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]} args={[200, 10]} />
        </>
    )
}
