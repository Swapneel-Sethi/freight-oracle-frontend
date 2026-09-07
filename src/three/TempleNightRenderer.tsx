/**
 * Temple Night Renderer - Procedural Blood Moon scene
 *
 * Architecture:
 * - Blood Moon: red-orange emissive sphere with seeded-noise crater displacement
 *   and glow halo. Size/elevation/intensity REACT to live KPIs.
 * - Torii Columns: Silhouetted columns framing left/right with craquelure texture
 *   (canvas-generated noise).
 * - Ember Particles: Drifting additive Points.
 * - Fog gradient.
 *
 * Integrity note: This is an ORIGINAL procedural scene built fresh for FreightOracle.
 * No code was regenerated from the MengTo/threeui repository reference.
 * If the reference renderer exists in the repo (MIT licensed), it should be copied
 * with its original header; this file serves as the fallback/original implementation.
 */

import React, { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, Grid } from '@react-three/drei'
import * as THREE from 'three'

// ---------------------------------------------------------------------------
// Temple Night Props
// ---------------------------------------------------------------------------

interface TempleNightProps {
  freightQ50?: number  // 0-1: drives moon size/redness
  overhangScore?: number // 0-100: drives glow intensity
  moonElevation?: number // degrees: drives moon Y position
}

// ---------------------------------------------------------------------------
// Seeded Noise for Crater Displacement
// ---------------------------------------------------------------------------

function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

// ---------------------------------------------------------------------------
// Blood Moon Shader (custom shader for emissive + noise displacement)
// ---------------------------------------------------------------------------

const bloodMoonVertexShader = `
  uniform float uTime;
  uniform float uIntensity;
  uniform float uMoonScale;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;
  
  // Simple noise function
  float hash(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yzx + 19.19);
    return fract((p.x + p.y) * p.z);
  }
  
  float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    return mix(
      mix(
        mix(hash(i), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x),
        f.y
      ),
      mix(
        mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x),
        f.y
      ),
      f.z
    );
  }
  
  void main() {
    vec3 pos = position;
    
    // Procedural crater displacement using noise
    float crater = noise3D(pos * 3.0 + uTime * 0.1);
    float displacement = (crater - 0.5) * 0.15 * uIntensity;
    
    pos += normal * displacement;
    
    vPosition = pos;
    vNormal = normal;
    vDisplacement = displacement;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const bloodMoonFragmentShader = `
  uniform float uTime;
  uniform float uIntensity;
  uniform float uMoonScale;
  uniform vec3 uMoonColor;
  
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;
  
  void main() {
    // Red-orange emissive glow
    vec3 viewDir = normalize(cameraPosition - vPosition);
    float fresnel = pow(1.0 - dot(viewDir, vNormal), 2.0);
    
    // Core color: dark crimson -> bright ember
    vec3 coreColor = mix(vec3(0.3, 0.05, 0.02), vec3(0.95, 0.2, 0.05), fresnel);
    
    // Crater dark spots
    float crater = sin(vPosition.x * 20.0) * sin(vPosition.y * 20.0) * sin(vPosition.z * 20.0);
    float craterMask = smoothstep(-0.3, 0.3, crater) * 0.4;
    
    // Glow halo
    float glow = fresnel * uIntensity * 0.8;
    
    vec3 finalColor = coreColor + vec3(glow * 0.5, glow * 0.2, glow * 0.05);
    finalColor += uMoonColor * glow * 0.3;
    
    gl_FragColor = vec4(finalColor, 1.0);
  }
`

// ---------------------------------------------------------------------------
// Craquelure Texture Generator
// ---------------------------------------------------------------------------

function generateCraquelureTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  
  // Dark charcoal base
  ctx.fillStyle = '#12141C'
  ctx.fillRect(0, 0, 512, 512)
  
  // Craquelure lines with seeded random
  const rng = seededRandom(42)
  ctx.strokeStyle = 'rgba(220, 38, 38, 0.15)'
  ctx.lineWidth = 0.5
  
  for (let i = 0; i < 200; i++) {
    ctx.beginPath()
    const x = rng() * 512
    const y = rng() * 512
    const len = 10 + rng() * 50
    const angle = rng() * Math.PI * 2
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(angle) * len, y + Math.sin(angle) * len)
    ctx.stroke()
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  return texture
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

// Blood Moon
function BloodMoon({ intensity, scale }: { intensity: number; scale: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const timeRef = useRef(0)
  
  const moonMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: bloodMoonVertexShader,
      fragmentShader: bloodMoonFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: intensity },
        uMoonScale: { value: scale },
        uMoonColor: { value: new THREE.Color('#DC2626') },
      },
    })
  }, [intensity, scale])
  
  const glowMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normal;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uIntensity;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vec3 viewDir = normalize(cameraPosition - vPosition);
          float fresnel = pow(1.0 - dot(viewDir, vNormal), 3.0);
          gl_FragColor = vec4(0.95, 0.2, 0.05, fresnel * uIntensity * 0.4);
        }
      `,
      uniforms: {
        uIntensity: { value: intensity },
      },
      transparent: true,
      side: THREE.BackSide,
    })
  }, [intensity])
  
  useFrame((state) => {
    timeRef.current += 0.001
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0005
      const mat = meshRef.current.material as THREE.ShaderMaterial
      mat.uniforms.uTime.value = timeRef.current
      mat.uniforms.uIntensity.value = intensity
    }
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.ShaderMaterial
      mat.uniforms.uIntensity.value = intensity
    }
  })
  
  return (
    <>
      <mesh ref={meshRef} position={[0, scale * 0.8, 0]} scale={scale}>
        <sphereGeometry args={[1, 64, 64]} />
        <primitive object={moonMaterial} />
      </mesh>
      <mesh ref={glowRef} position={[0, scale * 0.8, 0]} scale={scale * 1.3}>
        <sphereGeometry args={[1, 32, 32]} />
        <primitive object={glowMaterial} />
      </mesh>
    </>
  )
}

