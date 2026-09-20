import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { StationTelemetry, StationStatus } from '../../types';

interface FactoryCanvasProps {
  stations: StationTelemetry[];
  selectedStationId: string | null;
  onSelectStation: (id: string) => void;
  workerNavigating?: boolean;
  workerTargetStation?: string;
  onWorkerArrived?: () => void;
  cameraPreset?: 'overview' | 'bottleneck' | 'inspection' | 'top';
}

export const FactoryCanvas: React.FC<FactoryCanvasProps> = ({
  stations,
  selectedStationId,
  onSelectStation,
  workerNavigating = false,
  workerTargetStation = 'S03',
  onWorkerArrived,
  cameraPreset = 'overview'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredStation, setHoveredStation] = useState<StationTelemetry | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // References for Three.js state
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const stationMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const movingPartsRef = useRef<THREE.Mesh[]>([]);
  const workerMeshRef = useRef<THREE.Group | null>(null);
  const targetCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 18, 28));
  const targetCamLookRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0));
  const robotArmRef = useRef<THREE.Group | null>(null);
  const spindleRef = useRef<THREE.Mesh | null>(null);
  const scanLaserRef = useRef<THREE.Mesh | null>(null);

  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseVecRef = useRef(new THREE.Vector2());

  // Handle camera presets
  useEffect(() => {
    if (cameraPreset === 'overview') {
      targetCamPosRef.current.set(0, 18, 28);
      targetCamLookRef.current.set(0, 0, 0);
    } else if (cameraPreset === 'bottleneck') {
      targetCamPosRef.current.set(-2, 10, 14);
      targetCamLookRef.current.set(-2, 1.5, 0);
    } else if (cameraPreset === 'inspection') {
      targetCamPosRef.current.set(10, 10, 14);
      targetCamLookRef.current.set(10, 1.5, 0);
    } else if (cameraPreset === 'top') {
      targetCamPosRef.current.set(0, 32, 2);
      targetCamLookRef.current.set(0, 0, 0);
    }
  }, [cameraPreset]);

  // Selected station zoom
  useEffect(() => {
    if (selectedStationId) {
      const st = stations.find((s) => s.id === selectedStationId);
      if (st) {
        targetCamPosRef.current.set(st.position3D[0], 9, 14);
        targetCamLookRef.current.set(st.position3D[0], 1.5, 0);
      }
    }
  }, [selectedStationId, stations]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x11141b); // Industrial Dark Charcoal
    scene.fog = new THREE.FogExp2(0x11141b, 0.015);
    sceneRef.current = scene;

    // 2. Camera Setup
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(0, 18, 28);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xdde5ed, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(20, 35, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.camera.left = -25;
    dirLight.shadow.camera.right = 25;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    scene.add(dirLight);

    const softFillLight = new THREE.DirectionalLight(0x21c47a, 0.35); // subtle primary glow
    softFillLight.position.set(-20, 15, -10);
    scene.add(softFillLight);

    // 5. Factory Floor with grid and zone markings
    const floorGeo = new THREE.PlaneGeometry(64, 36);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x141822,
      roughness: 0.85,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid helper
    const grid = new THREE.GridHelper(64, 32, 0x223040, 0x1a2330);
    grid.position.y = 0.01;
    scene.add(grid);

    // Zone demarcation lines
    const zoneLineMat = new THREE.LineDashedMaterial({
      color: 0x21c47a,
      dashSize: 1,
      gapSize: 0.5,
      opacity: 0.4,
      transparent: true
    });
    [-11, -5, 1, 7, 13].forEach((xPos) => {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(xPos, 0.02, -14),
        new THREE.Vector3(xPos, 0.02, 14)
      ]);
      const line = new THREE.Line(lineGeo, zoneLineMat);
      line.computeLineDistances();
      scene.add(line);
    });

    // 6. Production Conveyor System connecting S01 -> S06
    const conveyorLength = 34;
    const conveyorGeo = new THREE.BoxGeometry(conveyorLength, 0.6, 1.4);
    const conveyorMat = new THREE.MeshStandardMaterial({
      color: 0x1e2430,
      metalness: 0.7,
      roughness: 0.4
    });
    const conveyor = new THREE.Mesh(conveyorGeo, conveyorMat);
    conveyor.position.set(1, 0.3, 0);
    conveyor.receiveShadow = true;
    scene.add(conveyor);

    // Conveyor side rails
    const railMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    const rail1 = new THREE.Mesh(new THREE.BoxGeometry(conveyorLength, 0.2, 0.08), railMat);
    rail1.position.set(1, 0.7, 0.7);
    const rail2 = new THREE.Mesh(new THREE.BoxGeometry(conveyorLength, 0.2, 0.08), railMat);
    rail2.position.set(1, 0.7, -0.7);
    scene.add(rail1);
    scene.add(rail2);

    // Conveyor support legs
    for (let lx = -14; lx <= 16; lx += 4) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.6, 8), railMat);
      leg.position.set(lx, 0.3, 0.6);
      scene.add(leg);
      const leg2 = leg.clone();
      leg2.position.z = -0.6;
      scene.add(leg2);
    }

    // Moving Workpieces / Pallets on conveyor
    const partsGroup: THREE.Mesh[] = [];
    for (let p = 0; p < 10; p++) {
      const palletGeo = new THREE.BoxGeometry(0.9, 0.16, 0.9);
      const palletMat = new THREE.MeshStandardMaterial({ color: 0x384252, metalness: 0.5 });
      const pallet = new THREE.Mesh(palletGeo, palletMat);

      // Add a metallic cylinder part on pallet
      const partGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.45, 16);
      const partMat = new THREE.MeshStandardMaterial({
        color: 0x21c47a,
        metalness: 0.85,
        roughness: 0.25
      });
      const part = new THREE.Mesh(partGeo, partMat);
      part.position.y = 0.3;
      pallet.add(part);

      pallet.position.set(-15 + p * 3.4, 0.68, 0);
      pallet.castShadow = true;
      scene.add(pallet);
      partsGroup.push(pallet);
    }
    movingPartsRef.current = partsGroup;

    // 7. Build 3D Machines for each Station
    stationMeshesRef.current.clear();

    stations.forEach((st) => {
      const stationGroup = new THREE.Group();
      stationGroup.position.set(st.position3D[0], st.position3D[1], st.position3D[2]);
      stationGroup.userData = { stationId: st.id, telemetry: st };

      // Base footprint platform with state border
      const baseGeo = new THREE.BoxGeometry(3.6, 0.15, 3.8);
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x1f2735,
        roughness: 0.6,
        metalness: 0.4
      });
      const baseMesh = new THREE.Mesh(baseGeo, baseMat);
      baseMesh.position.y = 0.08;
      baseMesh.receiveShadow = true;
      stationGroup.add(baseMesh);

      // Station Specific Hardware Visualization
      if (st.id === 'S01') {
        // Material Infeed Station: Billet Racks & Feeder
        const rackGeo = new THREE.BoxGeometry(2.2, 3.2, 1.4);
        const rackMat = new THREE.MeshStandardMaterial({ color: 0x2c3545, metalness: 0.6 });
        const rack = new THREE.Mesh(rackGeo, rackMat);
        rack.position.set(0, 1.6, -1.2);
        rack.castShadow = true;
        stationGroup.add(rack);

        // Raw billet cylinders on feeder
        for (let b = 0; b < 3; b++) {
          const billet = new THREE.Mesh(
            new THREE.CylinderGeometry(0.25, 0.25, 1.2, 16),
            new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9, roughness: 0.2 })
          );
          billet.rotation.x = Math.PI / 2;
          billet.position.set(-0.6 + b * 0.6, 1.2, 1.0);
          stationGroup.add(billet);
        }
      } else if (st.id === 'S02') {
        // Turning Lathe #02
        const latheBodyGeo = new THREE.BoxGeometry(2.8, 2.4, 2.0);
        const latheBodyMat = new THREE.MeshStandardMaterial({ color: 0x222b3a, metalness: 0.7, roughness: 0.3 });
        const latheBody = new THREE.Mesh(latheBodyGeo, latheBodyMat);
        latheBody.position.set(0, 1.2, -1.0);
        latheBody.castShadow = true;
        stationGroup.add(latheBody);

        const chuck = new THREE.Mesh(
          new THREE.CylinderGeometry(0.5, 0.5, 0.6, 24),
          new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 })
        );
        chuck.rotation.z = Math.PI / 2;
        chuck.position.set(-0.4, 1.4, 0.2);
        stationGroup.add(chuck);
      } else if (st.id === 'S03') {
        // 5-Axis CNC Milling Center #04 (BOTTLENECK)
        // Main enclosure
        const cncGeo = new THREE.BoxGeometry(3.2, 3.6, 2.6);
        const cncMat = new THREE.MeshStandardMaterial({ color: 0x1b2230, metalness: 0.8, roughness: 0.3 });
        const cnc = new THREE.Mesh(cncGeo, cncMat);
        cnc.position.set(0, 1.8, -1.0);
        cnc.castShadow = true;
        stationGroup.add(cnc);

        // Glass window with dark tint
        const windowGeo = new THREE.PlaneGeometry(1.8, 1.6);
        const windowMat = new THREE.MeshPhysicalMaterial({
          color: 0x38e08a,
          transparent: true,
          opacity: 0.35,
          roughness: 0.1,
          metalness: 0.1,
          transmission: 0.8
        });
        const win = new THREE.Mesh(windowGeo, windowMat);
        win.position.set(0, 2.0, 0.31);
        stationGroup.add(win);

        // Spindle tool inside
        const spindle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.08, 1.2, 16),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 })
        );
        spindle.position.set(0, 1.9, -0.4);
        stationGroup.add(spindle);
        spindleRef.current = spindle;

        // Visual Queue accumulation buffer next to S03
        const queuePalletGeo = new THREE.BoxGeometry(1.8, 0.2, 1.8);
        const queuePallet = new THREE.Mesh(queuePalletGeo, new THREE.MeshStandardMaterial({ color: 0xef4444 }));
        queuePallet.position.set(-1.6, 0.1, 1.8);
        stationGroup.add(queuePallet);

        // Stack of waiting parts representing 142 units in queue
        for (let q = 0; q < 8; q++) {
          const qPart = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 0.3, 12),
            new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7 })
          );
          const col = q % 4;
          const row = Math.floor(q / 4);
          qPart.position.set(-2.0 + (col % 2) * 0.6, 0.3 + row * 0.35, 1.4 + Math.floor(col / 2) * 0.6);
          stationGroup.add(qPart);
        }
      } else if (st.id === 'S04') {
        // Robotic Deburring & Finishing Station
        const robotBase = new THREE.Mesh(
          new THREE.CylinderGeometry(0.6, 0.7, 0.8, 24),
          new THREE.MeshStandardMaterial({ color: 0x242d3c, metalness: 0.8 })
        );
        robotBase.position.set(0, 0.4, -1.2);
        stationGroup.add(robotBase);

        // Articulated robotic arm
        const armGroup = new THREE.Group();
        armGroup.position.set(0, 0.8, -1.2);

        const lowerArm = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 1.6, 0.3),
          new THREE.MeshStandardMaterial({ color: 0x21c47a, metalness: 0.5 })
        );
        lowerArm.position.y = 0.8;
        armGroup.add(lowerArm);

        const upperArm = new THREE.Mesh(
          new THREE.BoxGeometry(0.24, 1.4, 0.24),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7 })
        );
        upperArm.position.set(0, 1.8, 0.6);
        upperArm.rotation.x = Math.PI / 4;
        armGroup.add(upperArm);

        stationGroup.add(armGroup);
        robotArmRef.current = armGroup;
      } else if (st.id === 'S05') {
        // Multi-Spectral Optical Inspection Portal (AOI)
        const archGeo = new THREE.BoxGeometry(0.4, 3.0, 2.2);
        const archMat = new THREE.MeshStandardMaterial({ color: 0x1f2735, metalness: 0.8 });
        const archLeft = new THREE.Mesh(archGeo, archMat);
        archLeft.position.set(-0.8, 1.5, 0);
        const archRight = new THREE.Mesh(archGeo, archMat);
        archRight.position.set(0.8, 1.5, 0);
        const archTop = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.4, 2.2), archMat);
        archTop.position.set(0, 3.0, 0);

        stationGroup.add(archLeft);
        stationGroup.add(archRight);
        stationGroup.add(archTop);

        // Glowing Laser Scanner Plane
        const laserGeo = new THREE.PlaneGeometry(1.6, 1.8);
        const laserMat = new THREE.MeshBasicMaterial({
          color: 0x38e08a,
          transparent: true,
          opacity: 0.45,
          side: THREE.DoubleSide
        });
        const laser = new THREE.Mesh(laserGeo, laserMat);
        laser.rotation.y = Math.PI / 2;
        laser.position.set(0, 1.4, 0);
        stationGroup.add(laser);
        scanLaserRef.current = laser;
      } else if (st.id === 'S06') {
        // Packaging & AGV Palletizing
        const packCell = new THREE.Mesh(
          new THREE.BoxGeometry(2.6, 2.6, 2.0),
          new THREE.MeshStandardMaterial({ color: 0x242d3c, metalness: 0.7 })
        );
        packCell.position.set(0, 1.3, -1.0);
        stationGroup.add(packCell);

        // Finished cargo boxes
        for (let bx = 0; bx < 4; bx++) {
          const box = new THREE.Mesh(
            new THREE.BoxGeometry(0.7, 0.6, 0.7),
            new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 })
          );
          box.position.set(-0.6 + (bx % 2) * 0.8, 0.3 + Math.floor(bx / 2) * 0.65, 1.2);
          stationGroup.add(box);
        }

        // AGV autonomous cart
        const agvGeo = new THREE.BoxGeometry(1.4, 0.4, 1.0);
        const agvMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, metalness: 0.6 });
        const agv = new THREE.Mesh(agvGeo, agvMat);
        agv.position.set(1.6, 0.2, 1.8);
        stationGroup.add(agv);
      }

      // Status Beacon Light atop each machine
      const beaconGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.4, 16);
      let beaconColor = 0x22c55e;
      if (st.status === 'CRITICAL') beaconColor = 0xef4444;
      if (st.status === 'WARNING') beaconColor = 0xf59e0b;

      const beaconMat = new THREE.MeshStandardMaterial({
        color: beaconColor,
        emissive: beaconColor,
        emissiveIntensity: st.status === 'CRITICAL' ? 1.6 : 0.8,
        roughness: 0.2
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 3.8, -1.0);
      stationGroup.add(beacon);

      // Station ID label pillar
      const labelPole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8),
        new THREE.MeshStandardMaterial({ color: 0x64748b })
      );
      labelPole.position.set(0, 3.2, -1.0);
      stationGroup.add(labelPole);

      scene.add(stationGroup);
      stationMeshesRef.current.set(st.id, stationGroup);
    });

    // 8. Animated Autonomous Worker (Mechatronics Specialist Elena)
    const workerGroup = new THREE.Group();
    workerGroup.position.set(12, 0, 8); // Starts near entrance / Zone C

    // Worker body (stylized low-poly industrial specialist)
    const workerTorso = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.9, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x159a62 }) // High-vis industrial teal
    );
    workerTorso.position.y = 1.0;
    workerGroup.add(workerTorso);

    const workerHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xfde047 }) // Safety hardhat yellow
    );
    workerHead.position.y = 1.65;
    workerGroup.add(workerHead);

    const workerLegs = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.8, 0.25),
      new THREE.MeshStandardMaterial({ color: 0x1f2937 })
    );
    workerLegs.position.y = 0.4;
    workerGroup.add(workerLegs);

    // Worker status circle under feet
    const workerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.45, 0.6, 24),
      new THREE.MeshBasicMaterial({ color: 0x38e08a, side: THREE.DoubleSide })
    );
    workerRing.rotation.x = -Math.PI / 2;
    workerRing.position.y = 0.05;
    workerGroup.add(workerRing);

    scene.add(workerGroup);
    workerMeshRef.current = workerGroup;

    // 9. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth Camera Lerp
      camera.position.lerp(targetCamPosRef.current, 0.05);
      const currentLook = new THREE.Vector3();
      camera.getWorldDirection(currentLook);
      // smoothly adjust target look
      camera.lookAt(targetCamLookRef.current);

      // Move conveyor parts
      movingPartsRef.current.forEach((pallet, idx) => {
        pallet.position.x += 0.035;
        if (pallet.position.x > 18) {
          pallet.position.x = -16;
        }
      });

      // Animate S04 robotic arm
      if (robotArmRef.current) {
        robotArmRef.current.rotation.y = Math.sin(elapsedTime * 1.8) * 0.6;
      }

      // Rotate S03 CNC spindle
      if (spindleRef.current) {
        spindleRef.current.rotation.y += 0.25;
      }

      // Animate S05 Optical Laser Scan
      if (scanLaserRef.current) {
        scanLaserRef.current.position.z = Math.sin(elapsedTime * 3.5) * 0.8;
      }

      // Pulse S03 beacon if critical
      const s03Group = stationMeshesRef.current.get('S03');
      if (s03Group) {
        const beacon = s03Group.children.find((c) => c instanceof THREE.Mesh && c.material && (c.material as any).emissive);
        if (beacon && (beacon as any).material) {
          (beacon as any).material.emissiveIntensity = 1.0 + Math.sin(elapsedTime * 6.0) * 0.8;
        }
      }

      // Worker Navigation Animation
      if (workerNavigating && workerMeshRef.current) {
        const targetX = -2; // CNC-04 position
        const targetZ = 3.5;
        const currentPos = workerMeshRef.current.position;

        const dx = targetX - currentPos.x;
        const dz = targetZ - currentPos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist > 0.3) {
          currentPos.x += (dx / dist) * 0.08;
          currentPos.z += (dz / dist) * 0.08;
          workerMeshRef.current.rotation.y = Math.atan2(dx, dz);
          // walking bobbing motion
          workerMeshRef.current.position.y = Math.abs(Math.sin(elapsedTime * 10)) * 0.12;
        } else {
          if (onWorkerArrived) {
            onWorkerArrived();
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 10. Resize handling
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 800;
      const newH = container.clientHeight || 500;
      if (newW > 0 && newH > 0) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [stations, workerNavigating, onWorkerArrived]);

  // Mouse drag & click detection on stations
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = false;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container || !cameraRef.current || !sceneRef.current) return;

    const dx = Math.abs(e.clientX - previousMousePositionRef.current.x);
    const dy = Math.abs(e.clientY - previousMousePositionRef.current.y);
    if (dx > 3 || dy > 3) {
      isDraggingRef.current = true;
    }

    // Right or Left drag to orbit
    if (e.buttons === 1 && isDraggingRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };

      const cam = cameraRef.current;
      const radius = cam.position.distanceTo(targetCamLookRef.current);
      let theta = Math.atan2(cam.position.x, cam.position.z);
      let phi = Math.acos(Math.max(0.1, Math.min(1.8, cam.position.y / radius)));

      theta -= deltaX * 0.008;
      phi = Math.max(0.2, Math.min(Math.PI / 2.2, phi - deltaY * 0.008));

      targetCamPosRef.current.x = targetCamLookRef.current.x + radius * Math.sin(phi) * Math.sin(theta);
      targetCamPosRef.current.y = targetCamLookRef.current.y + radius * Math.cos(phi);
      targetCamPosRef.current.z = targetCamLookRef.current.z + radius * Math.sin(phi) * Math.cos(theta);
      return;
    }

    // Raycast for hover tooltips
    const rect = container.getBoundingClientRect();
    mouseVecRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseVecRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseVecRef.current, cameraRef.current);
    const stationObjects: THREE.Object3D[] = [];
    stationMeshesRef.current.forEach((mesh) => stationObjects.push(mesh));

    const intersects = raycasterRef.current.intersectObjects(stationObjects, true);
    if (intersects.length > 0) {
      let current: THREE.Object3D | null = intersects[0].object;
      while (current && !current.userData?.stationId) {
        current = current.parent;
      }
      if (current && current.userData?.telemetry) {
        setHoveredStation(current.userData.telemetry);
        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        return;
      }
    }
    setHoveredStation(null);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDraggingRef.current && hoveredStation) {
      onSelectStation(hoveredStation.id);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!cameraRef.current) return;
    const factor = e.deltaY > 0 ? 1.1 : 0.9;
    const offset = targetCamPosRef.current.clone().sub(targetCamLookRef.current);
    const newLen = THREE.MathUtils.clamp(offset.length() * factor, 8, 48);
    offset.setLength(newLen);
    targetCamPosRef.current.copy(targetCamLookRef.current).add(offset);
  };

  return (
    <div
      id="fantom-3d-digital-twin-container"
      ref={containerRef}
      className="relative w-full h-full min-h-[380px] select-none cursor-grab active:cursor-grabbing overflow-hidden rounded-xl bg-[#11141B]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Floating HUD Tooltip on Station Hover */}
      {hoveredStation && (
        <div
          id={`station-hud-tooltip-${hoveredStation.id}`}
          className="absolute z-20 pointer-events-none transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${tooltipPos.x + 16}px, ${tooltipPos.y - 40}px)`
          }}
        >
          <div className="bg-[#1A1F2B]/95 backdrop-blur-md border border-[#2A3445] text-white p-3 rounded-lg shadow-2xl min-w-[200px] text-xs font-sans">
            <div className="flex items-center justify-between border-b border-[#2C384C] pb-1.5 mb-2">
              <div>
                <span className="font-mono uppercase font-bold text-[#38E08A] tracking-wider text-[10px]">
                  {hoveredStation.id}
                </span>
                <h4 className="font-semibold text-slate-100 text-sm">{hoveredStation.shortCode}</h4>
              </div>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                  hoveredStation.status === 'CRITICAL'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : hoveredStation.status === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {hoveredStation.status}
              </span>
            </div>

            <p className="text-slate-300 text-[11px] mb-2">{hoveredStation.name}</p>

            <div className="grid grid-cols-3 gap-2 bg-[#121620] p-2 rounded border border-[#242F42]">
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Health</p>
                <p className={`font-mono font-bold text-xs ${hoveredStation.healthScore < 85 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {hoveredStation.healthScore.toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Util</p>
                <p className={`font-mono font-bold text-xs ${hoveredStation.utilizationPct > 90 ? 'text-red-400' : 'text-slate-200'}`}>
                  {hoveredStation.utilizationPct.toFixed(0)}%
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">Queue</p>
                <p className={`font-mono font-bold text-xs ${hoveredStation.queueUnits > 100 ? 'text-red-400 font-black' : 'text-slate-200'}`}>
                  {hoveredStation.queueUnits} u
                </p>
              </div>
            </div>

            <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Zone: {hoveredStation.zone}</span>
              <span className="text-[#38E08A] font-medium">Click to inspect →</span>
            </div>
          </div>
        </div>
      )}

      {/* Persistent 3D Overlay Badges & Telemetry Bar */}
      <div className="absolute top-3 left-3 pointer-events-none flex flex-wrap gap-2 text-[11px] font-mono">
        <div className="bg-[#1A1F2B]/90 backdrop-blur-md border border-[#2B3547] text-slate-200 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
          <span>DIGITAL TWIN: ACTIVE (18 STATIONS)</span>
        </div>
        <div className="bg-[#1A1F2B]/90 backdrop-blur-md border border-[#2B3547] text-slate-300 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
          <span>ZONE: A &rarr; B &rarr; C FLOW</span>
        </div>
      </div>

      {/* Interactive 3D Camera Controls Pill */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-[#1A1F2B]/90 backdrop-blur-md border border-[#2A3445] p-1 rounded-lg text-xs font-mono text-slate-300">
        <button
          id="btn-cam-overview"
          onClick={() => {
            targetCamPosRef.current.set(0, 18, 28);
            targetCamLookRef.current.set(0, 0, 0);
          }}
          className="px-2.5 py-1 rounded hover:bg-[#252E3E] text-slate-200 transition-colors"
          title="Reset to factory overview"
        >
          Overview
        </button>
        <button
          id="btn-cam-bottleneck"
          onClick={() => {
            targetCamPosRef.current.set(-2, 10, 14);
            targetCamLookRef.current.set(-2, 1.5, 0);
          }}
          className="px-2.5 py-1 rounded hover:bg-[#252E3E] text-amber-300 transition-colors"
          title="Focus Station 03 Bottleneck"
        >
          S03 Focus
        </button>
        <button
          id="btn-cam-inspection"
          onClick={() => {
            targetCamPosRef.current.set(10, 10, 14);
            targetCamLookRef.current.set(10, 1.5, 0);
          }}
          className="px-2.5 py-1 rounded hover:bg-[#252E3E] text-emerald-300 transition-colors"
          title="Focus AOI Inspection"
        >
          AOI Focus
        </button>
        <button
          id="btn-cam-top"
          onClick={() => {
            targetCamPosRef.current.set(0, 32, 2);
            targetCamLookRef.current.set(0, 0, 0);
          }}
          className="px-2.5 py-1 rounded hover:bg-[#252E3E] text-slate-300 transition-colors"
          title="Top Down Floor Plan"
        >
          Top Plan
        </button>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-3 left-3 text-[10px] font-mono text-slate-400/80 pointer-events-none bg-black/40 px-2 py-0.5 rounded">
        Drag: Orbit View • Scroll: Zoom • Click Station: Deep Diagnostic
      </div>
    </div>
  );
};
