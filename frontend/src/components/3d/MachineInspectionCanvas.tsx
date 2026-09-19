import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MachineComponentDiagnostic } from '../../types';
import { MACHINE_COMPONENTS } from '../../data/mockData';

interface MachineInspectionCanvasProps {
  machineName?: string;
  selectedComponent: MachineComponentDiagnostic | null;
  onSelectComponent: (comp: MachineComponentDiagnostic) => void;
  onClose?: () => void;
}

export const MachineInspectionCanvas: React.FC<MachineInspectionCanvasProps> = ({
  machineName = '5-Axis CNC Milling Center #04 (Spindle Drive)',
  selectedComponent,
  onSelectComponent,
  onClose
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [explodeFactor, setExplodeFactor] = useState<number>(0.55); // 0 to 1
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [hoveredComp, setHoveredComp] = useState<MachineComponentDiagnostic | null>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const componentMeshesRef = useRef<Map<string, THREE.Object3D>>(new Map());

  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseVecRef = useRef(new THREE.Vector2());

  // Explode animation lerp target
  const currentExplodeRef = useRef(0.55);

  useEffect(() => {
    currentExplodeRef.current = explodeFactor;
  }, [explodeFactor]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f131a);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(6, 4.5, 7);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambient);

    const dir1 = new THREE.DirectionalLight(0x21c47a, 1.2);
    dir1.position.set(8, 12, 6);
    scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0x38bdf8, 0.8);
    dir2.position.set(-6, -4, -6);
    scene.add(dir2);

    // Floor shadow catcher grid
    const grid = new THREE.GridHelper(16, 16, 0x1f2937, 0x111827);
    grid.position.y = -2.5;
    scene.add(grid);

    // Assembly Main Pivot Group
    const assemblyGroup = new THREE.Group();
    scene.add(assemblyGroup);

    componentMeshesRef.current.clear();

    // 1. STATOR HOUSING
    const statorGroup = new THREE.Group();
    statorGroup.userData = { id: 'comp-stator' };
    const statorCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.6, 2.8, 32, 1, true),
      new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.85,
        roughness: 0.25,
        side: THREE.DoubleSide
      })
    );
    statorCylinder.rotation.x = Math.PI / 2;
    statorGroup.add(statorCylinder);

    // Stator outer ribbed fins
    for (let f = 0; f < 8; f++) {
      const fin = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.35, 2.7),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 })
      );
      const angle = (f / 8) * Math.PI * 2;
      fin.position.set(Math.cos(angle) * 1.75, Math.sin(angle) * 1.75, 0);
      fin.rotation.z = angle;
      statorGroup.add(fin);
    }
    assemblyGroup.add(statorGroup);
    componentMeshesRef.current.set('comp-stator', statorGroup);

    // 2. ROTOR CORE
    const rotorGroup = new THREE.Group();
    rotorGroup.userData = { id: 'comp-rotor' };
    const rotor = new THREE.Mesh(
      new THREE.CylinderGeometry(1.15, 1.15, 2.2, 32),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9, roughness: 0.2 })
    );
    rotor.rotation.x = Math.PI / 2;
    rotorGroup.add(rotor);
    assemblyGroup.add(rotorGroup);
    componentMeshesRef.current.set('comp-rotor', rotorGroup);

    // 3. SPINDLE SHAFT
    const shaftGroup = new THREE.Group();
    shaftGroup.userData = { id: 'comp-shaft' };
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 5.6, 32),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.95, roughness: 0.15 })
    );
    shaft.rotation.x = Math.PI / 2;
    shaftGroup.add(shaft);

    // Tool collet on shaft tip
    const collet = new THREE.Mesh(
      new THREE.CylinderGeometry(0.55, 0.42, 0.6, 24),
      new THREE.MeshStandardMaterial({ color: 0x22c55e, metalness: 0.8, roughness: 0.2 })
    );
    collet.rotation.x = Math.PI / 2;
    collet.position.z = 2.8;
    shaftGroup.add(collet);

    assemblyGroup.add(shaftGroup);
    componentMeshesRef.current.set('comp-shaft', shaftGroup);

    // 4. BEARING #01 (Front)
    const b1Group = new THREE.Group();
    b1Group.userData = { id: 'comp-bearing-01' };
    const b1Torus = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.22, 16, 32),
      new THREE.MeshStandardMaterial({ color: 0x38e08a, metalness: 0.9, roughness: 0.2 })
    );
    b1Group.add(b1Torus);
    assemblyGroup.add(b1Group);
    componentMeshesRef.current.set('comp-bearing-01', b1Group);

    // 5. BEARING #02 (Rear - DEGRADED VIBRATION ANOMALY)
    const b2Group = new THREE.Group();
    b2Group.userData = { id: 'comp-bearing-02' };
    const b2Torus = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.22, 16, 32),
      new THREE.MeshStandardMaterial({
        color: 0xef4444, // Critical red highlight
        emissive: 0xef4444,
        emissiveIntensity: 0.7,
        metalness: 0.9,
        roughness: 0.2
      })
    );
    b2Group.add(b2Torus);

    // Warning marker ring for degraded bearing
    const b2Warning = new THREE.Mesh(
      new THREE.RingGeometry(0.95, 1.15, 32),
      new THREE.MeshBasicMaterial({ color: 0xef4444, side: THREE.DoubleSide })
    );
    b2Warning.position.z = 0.05;
    b2Group.add(b2Warning);

    assemblyGroup.add(b2Group);
    componentMeshesRef.current.set('comp-bearing-02', b2Group);

    // 6. COOLING FAN (Rear Impeller)
    const fanGroup = new THREE.Group();
    fanGroup.userData = { id: 'comp-cooling-fan' };
    const fanHub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.48, 0.3, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 })
    );
    fanHub.rotation.x = Math.PI / 2;
    fanGroup.add(fanHub);

    for (let b = 0; b < 10; b++) {
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.7, 0.25),
        new THREE.MeshStandardMaterial({ color: 0x21c47a, metalness: 0.6 })
      );
      const angle = (b / 10) * Math.PI * 2;
      blade.position.set(Math.cos(angle) * 0.75, Math.sin(angle) * 0.75, 0);
      blade.rotation.z = angle + 0.3;
      fanGroup.add(blade);
    }
    assemblyGroup.add(fanGroup);
    componentMeshesRef.current.set('comp-cooling-fan', fanGroup);

    // 7. TEMPERATURE SENSOR (PT100)
    const tempSensorGroup = new THREE.Group();
    tempSensorGroup.userData = { id: 'comp-sensor-temp' };
    const tempProbe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.6, 12),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 })
    );
    tempProbe.position.y = 0.3;
    tempSensorGroup.add(tempProbe);
    assemblyGroup.add(tempSensorGroup);
    componentMeshesRef.current.set('comp-sensor-temp', tempSensorGroup);

    // 8. VIBRATION SENSOR (Triaxial Accelerometer)
    const vibSensorGroup = new THREE.Group();
    vibSensorGroup.userData = { id: 'comp-sensor-vib' };
    const vibCube = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.35, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.1 })
    );
    vibSensorGroup.add(vibCube);
    assemblyGroup.add(vibSensorGroup);
    componentMeshesRef.current.set('comp-sensor-vib', vibSensorGroup);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Auto rotation
      if (autoRotate && !isDraggingRef.current) {
        assemblyGroup.rotation.y += 0.005;
      }

      // Update exploded positions based on current factor
      const factor = currentExplodeRef.current;
      MACHINE_COMPONENTS.forEach((comp) => {
        const mesh = componentMeshesRef.current.get(comp.id);
        if (mesh) {
          const [ox, oy, oz] = comp.offsetExploded;
          mesh.position.set(ox * factor, oy * factor, oz * factor);
        }
      });

      // Bearing #02 pulse
      const b2Mesh = componentMeshesRef.current.get('comp-bearing-02');
      if (b2Mesh) {
        const torus = b2Mesh.children[0] as THREE.Mesh;
        if (torus && (torus.material as any).emissiveIntensity !== undefined) {
          (torus.material as any).emissiveIntensity = 0.5 + Math.sin(time * 6) * 0.4;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [autoRotate]);

  // Orbit drag interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = false;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container || !cameraRef.current) return;

    const dx = Math.abs(e.clientX - prevMouseRef.current.x);
    const dy = Math.abs(e.clientY - prevMouseRef.current.y);
    if (dx > 3 || dy > 3) {
      isDraggingRef.current = true;
    }

    if (e.buttons === 1 && isDraggingRef.current) {
      const deltaX = e.clientX - prevMouseRef.current.x;
      const deltaY = e.clientY - prevMouseRef.current.y;
      prevMouseRef.current = { x: e.clientX, y: e.clientY };

      const cam = cameraRef.current;
      const radius = cam.position.length();
      let theta = Math.atan2(cam.position.x, cam.position.z);
      let phi = Math.acos(Math.max(0.1, Math.min(1.8, cam.position.y / radius)));

      theta -= deltaX * 0.01;
      phi = Math.max(0.2, Math.min(Math.PI / 2.1, phi - deltaY * 0.01));

      cam.position.x = radius * Math.sin(phi) * Math.sin(theta);
      cam.position.y = radius * Math.cos(phi);
      cam.position.z = radius * Math.sin(phi) * Math.cos(theta);
      cam.lookAt(0, 0, 0);
      return;
    }

    // Raycast check
    const rect = container.getBoundingClientRect();
    mouseVecRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVecRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycasterRef.current.setFromCamera(mouseVecRef.current, cameraRef.current);

    const objects: THREE.Object3D[] = [];
    componentMeshesRef.current.forEach((group) => {
      objects.push(...group.children);
    });

    const hits = raycasterRef.current.intersectObjects(objects, true);
    if (hits.length > 0) {
      let cur: THREE.Object3D | null = hits[0].object;
      while (cur && !cur.userData?.id) {
        cur = cur.parent;
      }
      if (cur && cur.userData?.id) {
        const found = MACHINE_COMPONENTS.find((c) => c.id === cur.userData.id);
        setHoveredComp(found || null);
        return;
      }
    }
    setHoveredComp(null);
  };

  const handleMouseUp = () => {
    if (!isDraggingRef.current && hoveredComp) {
      onSelectComponent(hoveredComp);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!cameraRef.current) return;
    const factor = e.deltaY > 0 ? 1.08 : 0.92;
    const newLen = THREE.MathUtils.clamp(cameraRef.current.position.length() * factor, 3.5, 18);
    cameraRef.current.position.setLength(newLen);
  };

  const resetView = () => {
    if (!cameraRef.current) return;
    cameraRef.current.position.set(6, 4.5, 7);
    cameraRef.current.lookAt(0, 0, 0);
    setExplodeFactor(0.55);
  };

  return (
    <div id="fantom-machine-inspection-root" className="flex flex-col lg:flex-row gap-4 h-full">
      {/* 3D Viewport */}
      <div className="flex-1 relative rounded-xl overflow-hidden border border-[#232C3B] bg-[#0F131A] min-h-[420px]">
        <div
          ref={containerRef}
          className="w-full h-full cursor-grab active:cursor-grabbing select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        />

        {/* Header HUD */}
        <div className="absolute top-3 left-3 pointer-events-none">
          <span className="text-[10px] font-mono tracking-widest text-[#38E08A] uppercase">3D TELEMETRY TWIN</span>
          <h3 className="text-white font-bold text-sm">{machineName}</h3>
        </div>

        {/* Viewport Action Controls */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-[#171D27]/90 backdrop-blur-md border border-[#2C384A] p-1.5 rounded-lg text-xs font-mono">
          <button
            id="btn-toggle-autorotate"
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2 py-1 rounded transition-colors ${autoRotate ? 'bg-[#21C47A]/20 text-[#38E08A]' : 'text-slate-400 hover:text-slate-200'}`}
          >
            {autoRotate ? 'Rotate: ON' : 'Rotate: OFF'}
          </button>
          <button
            id="btn-reset-inspection-view"
            onClick={resetView}
            className="px-2 py-1 rounded text-slate-300 hover:bg-[#252E3E] transition-colors"
          >
            Reset
          </button>
          {onClose && (
            <button
              id="btn-close-inspection"
              onClick={onClose}
              className="px-2 py-1 rounded text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Exit
            </button>
          )}
        </div>

        {/* Explode Slider Floating Dock */}
        <div className="absolute bottom-4 left-4 right-4 max-w-md bg-[#171D27]/90 backdrop-blur-md border border-[#2C384A] px-4 py-2.5 rounded-lg flex items-center gap-4 text-xs font-mono text-slate-300">
          <span className="text-[11px] text-[#38E08A] font-bold whitespace-nowrap">EXPLODE VIEW:</span>
          <input
            id="slider-explode-view"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={explodeFactor}
            onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
            className="w-full accent-[#21C47A] cursor-pointer"
          />
          <span className="w-10 text-right font-bold text-slate-100">{(explodeFactor * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Component Intelligence Sidebar */}
      <div className="w-full lg:w-80 flex flex-col gap-3">
        {/* Component Selector Pills */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
          <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-semibold">
            Sub-Assembly Components ({MACHINE_COMPONENTS.length})
          </h4>
          <div className="grid grid-cols-2 gap-1.5">
            {MACHINE_COMPONENTS.map((comp) => {
              const isSelected = selectedComponent?.id === comp.id;
              const isDegraded = comp.condition === 'Degraded';
              return (
                <button
                  key={comp.id}
                  id={`btn-component-${comp.id}`}
                  onClick={() => onSelectComponent(comp)}
                  className={`px-2.5 py-1.5 text-left rounded-lg text-xs font-sans transition-all border ${
                    isSelected
                      ? 'border-[#159A62] bg-[#159A62]/10 text-[#159A62] font-semibold'
                      : isDegraded
                      ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'
                      : 'border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{comp.name.split(' ')[0]}</span>
                    {isDegraded && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Component Intelligence Card */}
        {selectedComponent ? (
          <div
            id="component-intelligence-card"
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex-1 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  COMPONENT INTELLIGENCE
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    selectedComponent.condition === 'Degraded'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {selectedComponent.condition}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base mt-2">{selectedComponent.name}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{selectedComponent.role}</p>

              {/* Diagnostic Metrics Matrix */}
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Health Score</span>
                  <p
                    className={`font-mono font-bold text-lg ${
                      selectedComponent.healthScore < 75 ? 'text-red-600' : 'text-emerald-600'
                    }`}
                  >
                    {selectedComponent.healthScore}%
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Temperature</span>
                  <p
                    className={`font-mono font-bold text-lg ${
                      selectedComponent.temperatureCelsius > 50 ? 'text-red-600' : 'text-slate-800'
                    }`}
                  >
                    {selectedComponent.temperatureCelsius}°C
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Vibration RMS</span>
                  <p
                    className={`font-mono font-bold text-lg ${
                      selectedComponent.vibrationMmSec > 4.5 ? 'text-red-600' : 'text-slate-800'
                    }`}
                  >
                    {selectedComponent.vibrationMmSec} mm/s
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] font-mono uppercase text-slate-400">Wear Profile</span>
                  <p className="font-mono font-bold text-lg text-slate-800">{selectedComponent.wearPct}%</p>
                </div>
              </div>

              {/* Anomaly Callout */}
              {selectedComponent.diagnosticAnomaly ? (
                <div className="mt-4 p-3 bg-red-50/80 border border-red-200 rounded-lg text-xs text-red-800">
                  <span className="font-bold flex items-center gap-1.5 text-red-900 mb-1">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    Detected Sub-Harmonic Anomaly
                  </span>
                  <p>{selectedComponent.diagnosticAnomaly}</p>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                  <span className="font-bold flex items-center gap-1.5 text-emerald-900 mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Nominal Operational Signature
                  </span>
                  <p>Operating within standard tolerances. No mechanical harmonic anomalies detected.</p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Status: Synchronized</span>
              <span>Ref ID: {selectedComponent.id}</span>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-slate-400 text-xs flex-1 flex flex-col justify-center items-center">
            <p>Select any component in the 3D viewport or from the list above to inspect internal diagnostics.</p>
          </div>
        )}
      </div>
    </div>
  );
};
