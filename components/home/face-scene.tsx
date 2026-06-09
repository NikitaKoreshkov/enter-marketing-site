"use client";

import { useRef, Suspense, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

interface FaceModelProps {
  mouseRef: React.RefObject<{ x: number; y: number }>;
}

function FaceModel({ mouseRef }: FaceModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const elapsedRef = useRef(0);
  const { scene } = useGLTF("/face.glb");

  useEffect(() => {
    scene.traverse((child) => {
      const mesh = child as THREE.Mesh;
      if (!mesh.isMesh) return;

      const applyMaterial = (mat: THREE.Material) => {
        if (
          mat instanceof THREE.MeshStandardMaterial ||
          mat instanceof THREE.MeshPhysicalMaterial
        ) {
          mat.roughness = 0.32;
          mat.metalness = 0.04;
          if ("envMapIntensity" in mat) {
            (mat as THREE.MeshStandardMaterial).envMapIntensity = 1.2;
          }
          mat.needsUpdate = true;
        }
      };

      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(applyMaterial);
      } else {
        applyMaterial(mesh.material);
      }
      mesh.castShadow = true;
      mesh.receiveShadow = false;
    });
  }, [scene]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    elapsedRef.current += delta;
    const t = elapsedRef.current;
    const mx = mouseRef.current?.x ?? 0;
    const my = mouseRef.current?.y ?? 0;

    const targetY = mx * 0.55 + Math.sin(t * 0.18) * 0.15;
    const targetX = -my * 0.2 + Math.cos(t * 0.12) * 0.05;

    groupRef.current.rotation.y +=
      (targetY - groupRef.current.rotation.y) * 0.045;
    groupRef.current.rotation.x +=
      (targetX - groupRef.current.rotation.x) * 0.045;
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={1.28} position={[0, -0.18, 0]} />
    </group>
  );
}

interface FaceSceneProps {
  mouseRef: React.RefObject<{ x: number; y: number }>;
}

export function FaceScene({ mouseRef }: FaceSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.42, 4.15], fov: 48 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 2]}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.22} />

        <pointLight
          position={[2.8, 3.5, 2.5]}
          color="#ffffff"
          intensity={6.2}
          distance={11}
          decay={2}
        />

        <pointLight
          position={[0, 1.2, 3.2]}
          color="#ffffff"
          intensity={1.4}
          distance={8}
          decay={2}
        />

        <pointLight
          position={[-3.2, 0.5, 1.5]}
          color="#f5f5f5"
          intensity={0.85}
          distance={8}
          decay={2}
        />

        <pointLight
          position={[0, 3.2, -2.8]}
          color="#ffffff"
          intensity={1.5}
          distance={9}
          decay={2}
        />

        <FaceModel mouseRef={mouseRef} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload("/face.glb");
