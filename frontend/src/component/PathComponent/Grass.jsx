import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';

function GrassTexture() {
  const grassTexture = useLoader(THREE.TextureLoader,'/textures/grass/textures/sparse_grass_diff_4k.jpg');

    grassTexture.wrapS = grassTexture.wrapT = THREE.RepeatWrapping;
    grassTexture.repeat.set(10,10);

  return (
      <>
      <planeGeometry args={[100, 25]}/>
      <meshStandardMaterial
        map={grassTexture}
      />
      </>
  );
}

export default function GrassPlane() {
    return (
    <>
        <mesh position={[-56,-0.2,10]} rotation={[-Math.PI/2,0,0]}>
            <GrassTexture />
        </mesh>

        <mesh position={[-56,-0.2,-17]} rotation={[-Math.PI/2,0,0]}>
            <GrassTexture />
        </mesh>

        <mesh position={[-56,-0.2,-35]} rotation={[-Math.PI/2,0,0]}>
            <GrassTexture />
        </mesh>

        <mesh position={[-56,-0.2,35]} rotation={[-Math.PI/2,0,0]}>
            <GrassTexture />
        </mesh>
    </>
    );
}

