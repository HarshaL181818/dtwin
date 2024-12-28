import useUniqueGLTF from "../../utils/utils";

export default function ModernOffice({ position=[0,0,0] }) {
    const { scene } = useUniqueGLTF('/modern_office.gltf');
    return (
        <primitive object={scene} position={position} scale={2.5}/>
    );
}