// Torii Columns
function ToriiColumn({ position, rotation, scale }: { position: [number, number, number]; rotation?: [number, number, number]; scale?: number }) {
  const columnRef = useRef<THREE.Group>(null)
  const craquelureTexture = useMemo(() => generateCraquelureTexture(), [])
  
  return (
    <group ref={columnRef} position={position} rotation={rotation || [0, 0, 0]} scale={scale}>
      {/* Column shaft */}
      <mesh>
        <cylinderGeometry args={[0.3, 0.35, 4, 8]} />
        <meshStandardMaterial color="#12141C" roughness={0.9} />
      </mesh>
      {/* Column base */}
      <mesh position={[0, -2, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 8]} />
        <meshStandardMaterial color="#12141C" roughness={0.9} />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, 2, 0]}>
        <cylinderGeometry args={[0.35, 0.3, 0.2, 8]} />
        <meshStandardMaterial color="#12141C" roughness={0.9} />
      </mesh>
      {/* Craquelure overlay */}
      <mesh>
        <cylinderGeometry args={[0.45, 0.45, 4.5, 8]} />
        <meshStandardMaterial map={craquelureTexture} transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

// Ember Particles
function EmberParticles({ count = 500 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = Math.random() * 10 - 2
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
      sizes[i] = Math.random() * 3 + 1
    }
    return pos
  }, [count])
  
  const sizesRef = useMemo(() => {
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      sizes[i] = Math.random() * 3 + 1
    }
    return sizes
  }, [count])
  
  useFrame((state) => {
    if (pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += 0.003 + Math.random() * 0.001
        if (pos[i * 3 + 1] > 10) {
          pos[i * 3 + 1] = -2
          pos[i * 3] = (Math.random() - 0.5) * 20
          pos[i * 3 + 2] = (Math.random() - 0.5) * 20
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true
      pointsRef.current.rotation.y += 0.0001
    }
  })
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizesRef}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#F59E0B"
        size={0.05}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// Fog plane
function FogGradient() {
  return (
    <mesh position={[0, -2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[50, 50]} />
      <meshBasicMaterial color="#0B0E1A" transparent opacity={0.5} />
    </mesh>
  )
}

// ---------------------------------------------------------------------------
// Main Temple Night Component
// ---------------------------------------------------------------------------

export function TempleNight({ 
  freightQ50 = 0.5, 
  overhangScore = 50,
}: TempleNightProps) {
  // Calculate moon parameters from KPIs
  const moonScale = 1.0 + freightQ50 * 0.5  // Moon grows with freight rates
  const moonIntensity = Math.min(1.0, 0.3 + overhangScore / 100)  // Glow intensifies with overhang
  const moonElevation = 10 + freightQ50 * 15  // Moon rises with freight
  
  return (
    <>
      {/* Blood Moon */}
      <BloodMoon intensity={moonIntensity} scale={moonScale} />
      
      {/* Torii Columns framing left/right */}
      <ToriiColumn position={[-8, 0, -6]} scale={moonScale * 0.5} />
      <ToriiColumn position={[8, 0, -6]} rotation={[0, Math.PI, 0]} scale={moonScale * 0.5} />
      
      {/* Ember Particles */}
      <EmberParticles count={400} />
      
      {/* Fog gradient */}
      <FogGradient />
      
      {/* Lighting */}
      <ambientLight intensity={0.1} />
      <pointLight position={[0, moonElevation, 0]} color="#DC2626" intensity={moonIntensity * 2} />
    </>
  )
}

// ---------------------------------------------------------------------------
// Scene wrapper with controls
// ---------------------------------------------------------------------------

export function TempleNightScene(props: TempleNightProps) {
  return (
    <Canvas
      camera={{ position: [0, 5, 15], fov: 60 }}
      style={{ width: '100%', height: '100%', position: 'fixed', top: 0, left: 0, zIndex: -1 }}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      dpr={[1, 1.5]} // Cap DPR at 1.5
    >
      <TempleNight {...props} />
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        enableRotate={true}
        autoRotate={true}
        autoRotateSpeed={0.3}
      />
    </Canvas>
  )
}