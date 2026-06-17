'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Cpu, Zap, Shield, Sparkles } from 'lucide-react';

function FloatingIcon({ Icon, position, color }: { Icon: any, position: [number, number, number], color: string }) {
  return (
    <Float speed={1.5} rotationIntensity={2} floatIntensity={2} position={position}>
      <Html distanceFactor={10}>
        <div style={{ 
          color, 
          background: 'rgba(255,255,255,0.05)', 
          padding: '10px', 
          borderRadius: '50%', 
          backdropFilter: 'blur(5px)',
          border: `1px solid ${color}44`,
          boxShadow: `0 0 20px ${color}33`
        }}>
          <Icon size={20} />
        </div>
      </Html>
    </Float>
  );
}

function AnimatedSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      meshRef.current.rotation.x = t * 0.2;
      meshRef.current.rotation.y = t * 0.3;
    }
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={1} floatIntensity={1}>
        <Sphere ref={meshRef} args={[1, 64, 64]} scale={1.5}>
          <MeshDistortMaterial
            color="#00d2ff"
            attach="material"
            distort={0.45}
            speed={3}
            roughness={0.1}
            metalness={0.9}
          />
        </Sphere>
      </Float>
      
      {/* Floating Intelligence Icons */}
      <FloatingIcon Icon={Cpu} position={[2, 1, 0]} color="#00d2ff" />
      <FloatingIcon Icon={Zap} position={[-2, -1, 1]} color="#9b51e0" />
      <FloatingIcon Icon={Shield} position={[1, -2, -1]} color="#4ade80" />
      <FloatingIcon Icon={Sparkles} position={[-1, 2, -1]} color="#fbbf24" />
    </group>
  );
}

export function VisualElement3D() {
  return (
    <div style={{ width: '100%', height: '400px', cursor: 'grab', position: 'relative' }}>
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
        <ambientLight intensity={0.4} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#00d2ff" intensity={3} />
        <pointLight position={[10, -10, 5]} color="#9b51e0" intensity={2} />
        <AnimatedSphere />
      </Canvas>
    </div>
  );
}
