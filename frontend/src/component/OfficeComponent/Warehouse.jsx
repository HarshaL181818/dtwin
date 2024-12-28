import useUniqueGLTF from "../../utils/utils";

export default function Model(){
    const { scene } = useUniqueGLTF('/warehouse.gltf');
    return <primitive object={scene} position={[30,0,30]} rotation={[0,0,0]} scale={3} />
}
