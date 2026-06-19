import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Interactive 3D backdrop (plain three.js — no reconciler).
 * - Central icosahedron "molecule core" with orbiting electrons
 * - 4 agent-robot heads orbiting; hover highlights, click links to core
 * - Floating EMR sheets + glass test tubes
 * - Camera tilts toward pointer
 * Colors driven by CSS variables on :root.
 */

function readVar(name: string, fallback: string) {
  if (typeof window === 'undefined') return new THREE.Color(fallback);
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return new THREE.Color(v || fallback);
}

const AGENT_DEFS = [
  { id: 'pathology', label: 'PATOLOGI', cssVar: '--brand-teal', angle: 0 },
  { id: 'prognosis', label: 'PROGNOSIS', cssVar: '--brand-acid', angle: Math.PI / 2 },
  { id: 'privacy', label: 'PRIVASI', cssVar: '--brand-orange', angle: Math.PI },
  { id: 'trial', label: 'UJI KLINIS', cssVar: '--brand-yellow', angle: (3 * Math.PI) / 2 },
];

const INK = '#0a0a0a';

export function Scene3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = () => mount.clientWidth;
    const height = () => mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width() / height(), 0.1, 100);
    camera.position.set(0, 1.5, 9);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width(), height());
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.style.display = 'block';

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(6, 8, 5);
    scene.add(key);
    const teal = new THREE.DirectionalLight(readVar('--brand-teal', '#00e0c7').getHex(), 0.5);
    teal.position.set(-4, 2, -4);
    scene.add(teal);

    // ─── AI Medical Diagnostic Core (Realistic Robot) ───────────
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Core removed per user request (was blocking text)
    const coreMesh = new THREE.Group();
    coreGroup.add(coreMesh);
    
    const electronGroup = new THREE.Group();
    coreGroup.add(electronGroup);

    // ─── Agent robots ───────────────────────────────────────────
    const agents = AGENT_DEFS.map((def) => {
      const color = readVar(def.cssVar, '#00e0c7');
      const g = new THREE.Group();

      // Main spherical body (matte dark metal)
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 32, 32),
        new THREE.MeshStandardMaterial({ color: INK, roughness: 0.3, metalness: 0.8 }),
      );
      // Wireframe overlay for high-tech look
      body.add(
        new THREE.LineSegments(
          new THREE.WireframeGeometry(new THREE.SphereGeometry(0.51, 12, 12)),
          new THREE.LineBasicMaterial({ color: 0x444444, transparent: true, opacity: 0.3 }),
        )
      );
      g.add(body);

      // Glowing Visor / Eye
      const visorGroup = new THREE.Group();
      const visor = new THREE.Mesh(
        new THREE.CylinderGeometry(0.52, 0.52, 0.25, 32, 1, false, -Math.PI / 2.5, (Math.PI * 2) / 2.5),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8, roughness: 0.1 }),
      );
      visorGroup.add(visor);
      visorGroup.rotation.x = Math.PI / 16; 
      g.add(visorGroup);

      // Glowing core (bottom thruster)
      const coreLight = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 16),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: color, emissiveIntensity: 1.0 }),
      );
      coreLight.position.set(0, -0.4, 0);
      g.add(coreLight);

      // Outer rings (halo/propulsion)
      const ring1 = new THREE.Mesh(
        new THREE.TorusGeometry(0.7, 0.02, 16, 64),
        new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: color, emissiveIntensity: 0.5 })
      );
      ring1.rotation.x = Math.PI / 2;
      ring1.position.set(0, -0.2, 0);
      g.add(ring1);
      
      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(0.85, 0.01, 16, 64),
        new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.9 })
      );
      ring2.rotation.x = Math.PI / 2;
      ring2.position.set(0, -0.3, 0);
      g.add(ring2);

      // Antenna
      const antenna = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.3, 8),
        new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.9 })
      );
      antenna.position.set(0, 0.6, 0);
      g.add(antenna);
      
      const tip = new THREE.Mesh(
        new THREE.SphereGeometry(0.06, 16, 16),
        new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 1 })
      );
      tip.position.set(0, 0.75, 0);
      g.add(tip);

      // attach userData for raycasting + drive
      g.userData = { id: def.id, label: def.label, color, angle: def.angle, picked: false, hover: false };
      scene.add(g);
      return g;
    });

    // tether line to core (when an agent is picked)
    const tetherGeo = new THREE.BufferGeometry();
    tetherGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
    const tetherMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0 });
    const tether = new THREE.Line(tetherGeo, tetherMat);
    scene.add(tether);

    // ─── EMR sheets ─────────────────────────────────────────────
    type Sheet = { g: THREE.Group; baseY: number; baseRot: number; phase: number };
    const sheets: Sheet[] = [];
    const sheetDefs = [
      { x: -6, y: 1.6, z: -3, rot: -0.18, accent: '--brand-teal' },
      { x: 5.5, y: -1.4, z: -4, rot: 0.22, accent: '--brand-orange' },
      { x: 6.5, y: 2.2, z: -2, rot: -0.1, accent: '--brand-yellow' },
      { x: -5, y: -2.0, z: -2, rot: 0.12, accent: '--brand-acid' },
    ];
    for (const s of sheetDefs) {
      const accent = readVar(s.accent, '#00e0c7');
      const g = new THREE.Group();
      const paper = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 2.1, 0.04),
        new THREE.MeshStandardMaterial({ color: 0xffffff }),
      );
      paper.add(
        new THREE.LineSegments(
          new THREE.EdgesGeometry(paper.geometry),
          new THREE.LineBasicMaterial({ color: INK }),
        ),
      );
      g.add(paper);
      // title bar
      const title = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 0.14, 0.005),
        new THREE.MeshStandardMaterial({ color: accent }),
      );
      title.position.set(-0.2, 0.7, 0.025);
      g.add(title);
      // text rows
      [0.5, 0.3, 0.1, -0.1, -0.3, -0.55].forEach((ly) => {
        const row = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 0.05, 0.005),
          new THREE.MeshStandardMaterial({ color: INK }),
        );
        row.position.set(-0.1, ly, 0.025);
        g.add(row);
      });
      // stamp
      const stamp = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.18, 0.005),
        new THREE.MeshStandardMaterial({ color: accent }),
      );
      stamp.position.set(0.55, 0.85, 0.03);
      g.add(stamp);

      g.position.set(s.x, s.y, s.z);
      g.rotation.z = s.rot;
      scene.add(g);
      sheets.push({ g, baseY: s.y, baseRot: s.rot, phase: s.x });
    }

    // ─── Test tubes ─────────────────────────────────────────────
    type Tube = { g: THREE.Group; baseY: number; phase: number };
    const tubes: Tube[] = [];
    for (const t of [
      { x: -3.5, y: -0.6, z: 2 },
      { x: 3.2, y: 0.4, z: 1.8 },
    ]) {
      const tealCol = readVar('--brand-teal', '#00e0c7');
      const g = new THREE.Group();
      const glass = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 1.4, 16),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.28,
          roughness: 0.1,
          metalness: 0.2,
        }),
      );
      glass.add(
        new THREE.LineSegments(
          new THREE.EdgesGeometry(glass.geometry),
          new THREE.LineBasicMaterial({ color: INK }),
        ),
      );
      g.add(glass);

      const fluid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.16, 0.7, 16),
        new THREE.MeshStandardMaterial({
          color: tealCol,
          emissive: tealCol,
          emissiveIntensity: 0.4,
        }),
      );
      fluid.position.set(0, -0.25, 0);
      g.add(fluid);

      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 0.16, 16),
        new THREE.MeshStandardMaterial({ color: INK }),
      );
      cap.position.set(0, 0.78, 0);
      g.add(cap);

      g.position.set(t.x, t.y, t.z);
      scene.add(g);
      tubes.push({ g, baseY: t.y, phase: t.x });
    }

    // ─── Ground grid ────────────────────────────────────────────
    const grid = new THREE.GridHelper(40, 40, INK, INK);
    grid.position.y = -3;
    (grid.material as THREE.Material).opacity = 0.35;
    (grid.material as THREE.Material).transparent = true;
    scene.add(grid);

    // ─── Interaction ────────────────────────────────────────────
    const pointer = new THREE.Vector2();
    const ndc = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    let pickedId: string | null = null;
    let hoveredId: string | null = null;

    const onPointerMove = (e: PointerEvent) => {
      const r = renderer.domElement.getBoundingClientRect();
      ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      pointer.x = ndc.x;
      pointer.y = ndc.y;
    };

    const onClick = () => {
      if (hoveredId) {
        pickedId = pickedId === hoveredId ? null : hoveredId;
      }
    };

    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('click', onClick);

    // Resize
    const onResize = () => {
      if (!mount) return;
      camera.aspect = width() / height();
      camera.updateProjectionMatrix();
      renderer.setSize(width(), height());
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    // ─── Animation loop ─────────────────────────────────────────
    const clock = new THREE.Clock();
    let raf = 0;
    const tmpCamTarget = new THREE.Vector3(0, 0, 0);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      const dt = Math.min(clock.getDelta(), 0.05);

      // core spin
      coreMesh.rotation.y += dt * 0.4;
      coreMesh.rotation.x += dt * 0.15;
      electronGroup.rotation.y -= dt * 0.6;
      coreGroup.position.y = Math.sin(t * 0.8) * 0.15;

      // agents orbit
      const radius = 5.2;
      for (const a of agents) {
        const ang = t * 0.25 + (a.userData.angle as number);
        a.position.x = Math.cos(ang) * radius;
        a.position.z = Math.sin(ang) * radius;
        a.position.y = Math.sin(ang * 2) * 0.4;
        a.rotation.y = -ang + Math.PI / 2;
        const isHover = hoveredId === a.userData.id;
        const isPicked = pickedId === a.userData.id;
        const target = isPicked ? 0.75 + Math.sin(t * 6) * 0.05 : isHover ? 0.65 : 0.55;
        const cur = a.scale.x;
        a.scale.setScalar(cur + (target - cur) * 0.18);
      }

      // tether
      if (pickedId) {
        const a = agents.find((x) => x.userData.id === pickedId);
        if (a) {
          const pos = tetherGeo.attributes.position as THREE.BufferAttribute;
          pos.setXYZ(0, 0, coreGroup.position.y, 0);
          pos.setXYZ(1, a.position.x, a.position.y, a.position.z);
          pos.needsUpdate = true;
          tetherMat.color = a.userData.color;
          tetherMat.opacity = 0.9;
        }
      } else {
        tetherMat.opacity = 0;
      }

      // EMR sheets drift
      for (const s of sheets) {
        s.g.position.y = s.baseY + Math.sin(t * 0.6 + s.phase) * 0.25;
        s.g.rotation.z = s.baseRot + Math.sin(t * 0.3 + s.phase) * 0.05;
      }
      // tubes sway
      for (const tu of tubes) {
        tu.g.rotation.z = Math.sin(t * 0.5 + tu.phase) * 0.15;
        tu.g.position.y = tu.baseY + Math.cos(t * 0.4 + tu.phase) * 0.2;
      }

      // Camera follow pointer
      const camTx = pointer.x * 1.4;
      const camTy = -pointer.y * 1.0 + 1.5;
      camera.position.x += (camTx - camera.position.x) * 0.05;
      camera.position.y += (camTy - camera.position.y) * 0.05;
      camera.lookAt(tmpCamTarget);

      // Raycast for hover
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObjects(agents, true);
      const newHover = hits.length ? findAgentRoot(hits[0].object, agents) : null;
      const newHoverId = newHover ? (newHover.userData.id as string) : null;
      if (newHoverId !== hoveredId) {
        hoveredId = newHoverId;
        renderer.domElement.style.cursor = hoveredId ? 'pointer' : 'default';
        if (labelRef.current) {
          if (hoveredId) {
            const a = agents.find((x) => x.userData.id === hoveredId)!;
            labelRef.current.textContent = (a.userData.label as string) +
              (pickedId === hoveredId ? ' · TERHUBUNG' : '');
            labelRef.current.style.opacity = '1';
          } else {
            labelRef.current.style.opacity = '0';
          }
        }
      }
      if (labelRef.current && hoveredId) {
        const a = agents.find((x) => x.userData.id === hoveredId)!;
        const v = a.position.clone().project(camera);
        const r = renderer.domElement.getBoundingClientRect();
        const sx = ((v.x + 1) / 2) * r.width;
        const sy = ((1 - v.y) / 2) * r.height - 60;
        labelRef.current.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -100%)`;
      }

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('click', onClick);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
      scene.traverse((obj) => {
        const m = obj as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        if (m.material) {
          const mats = Array.isArray(m.material) ? m.material : [m.material];
          mats.forEach((mat) => mat.dispose());
        }
      });
    };
  }, []);

  return (
    <div
      className="absolute inset-0 z-0"
      style={{
        maskImage:
          'radial-gradient(ellipse at center, black 0%, black 55%, transparent 90%)',
        WebkitMaskImage:
          'radial-gradient(ellipse at center, black 0%, black 55%, transparent 90%)',
      }}
    >
      <div ref={mountRef} className="absolute inset-0" />
      <div
        ref={labelRef}
        className="absolute top-0 left-0 pointer-events-none"
        style={{
          background: 'var(--brand-ink)',
          color: 'var(--brand-paper)',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          letterSpacing: '0.18em',
          padding: '4px 8px',
          border: '2px solid var(--brand-paper)',
          opacity: 0,
          transition: 'opacity 120ms',
          fontWeight: 700,
          whiteSpace: 'nowrap',
        }}
      />
    </div>
  );
}

function findAgentRoot(obj: THREE.Object3D, agents: THREE.Group[]): THREE.Group | null {
  let cur: THREE.Object3D | null = obj;
  while (cur) {
    if (agents.includes(cur as THREE.Group)) return cur as THREE.Group;
    cur = cur.parent;
  }
  return null;
}
