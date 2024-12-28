import useUniqueGLTF from "../../utils/utils";
import { useEffect, useRef } from "react";

export default function TwinTowerOffice({position=[29,0,-18]}) {
  const { scene } = useUniqueGLTF('/office_building.gltf');
  const ref = useRef();

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.layers.set(1);
      }
    });
  }, [scene]);
  return <primitive ref={ref} object={scene} position={position} rotation={[0, Math.PI / 8, 0]} scale={1.5} />;
}

