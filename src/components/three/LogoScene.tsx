"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, Sparkles } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

/*
 * The Invicly mark rebuilt as vector shapes (traced from the 1254px logo; origin at its centre,
 * 300 px = 1 unit) and extruded with a bevel so it reads as a solid object.
 */
const CX = 670;
const CY = 625;
const S = 1 / 300;
const v = (x: number, y: number) => new THREE.Vector2((x - CX) * S, -(y - CY) * S);

function dotShape() {
  const s = new THREE.Shape();
  const c = v(337, 413);
  s.absarc(c.x, c.y, 121 * S, 0, Math.PI * 2, false);
  return s;
}

function stemShape() {
  const s = new THREE.Shape();
  const m = (x: number, y: number) => v(x, y);
  let p = m(218, 900);
  s.moveTo(p.x, p.y);
  p = m(218, 640); s.lineTo(p.x, p.y);
  let c = m(218, 595), e = m(262, 580); s.quadraticCurveTo(c.x, c.y, e.x, e.y);
  p = m(396, 530); s.lineTo(p.x, p.y);
  c = m(450, 512); e = m(450, 572); s.quadraticCurveTo(c.x, c.y, e.x, e.y);
  p = m(450, 900); s.lineTo(p.x, p.y);
  c = m(450, 946); e = m(404, 946); s.quadraticCurveTo(c.x, c.y, e.x, e.y);
  p = m(264, 946); s.lineTo(p.x, p.y);
  c = m(218, 946); e = m(218, 900); s.quadraticCurveTo(c.x, c.y, e.x, e.y);
  return s;
}

function checkShape() {
  const s = new THREE.Shape();
  const pts: [number, number][] = [
    [470, 555], [496, 530], [673, 700], [886, 482], [912, 470], [1108, 470], [1124, 492], [714, 938], [678, 954], [644, 938], [478, 735], [470, 712],
  ];
  const first = v(...pts[0]);
  s.moveTo(first.x, first.y);
  for (let i = 1; i < pts.length; i++) {
    const p = v(...pts[i]);
    s.lineTo(p.x, p.y);
  }
  s.closePath();
  return s;
}

const extrude: THREE.ExtrudeGeometryOptions = { depth: 0.32, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.035, bevelSegments: 5, curveSegments: 48 };

function Mark({ drag }: { drag: React.RefObject<{ down: boolean; vx: number; vy: number; px: number; py: number }> }) {
  const outer = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const geos = useMemo(() => {
    const g = [dotShape(), stemShape(), checkShape()].map((sh) => {
      const geo = new THREE.ExtrudeGeometry(sh, extrude);
      geo.translate(0, 0, -extrude.depth! / 2);
      return geo;
    });
    return g;
  }, []);
  useEffect(() => () => geos.forEach((g) => g.dispose()), [geos]);

  const bright = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#0A84FF", metalness: 0.35, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.15, emissive: "#0A3F8C", emissiveIntensity: 0.55 }),
    [],
  );
  const deep = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: "#1A55AD", metalness: 0.4, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.2, emissive: "#0B2A5E", emissiveIntensity: 0.5 }),
    [],
  );
  useEffect(() => () => (bright.dispose(), deep.dispose()), [bright, deep]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const d = drag.current;
    if (!spin.current || !outer.current || !d) return;
    if (d.down) {
      spin.current.rotation.y += d.vx;
      spin.current.rotation.x = THREE.MathUtils.clamp(spin.current.rotation.x + d.vy, -0.8, 0.8);
      d.vx *= 0.6;
      d.vy *= 0.6;
    } else {
      // inertia, then ease back into a gentle sway so the mark always ends up readable
      d.vx *= 0.94;
      d.vy *= 0.94;
      spin.current.rotation.y += d.vx;
      spin.current.rotation.x += d.vy;
      const targetY = Math.sin(t * 0.6) * 0.55;
      const targetX = Math.sin(t * 0.45) * 0.12;
      spin.current.rotation.y += (targetY - spin.current.rotation.y) * Math.min(1, dt * 1.6);
      spin.current.rotation.x += (targetX - spin.current.rotation.x) * Math.min(1, dt * 1.6);
    }
    outer.current.position.y = Math.sin(t * 1.1) * 0.12;
    outer.current.rotation.x += (d.py * 0.2 - outer.current.rotation.x) * 0.05;
    outer.current.rotation.z += (-d.px * 0.1 - outer.current.rotation.z) * 0.05;
  });

  return (
    <group ref={outer}>
      <group ref={spin}>
        <mesh geometry={geos[0]} material={bright} />
        <mesh geometry={geos[1]} material={deep} />
        <mesh geometry={geos[2]} material={bright} />
      </group>
    </group>
  );
}

