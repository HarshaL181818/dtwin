import { clone } from 'three/examples/jsm/utils/SkeletonUtils';
import { useGLTF } from '@react-three/drei';

export default function useUniqueGLTF(path) {
    const { scene } = useGLTF(path);
    const clonedScene = clone(scene);
    return { scene: clonedScene };
}
