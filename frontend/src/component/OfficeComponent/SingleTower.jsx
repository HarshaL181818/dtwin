import { PointLight, AmbientLight } from 'three';
import useUniqueGLTF from "../../utils/utils";
import * as THREE from 'three';

function OfficeBuilding() {
  const { scene } = useUniqueGLTF('/building2.gltf');
  return <primitive object={scene} position={[32, 0, 13]} scale={2} />;
}

function OfficeBuildingEntrance() {
  const { scene } = useUniqueGLTF('/building_entrance.gltf');
  scene.rotation.set(0, -Math.PI / 2, 0);
  return <primitive object={scene} position={[17.5, 0.5, 13]} scale={5} />;
}

export default function SingleTowerOffice({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  // Create a new group for lighting (Layer 1)
  const lightGroup = new THREE.Group();
  lightGroup.layers.set(1); // Set the layer to 1 for lighting
  
  // Add the lights to the lightGroup
  const ambientLight = new AmbientLight(0x404040, 1); // Ambient light for soft lighting
  const pointLight = new PointLight(0xffffff, 1, 100); // Point light to focus on the building
  pointLight.position.set(10, 20, -25); // Position the light in the scene
  lightGroup.add(ambientLight, pointLight);

  return (
    <>
      <group position={position} rotation={rotation}>
        <OfficeBuilding />
        <OfficeBuildingEntrance />
      </group>

      {/* This group contains the lighting */}
      <primitive object={lightGroup} />
    </>
  );
}

