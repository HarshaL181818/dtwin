import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const MultiModelAnimation = ({ modelsWithPaths }) => {
  const animationRefs = useRef(
    modelsWithPaths.map(() => ({
      t: 0, // Animation progress
      pause: false, // Pause flag
      pauseStartTime: null, // When the pause started
      totalPausedTime: 0, // Total time paused
    }))
  ); // Animation state for each model

  const animationIdRef = useRef(null);

  useEffect(() => {
    const startTime = performance.now();

    const animateModels = () => {
      const currentTime = performance.now();

      modelsWithPaths.forEach((modelData, index) => {
        const { roadPath, ref } = modelData;
        const animation = animationRefs.current[index];

        // If paused, track the paused time
        if (animation.pause) {
          if (!animation.pauseStartTime) {
            animation.pauseStartTime = currentTime;
          }
          return;
        } else if (animation.pauseStartTime) {
          // Accumulate the total paused time when resuming
          animation.totalPausedTime += currentTime - animation.pauseStartTime;
          animation.pauseStartTime = null;
        }

        // Compute the effective animation time
        const elapsedTime = currentTime - startTime - animation.totalPausedTime;

        // Update progress based on consistent speed
        const speedFactor = 0.1;
        animation.t = (elapsedTime * 0.001 * speedFactor) % 1; // Speed factor (0.001)

        // Pause condition (for specific models)
        if (modelData.shouldPause && animation.t > 0.4 && animation.t < 0.41) {
          animation.pause = true;
          setTimeout(() => {
            animation.pause = false;
          }, modelData.pauseDuration || 500); // Pause for specified duration
        }

        // Update position and orientation
        const point = roadPath.getPointAt(animation.t);
        const tangent = roadPath.getTangentAt(animation.t);
        const model = ref.current;

        if (model) {
          model.position.copy(point);
          model.lookAt(point.clone().add(tangent));
        }
      });

      // Request the next frame
      animationIdRef.current = requestAnimationFrame(animateModels);
    };

    // Start animation
    animateModels();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationIdRef.current);
    };
  }, [modelsWithPaths]);

  return (
    <>
      {modelsWithPaths.map((modelData, index) => (
        <group ref={modelData.ref} key={index}>
          <primitive object={modelData.scene} scale={modelData.scale || [1, 1, 1]} rotation={modelData.rotation || [0,0,0]} />
        </group>
      ))}
    </>
  );
};

export default MultiModelAnimation;

