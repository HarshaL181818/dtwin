import * as THREE from 'three';
import { useLoader } from '@react-three/fiber';

function TilesTexture() {
  const tileTexture = useLoader(THREE.TextureLoader,'/rubber_tiles.jpg');

    tileTexture.wrapS = tileTexture.wrapT = THREE.RepeatWrapping;
    tileTexture.repeat.set(10,10);

  return (
      <>
      <planeGeometry args={[100, 25]}/>
      <meshStandardMaterial
        map={tileTexture}
      />
      </>
  );
}

function Tiles({position=[0,0,0], rotation=[0,0,0]}){
    return (
        <mesh position={position} rotation={rotation}>
            <TilesTexture />
        </mesh>
    );
}

export default function TilesLayout(){
    return(
        <>
            <Tiles position={[10,-0.15,-30]} rotation={[-Math.PI /2,0,Math.PI/2]}/>
            <Tiles position={[30,-0.15,-30]} rotation={[-Math.PI /2,0,Math.PI/2]}/>
        </>
    );
}