function Orbit({ radius, tilt, speed, color, dash, bead }: { radius: number; tilt: [number, number]; speed: number; color: string; dash?: [number, number]; bead?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 160; i++) {
      const a = (i / 160) * Math.PI * 2;
      pts.push([Math.cos(a) * radius, 0, Math.sin(a) * radius]);
    }
    return pts;
  }, [radius]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * speed;
  });
  return (
    <group rotation={[tilt[0], 0, tilt[1]]}>
      <group ref={ref}>
        <Line points={points} color={color} lineWidth={1.3} dashed={!!dash} dashSize={dash?.[0]} gapSize={dash?.[1]} transparent opacity={0.55} />
        {bead && (
          <mesh position={[radius, 0, 0]}>
            <sphereGeometry args={[0.07, 24, 24]} />
            <meshBasicMaterial color="#BFE0FF" />
            <pointLight color="#5AB0FF" intensity={3} distance={2.5} />
          </mesh>
        )}
      </group>
    </group>
  );
}

function GlowDisc() {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, "rgba(10,132,255,0.55)");
    grad.addColorStop(1, "rgba(10,132,255,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.45, 0]}>
      <planeGeometry args={[4.2, 4.2]} />
      <meshBasicMaterial map={tex} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

/** Pulls the camera back on narrow canvases so the mark and its orbits always fit. */
function FitCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    camera.position.z = aspect < 0.9 ? 8.6 : aspect < 1.2 ? 7.2 : 6.4;
    camera.lookAt(0, 0, 0);
  }, [camera, size]);
  return null;
}

export default function LogoScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, lastX: 0, lastY: 0, vx: 0, vy: 0, px: 0, py: 0 });

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const d = drag.current;
    const down = (e: PointerEvent) => {
      d.down = true;
      d.lastX = e.clientX;
      d.lastY = e.clientY;
      el.setPointerCapture(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      d.px = ((e.clientX - r.left) / r.width - 0.5) * 2;
      d.py = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!d.down) return;
      d.vx = (e.clientX - d.lastX) * 0.008;
      d.vy = (e.clientY - d.lastY) * 0.005;
      d.lastX = e.clientX;
      d.lastY = e.clientY;
    };
    const up = (e: PointerEvent) => {
      d.down = false;
      el.style.cursor = "grab";
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    };
    const leave = () => ((d.px = 0), (d.py = 0));
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div
      ref={wrap}
      className="absolute inset-0 touch-pan-y"
      style={{
        cursor: "grab",
        WebkitMaskImage: "radial-gradient(ellipse 75% 72% at 50% 50%, #000 60%, transparent 100%)",
        maskImage: "radial-gradient(ellipse 75% 72% at 50% 50%, #000 60%, transparent 100%)",
      }}
    >
      <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.2, 6.2], fov: 40 }} gl={{ antialias: true, alpha: true }} role="img" aria-label="3D Invicly Tech logo. Drag to rotate.">
        <ambientLight intensity={0.35} />
        <directionalLight position={[3, 4, 5]} intensity={2.2} />
        <directionalLight position={[-4, -2, 3]} intensity={0.8} color="#5AB0FF" />
        <pointLight position={[0, 0, -3]} intensity={6} color="#0A84FF" distance={8} />
        <FitCamera />
        <GlowDisc />
        <Orbit radius={2.45} tilt={[0.32, 0]} speed={0.3} color="#5AB0FF" dash={[0.18, 0.14]} />
        <Orbit radius={2.05} tilt={[0.45, 0.42]} speed={-0.7} color="#0A84FF" bead />
        <Orbit radius={2.2} tilt={[0.45, -0.42]} speed={0.55} color="#5AB0FF" bead />
        <Sparkles count={50} scale={[6, 4, 4]} size={2.2} speed={0.35} color="#9CCBFF" opacity={0.7} />
        <Mark drag={drag} />
      </Canvas>
    </div>
  );
}
