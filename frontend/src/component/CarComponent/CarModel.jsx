import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const CarModel = ({ roadPath }) => {
  const carRef = useRef(null); // Reference to the car object
  const tRef = useRef(0); // Animation progress

  const carModel = useLoader(GLTFLoader, "/pink_car.gltf"); // Replace with your car model path

  useEffect(() => {
    const car = carRef.current;

    const animateCar = () => {
      tRef.current += 0.001; 
      if (tRef.current > 1) tRef.current = 0; // Loop back

      const point = roadPath.getPointAt(tRef.current);
      const tangent = roadPath.getTangentAt(tRef.current);

      if (car) {
        car.position.copy(point); // Set position
        car.lookAt(point.clone().add(tangent)); // Orient car to follow the tangent
      }

      requestAnimationFrame(animateCar);
    };

    animateCar();

    return () => cancelAnimationFrame(animateCar);
  }, [roadPath]);

  return (
    <group ref={carRef}>
      <primitive object={carModel.scene} scale={[2, 2, 2]} />
    </group>
  );
};

export default CarModel;

