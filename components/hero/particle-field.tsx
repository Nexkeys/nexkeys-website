'use client';

import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Gold particle environment.
 *
 * The vertex and fragment shaders are ported VERBATIM from the legacy
 * vfx.js:193–241 — same wave drift, same edge vignette, same hot-centre
 * falloff — now driven by R3F instead of a hand-rolled renderer loop.
 */

const COUNT = 260;

const VERTEX = /* glsl */ `
  attribute float aSize;
  attribute vec3  aColor;
  varying   vec3  vColor;
  varying   float vAlpha;
  uniform   float uTime;
  uniform   vec2  uMouse;

  void main () {
    vColor = aColor;

    vec3 pos = position;

    /* Subtle mouse parallax offset */
    pos.x += uMouse.x * 9.0;
    pos.y += uMouse.y * 6.0;

    /* Organic wave drift */
    float wave = sin(uTime * 0.35 + pos.x * 0.04 + pos.y * 0.06) * 1.4;
    pos.y += wave;

    /* Edge vignette — fade out at perimeter */
    float dist = length(pos.xy / vec2(110.0, 65.0));
    vAlpha = smoothstep(1.2, 0.1, dist) * 0.62;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (280.0 / -mvPos.z);
    gl_Position  = projectionMatrix * mvPos;
  }
`;

const FRAGMENT = /* glsl */ `
  varying vec3  vColor;
  varying float vAlpha;

  void main () {
    float d = distance(gl_PointCoord, vec2(0.5));
    float str = 1.0 - smoothstep(0.0, 0.5, d);
    str = pow(str, 1.7);
    vec3 col = vColor + vColor * str * 0.4;
    gl_FragColor = vec4(col, str * vAlpha);
  }
`;

const PALETTE = [
  new THREE.Color(0xc9a227), // classic gold
  new THREE.Color(0xe8bc2c), // warm gold
  new THREE.Color(0xf5d76e), // bright champagne
  new THREE.Color(0xd4af37), // royal gold
  new THREE.Color(0x9a7318), // antique bronze
];

function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  const mouse = useRef({ x: 0, y: 0, sx: 0, sy: 0 });

  const { geometry, velocities } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const colors = new Float32Array(COUNT * 3);
    const vels: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 220;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 130;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 70;

      sizes[i] = Math.random() * 2.4 + 0.5;

      const c = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      vels.push({
        x: (Math.random() - 0.5) * 0.016,
        y: (Math.random() - 0.5) * 0.011,
        z: (Math.random() - 0.5) * 0.005,
      });
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

    return { geometry: geo, velocities: vels };
  }, []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
    }),
    []
  );

  useFrame((state, delta) => {
    const mat = materialRef.current;
    if (!mat) return;

    mat.uniforms.uTime.value += delta * 0.3;

    // Pointer parallax, heavily damped.
    mouse.current.x = state.pointer.x * 0.5;
    mouse.current.y = state.pointer.y * 0.5;
    mouse.current.sx += (mouse.current.x - mouse.current.sx) * 0.045;
    mouse.current.sy += (mouse.current.y - mouse.current.sy) * 0.045;
    mat.uniforms.uMouse.value.set(mouse.current.sx, mouse.current.sy);

    // Drift + wrap.
    const posAttr = geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3] += velocities[i].x;
      arr[i * 3 + 1] += velocities[i].y;
      arr[i * 3 + 2] += velocities[i].z;
      if (arr[i * 3] > 110) arr[i * 3] = -110;
      if (arr[i * 3] < -110) arr[i * 3] = 110;
      if (arr[i * 3 + 1] > 65) arr[i * 3 + 1] = -65;
      if (arr[i * 3 + 1] < -65) arr[i * 3 + 1] = 65;
    }
    posAttr.needsUpdate = true;

    void viewport;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={VERTEX}
        fragmentShader={FRAGMENT}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function ParticleField() {
  return (
    <Canvas
      aria-hidden="true"
      className="!absolute inset-0"
      dpr={[1, 1.5]}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: 'low-power',
        precision: 'mediump',
      }}
      camera={{ position: [0, 0, 80], fov: 55, near: 0.1, far: 500 }}
      style={{ pointerEvents: 'none' }}
    >
      <Particles />
    </Canvas>
  );
}
