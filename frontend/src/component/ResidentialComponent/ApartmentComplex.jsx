import useUniqueGLTF from "../../utils/utils";

export default function ApartmentBuilding({ position=[-31,0,22], rotation=[ 0,0,0 ]}) {
    const { scene } = useUniqueGLTF('/apartment_building.gltf');
    return (
        <primitive object={scene} position={position} rotation={rotation} scale={7.5} />
    );
}
