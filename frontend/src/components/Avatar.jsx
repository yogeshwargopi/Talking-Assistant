import React, { useRef, useEffect, forwardRef } from "react";
import { useGLTF } from "@react-three/drei";

const Avatar = forwardRef((props, ref) => {
    const { scene } = useGLTF("../../assets/models/human1.glb");
    const meshRef = useRef();

    // Forward the ref to access the mesh
    useEffect(() => {
        if (ref) {
            ref.current = meshRef.current;
        }
    }, [ref]);

    useEffect(() => {
      if (!meshRef.current) return;
  
      meshRef.current.traverse(child => {
        if (child.isBone) {
          // Adjust right shoulder and arm chain
          if (child.name === "RightArm") {
            child.rotation.x = 1.2;  // Rotate forward
            child.rotation.z = 0;  // Slight inward
            // child.rotation.x = 1.3;  // Rotate forward
            // child.rotation.z = 0;  // Slight inward
          }
          else if (child.name === "LeftArm") {
            child.rotation.x = 1.15;  // Rotate forward
            child.rotation.z = 0;  // Slight inward
            // child.rotation.x = 1.3;  // Rotate forward
            // child.rotation.z = 0; 
          }
          else if (child.name === "RightForeArm") {
            child.rotation.x = .4;  // Bend elbow
            child.rotation.z = -0;  // Angle towards leg
            // child.rotation.x = .1;  // Bend elbow
            // child.rotation.z = -0;  // Angle towards leg
          }
          else if (child.name === "LeftForeArm") {
            child.rotation.x = .4;  // Bend elbow
            child.rotation.z = -0;  // Angle towards leg
            // child.rotation.x = .1;  // Bend elbow
            // child.rotation.z = -0; 
          }
          else if (child.name === "RightHand") {
            child.rotation.x = 0;  // Tilt hand
            child.rotation.y = 0;  // Slight natural rotation
            child.rotation.z = -0;  // Angle inward
          }
          
          // Adjust fingers for a relaxed pose
          if (child.name.startsWith("RightHand") && 
             (child.name.includes("Index1") || 
              child.name.includes("Middle1") ||
              child.name.includes("Ring1") ||
              child.name.includes("Pinky1"))) {
            child.rotation.x = 0;  // Slight curl in fingers
          }
        }
      });
    }, []);

    return <primitive object={scene} ref={meshRef} position={[0, 0, 0]} scale={1} />;
});

Avatar.displayName = 'Avatar';

export default Avatar;