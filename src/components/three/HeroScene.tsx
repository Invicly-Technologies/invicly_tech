"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const BLUE = "#0A84FF";
const LIGHT = "#5AB0FF";

/** The four products orbiting the core. Accents match src/data/products.ts. */
const SATELLITES = [
  { slug: "flow", name: "Flow", sub: "Tasks & focus", accent: "#3D9BFF", radius: 2.35, speed: 0.32, tilt: [0.32, 0, 0.18], phase: 0.2 },
  { slug: "spendly", name: "Spendly", sub: "Money tracker", accent: "#34D399", radius: 2.85, speed: -0.24, tilt: [-0.42, 0, -0.32], phase: 2.1 },
  { slug: "kivo", name: "Kivo", sub: "Time tracking", accent: "#A78BFA", radius: 3.3, speed: 0.19, tilt: [0.62, 0, -0.12], phase: 4.0 },
  { slug: "unreel", name: "Unreel", sub: "Mindful media", accent: "#A3E635", radius: 2.6, speed: -0.28, tilt: [-0.16, 0, 0.55], phase: 5.3 },
] as const;

type DragState = { down: boolean; moved: boolean; lastX: number; lastY: number; vx: number; vy: number; px: number; py: number };

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function tileTexture(name: string, sub: string, accent: string) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 256;
  const g = c.getContext("2d")!;
  g.shadowColor = accent;
  g.shadowBlur = 28;
  roundRect(g, 28, 28, 456, 200, 44);
  const bg = g.createLinearGradient(0, 28, 0, 228);
  bg.addColorStop(0, "rgba(16,26,48,0.94)");
  bg.addColorStop(1, "rgba(6,11,24,0.94)");
  g.fillStyle = bg;
  g.fill();
  g.shadowBlur = 0;
  g.lineWidth = 3;
  g.strokeStyle = accent;
  g.globalAlpha = 0.85;
  g.stroke();
  g.globalAlpha = 1;
  // app icon
  roundRect(g, 64, 74, 108, 108, 30);
  const ig = g.createLinearGradient(64, 74, 172, 182);
  ig.addColorStop(0, accent);
  ig.addColorStop(1, "rgba(255,255,255,0.15)");
  g.fillStyle = ig;
  g.fill();
  g.fillStyle = "#ffffff";
  g.font = "800 64px Poppins, Manrope, system-ui, sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(name[0], 118, 132);
  g.textAlign = "left";
  g.font = "700 60px Poppins, Manrope, system-ui, sans-serif";
  g.fillText(name, 198, 112);
  g.fillStyle = "rgba(207,224,255,0.75)";
  g.font = "500 30px Manrope, system-ui, sans-serif";
  g.fillText(sub, 200, 166);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function markTexture(onReady: () => void) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const g = c.getContext("2d")!;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  const img = new Image();
  img.onload = () => {
    const w = 190;
    const h = (w * img.height) / img.width;
    g.drawImage(img, 128 - w / 2, 128 - h / 2, w, h);
    t.needsUpdate = true;
    onReady();
  };
  img.src = "/brand/invicly-mark-256.png";
  return t;
}

/* ---------------- Core: faceted crystal + geodesic shell + glowing heart ---------------- */

function Core() {
  const crystal = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Group>(null);
  const heart = useRef<THREE.Mesh>(null);
  const invalidate = useThree((s) => s.invalidate);
  const crystalGeo = useMemo(() => new THREE.IcosahedronGeometry(0.95, 0), []);
  const crystalEdges = useMemo(() => new THREE.EdgesGeometry(crystalGeo), [crystalGeo]);
  const shellEdges = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.55, 1)), []);
  const mark = useMemo(() => markTexture(invalidate), [invalidate]);
  useEffect(() => () => mark.dispose(), [mark]);

  useFrame(({ clock }, dt) => {
    if (crystal.current) {
      crystal.current.rotation.y += dt * 0.35;
      crystal.current.rotation.x += dt * 0.12;
    }
    if (shell.current) {
      shell.current.rotation.y -= dt * 0.12;
      shell.current.rotation.z += dt * 0.05;
    }
    if (heart.current) {
      const s = 1 + Math.sin(clock.elapsedTime * 2.2) * 0.08;
      heart.current.scale.setScalar(s);
    }
  });

  return (
    <group>
      <group ref={crystal}>
        <mesh geometry={crystalGeo}>
          <meshStandardMaterial color="#0b2a55" emissive={BLUE} emissiveIntensity={0.28} metalness={0.55} roughness={0.22} flatShading transparent opacity={0.82} />
        </mesh>
        <lineSegments geometry={crystalEdges}>
          <lineBasicMaterial color={LIGHT} transparent opacity={0.9} blending={THREE.AdditiveBlending} />
        </lineSegments>
      </group>
      <mesh ref={heart}>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshBasicMaterial color={LIGHT} transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <sprite scale={[0.95, 0.95, 1]} renderOrder={3}>
        <spriteMaterial map={mark} transparent depthTest={false} />
      </sprite>
      <group ref={shell}>
        <lineSegments geometry={shellEdges}>
          <lineBasicMaterial color={BLUE} transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} />
        </lineSegments>
      </group>
    </group>
  );
}

/* ---------------- Orbiting product tiles ---------------- */

