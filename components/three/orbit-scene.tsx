"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Stars } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";

function Planet() {
  const group = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const ringC = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();
    if (group.current) group.current.rotation.y = elapsed * 0.18;
    if (ringA.current) ringA.current.rotation.z = elapsed * 0.25;
    if (ringB.current) ringB.current.rotation.z = elapsed * -0.2;
    if (ringC.current) ringC.current.rotation.z = elapsed * 0.16;
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1.15, 64, 64]} />
        <meshStandardMaterial
          color="#1c4f8a"
          emissive="#0d2d53"
          emissiveIntensity={0.35}
          metalness={0.15}
          roughness={0.45}
        />
      </mesh>

      <mesh ref={ringA}>
        <torusGeometry args={[1.85, 0.03, 16, 160]} />
        <meshStandardMaterial color="#e2a63a" emissive="#e2a63a" emissiveIntensity={1.2} />
      </mesh>
      <mesh ref={ringB}>
        <torusGeometry args={[1.55, 0.025, 16, 160]} />
        <meshStandardMaterial color="#f0c76b" emissive="#f0c76b" emissiveIntensity={0.95} />
      </mesh>
      <mesh ref={ringC}>
        <torusGeometry args={[1.95, 0.02, 16, 160]} />
        <meshStandardMaterial color="#c88a14" emissive="#c88a14" emissiveIntensity={0.8} />
      </mesh>

      <Float speed={1.8} rotationIntensity={0.35} floatIntensity={0.55}>
        <mesh position={[2.1, 0.45, 0.25]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial color="#f0c76b" emissive="#f0c76b" emissiveIntensity={1.6} />
        </mesh>
      </Float>

      <Float speed={1.2} rotationIntensity={0.18} floatIntensity={0.35}>
        <mesh position={[-2, 0.7, -0.4]}>
          <sphereGeometry args={[0.1, 20, 20]} />
          <meshStandardMaterial color="#e3aa35" emissive="#e3aa35" emissiveIntensity={1.4} />
        </mesh>
      </Float>
    </group>
  );
}

function BookBase() {
  const book = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (book.current) {
      book.current.rotation.y = Math.sin(clock.getElapsedTime() * 0.2) * 0.05;
      book.current.position.y = -1.45 + Math.sin(clock.getElapsedTime() * 0.9) * 0.03;
    }
  });

  return (
    <group ref={book}>
      <mesh position={[0, -1.95, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.8, 1.8]} />
        <meshStandardMaterial color="#2b1605" roughness={0.98} metalness={0.02} />
      </mesh>
      <mesh position={[0, -1.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.5, 1.55]} />
        <meshStandardMaterial color="#8a5a1a" roughness={0.9} metalness={0.08} />
      </mesh>
    </group>
  );
}

export function OrbitScene() {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className="absolute inset-0 opacity-95">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.6, 6.2], fov: 42 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#02050c"]} />
        <ambientLight intensity={0.65} />
        <directionalLight position={[4, 5, 2]} intensity={2.8} color="#ffd27a" />
        <pointLight position={[-4, -2, -1]} intensity={1.3} color="#ffffff" />
        <Stars radius={80} depth={45} count={4200} factor={3.5} fade speed={0.55} />
        <Planet />
        <BookBase />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate={!prefersReducedMotion}
          autoRotateSpeed={0.65}
        />
      </Canvas>
    </div>
  );
}
