import useUniqueGLTF from "../../utils/utils";

export function LongApartmentBuilding() {
    const { scene } = useUniqueGLTF('/building1.gltf');
    return <primitive object={scene} position={[-12, 0, 12]} scale={1.8} castShadow />;
}
  
export function SmallApartmentComplex() {
    const { scene } = useUniqueGLTF('/apartment_complex.gltf');
    return <primitive object={scene}  position={[-26,0,15]} scale={1.2} />
}

export function OldBuilding() {
    const { scene } = useUniqueGLTF('/old_building.gltf');
    scene.rotation.set(0, Math.PI, 0);
    return <primitive object={scene} position={[-22, 0, 6]} scale={0.75} />;
}

export function LowPolyBuilding() {
    const { scene } = useUniqueGLTF('/building.gltf');
    scene.rotation.set(0, Math.PI, 0);
    return <primitive object={scene} position={[-31, 0, 6.5]} scale={0.7} castShadow />;
}

export default function BuildingGroup({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
    return (
        <group position={position} rotation={rotation}>
            <LongApartmentBuilding />
            <SmallApartmentComplex />
            <OldBuilding />
            <LowPolyBuilding />
      </group>
    );
}
