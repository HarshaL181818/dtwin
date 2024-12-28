import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const CarModelWithStop = ({ roadPath }) => {
  const carRef = useRef(null); // Reference to the car object
  const tRef = useRef(0); // Animation progress
  const pauseRef = useRef(false); // Flag to pause animation
  const animationIdRef = useRef(null); // To store the animation frame ID

  // Load the car model
  const carModel = useLoader(GLTFLoader, "/bus.gltf"); // Replace with your car model path

  useEffect(() => {
    const car = carRef.current;

    const animateCar = () => {
      if (!pauseRef.current) {
        // Increment progress
        tRef.current += 0.001; // Adjust speed

        // Stop animation at the end of the path
        if (tRef.current > 0.99) {
          tRef.current = 0; // Stop the animation
        }

        // Pause the car at the midpoint
        if (tRef.current > 0.4 && tRef.current < 0.41) {
          pauseRef.current = true;
          setTimeout(() => {
            pauseRef.current = false;
          }, 400); // Pause for 3 seconds
        }

        // Update car position and orientation
        const point = roadPath.getPointAt(tRef.current);
        const tangent = roadPath.getTangentAt(tRef.current);

        if (car) {
          car.position.copy(point); // Set position
          car.lookAt(point.clone().add(tangent)); // Orient car to follow the tangent
        }
      }

      // Request the next frame
      animationIdRef.current = requestAnimationFrame(animateCar);
    };

    // Start animation
    animateCar();

    // Cleanup on unmount
    return () => cancelAnimationFrame(animationIdRef.current);
  }, [roadPath]);

  return (
    <group ref={carRef}>
      <primitive object={carModel.scene} rotation={[0, -Math.PI / 2, 0]} scale={[1.6, 1.6, 1.6]} />
    </group>
  );
};

export default CarModelWithStop;