function Satellite({ s, drag }: { s: (typeof SATELLITES)[number]; drag: React.RefObject<DragState> }) {
  const sprite = useRef<THREE.Sprite>(null);
  const angle = useRef<number>(s.phase);
  const [hover, setHover] = useState(false);
  const router = useRouter();
  const tex = useMemo(() => tileTexture(s.name, s.sub, s.accent), [s]);
  useEffect(() => () => tex.dispose(), [tex]);
  const orbit = useMemo(() => {
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= 160; i++) {
      const a = (i / 160) * Math.PI * 2;
      pts.push([Math.cos(a) * s.radius, 0, Math.sin(a) * s.radius]);
    }
    return pts;
  }, [s.radius]);

  useFrame((_, dt) => {
    const sp = sprite.current;
    if (!sp) return;
    angle.current += dt * s.speed * (hover ? 0.15 : 1);
    sp.position.set(Math.cos(angle.current) * s.radius, 0, Math.sin(angle.current) * s.radius);
    const target = hover ? 1.22 : 1;
    const k = sp.scale.x / 1.3;
    const next = k + (target - k) * 0.15;
    sp.scale.set(1.3 * next, 0.65 * next, 1);
  });

  return (
    <group rotation={s.tilt as unknown as [number, number, number]}>
      <Line points={orbit} color={s.accent} lineWidth={1} transparent opacity={hover ? 0.75 : 0.3} />
      <sprite
        ref={sprite}
        scale={[1.3, 0.65, 1]}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = "";
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (!drag.current?.moved) router.push(`/products/${s.slug}/`);
        }}
      >
        <spriteMaterial map={tex} transparent depthWrite={false} />
      </sprite>
    </group>
  );
}

/* ---------------- Particle galaxy ---------------- */

function Galaxy({ count = 1600 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const a = new THREE.Color("#0A84FF");
    const b = new THREE.Color("#A78BFA");
    const c = new THREE.Color("#5AB0FF");
    const rnd = (seed: number) => {
      const x = Math.sin(seed * 12.9898) * 43758.5453;
      return x - Math.floor(x);
    };
    for (let i = 0; i < count; i++) {
      const r = 1.9 + Math.pow(rnd(i + 1), 1.4) * 4.2;
      const arm = (i % 3) * ((Math.PI * 2) / 3);
      const ang = arm + r * 0.85 + (rnd(i + 7) - 0.5) * 0.9;
      pos[i * 3] = Math.cos(ang) * r;
      pos[i * 3 + 1] = (rnd(i + 3) - 0.5) * 0.35 * (r / 3);
      pos[i * 3 + 2] = Math.sin(ang) * r;
      const mix = (r - 1.9) / 4.2;
      const col3 = (rnd(i + 11) > 0.85 ? c : a).clone().lerp(b, mix * 0.8);
      col[i * 3] = col3.r;
      col[i * 3 + 1] = col3.g;
      col[i * 3 + 2] = col3.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, [count]);
  useEffect(() => () => geo.dispose(), [geo]);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.04;
  });
  return (
    <points ref={ref} geometry={geo} rotation={[0.18, 0, 0.08]}>
      <pointsMaterial size={0.035} sizeAttenuation vertexColors transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
    </points>
  );
}

function System({ drag }: { drag: React.RefObject<DragState> }) {
  const spin = useRef<THREE.Group>(null);
  const tilt = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = spin.current;
    const d = drag.current;
    if (!g || !d) return;
    if (d.down) {
      g.rotation.y += d.vx;
      g.rotation.x = THREE.MathUtils.clamp(g.rotation.x + d.vy, -0.7, 0.9);
      d.vx *= 0.6;
      d.vy *= 0.6;
    } else {
      d.vx *= 0.94;
      d.vy *= 0.94;
      g.rotation.y += d.vx;
      g.rotation.x = THREE.MathUtils.clamp(g.rotation.x + d.vy, -0.7, 0.9);
      g.rotation.x += (0.12 - g.rotation.x) * 0.015;
    }
    if (tilt.current) {
      tilt.current.rotation.x += (d.py * 0.14 - tilt.current.rotation.x) * 0.05;
      tilt.current.rotation.z += (-d.px * 0.1 - tilt.current.rotation.z) * 0.05;
    }
  });
  return (
    <group ref={tilt}>
      <group ref={spin} rotation={[0.12, 0, 0]}>
        <Galaxy />
        <Core />
        {SATELLITES.map((s) => (
          <Satellite key={s.slug} s={s} drag={drag} />
        ))}
      </group>
    </group>
  );
}

export default function HeroScene() {
  const drag = useRef<DragState>({ down: false, moved: false, lastX: 0, lastY: 0, vx: 0, vy: 0, px: 0, py: 0 });
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const d = drag.current;
    let startX = 0;
    let startY = 0;
    const onDown = (e: PointerEvent) => {
      d.down = true;
      d.moved = false;
      d.lastX = startX = e.clientX;
      d.lastY = startY = e.clientY;
      d.vx = d.vy = 0;
      el.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      d.px = ((e.clientX - r.left) / r.width - 0.5) * 2;
      d.py = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!d.down) return;
      if (Math.abs(e.clientX - startX) + Math.abs(e.clientY - startY) > 5) d.moved = true;
      d.vx = (e.clientX - d.lastX) * 0.006;
      d.vy = (e.clientY - d.lastY) * 0.004;
      d.lastX = e.clientX;
      d.lastY = e.clientY;
    };
    const onUp = () => {
      d.down = false;
      el.style.cursor = "grab";
    };
    const onLeave = () => {
      d.px = d.py = 0;
      d.down = false;
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointerleave", onLeave);
      document.body.style.cursor = "";
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
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 1.4, 8.4], fov: 42 }}
        onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        aria-label="Invicly products Flow, Spendly, Kivo and Unreel orbiting the Invicly core. Drag to spin, click a product to open it."
        role="img"
      >
        <ambientLight intensity={0.45} />
        <pointLight position={[3, 3, 4]} intensity={30} color={LIGHT} />
        <pointLight position={[-4, -1, 2]} intensity={22} color="#A78BFA" />
        <pointLight position={[0, -3, -3]} intensity={16} color="#34D399" />
        <System drag={drag} />
      </Canvas>
    </div>
  );
}
