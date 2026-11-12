import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTelemetry } from '../../context/TelemetryContext';
import { Waves, CloudRain, Activity, ShieldCheck, Cpu, Play, Square, Eye } from 'lucide-react';

export const CityHeroCanvas: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const { sensors, stormMode, toggleStormMode, prediction } = useTelemetry();
  const [subsurfaceMode, setSubsurfaceMode] = useState<boolean>(false);

  // Compute live averages for the floating cards
  const avgLevel = sensors.length > 0 
    ? Math.round(sensors.reduce((acc, s) => acc + s.current_water_level_cm, 0) / sensors.length) 
    : 48;
  const avgRain = sensors.length > 0 
    ? Math.round(sensors.reduce((acc, s) => acc + s.rainfall_intensity_mm_hr, 0) / sensors.length) 
    : 14;
  const activeSensors = sensors.filter(s => s.status === 'online' || s.status === 'warning' || s.status === 'critical').length;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a1428, 0.025);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(22, 18, 26);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    // 1. Ground & Street Grid
    const groundGeo = new THREE.PlaneGeometry(40, 40);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    cityGroup.add(ground);

    // Street markings (Grid Lines)
    const gridHelper = new THREE.GridHelper(38, 16, 0x0284c7, 0x1e293b);
    gridHelper.position.y = 0.02;
    cityGroup.add(gridHelper);

    // 2. Modern 3D Buildings
    const buildingGroup = new THREE.Group();
    cityGroup.add(buildingGroup);

    const bMatNormal = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.7,
      wireframe: false
    });
    const bMatGlass = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transmission: 0.5,
      opacity: 0.7,
      transparent: true,
      roughness: 0.1,
      metalness: 0.5
    });

    const buildingPositions = [
      // Central Commercial Core
      { x: -8, z: -8, w: 3.5, d: 3.5, h: 14 },
      { x: -3, z: -8, w: 4.0, d: 3.0, h: 10 },
      { x: 3, z: -8, w: 3.2, d: 3.8, h: 16 },
      { x: 8, z: -8, w: 3.5, d: 3.5, h: 12 },

      // Middle Row
      { x: -8, z: -2, w: 3.2, d: 3.2, h: 11 },
      { x: 8, z: -2, w: 3.5, d: 3.5, h: 15 },
      { x: -8, z: 4, w: 3.6, d: 3.6, h: 8 },
      { x: 8, z: 4, w: 3.2, d: 3.2, h: 9 },

      // Front Row
      { x: -8, z: 9, w: 3.5, d: 3.5, h: 6 },
      { x: -2, z: 9, w: 4.0, d: 3.0, h: 7 },
      { x: 4, z: 9, w: 3.5, d: 3.5, h: 8 },
      { x: 9, z: 9, w: 3.0, d: 3.0, h: 5 },
    ];

    buildingPositions.forEach((b, idx) => {
      const geo = new THREE.BoxGeometry(b.w, b.h, b.d);
      const mesh = new THREE.Mesh(geo, idx % 3 === 0 ? bMatGlass : bMatNormal);
      mesh.position.set(b.x, b.h / 2, b.z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      buildingGroup.add(mesh);

      // Rooftop glowing communications antenna
      const antGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.5);
      const antMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe });
      const ant = new THREE.Mesh(antGeo, antMat);
      ant.position.set(b.x, b.h + 0.75, b.z);
      buildingGroup.add(ant);
    });

    // 3. Underground Drainage Infrastructure (Pipes & Sump Chambers)
    const pipeGroup = new THREE.Group();
    cityGroup.add(pipeGroup);

    // Underground pipeline segments
    const pipePoints = [
      new THREE.Vector3(-10, -2.5, -6),
      new THREE.Vector3(0, -2.5, -6),
      new THREE.Vector3(0, -2.5, 0),
      new THREE.Vector3(0, -2.5, 6),
      new THREE.Vector3(10, -2.5, 6),
      new THREE.Vector3(-10, -2.5, 2),
      new THREE.Vector3(0, -2.5, 2),
      new THREE.Vector3(8, -2.5, -2)
    ];

    const pipeCurves = [
      new THREE.LineCurve3(pipePoints[0], pipePoints[1]),
      new THREE.LineCurve3(pipePoints[1], pipePoints[2]),
      new THREE.LineCurve3(pipePoints[2], pipePoints[3]),
      new THREE.LineCurve3(pipePoints[3], pipePoints[4]),
      new THREE.LineCurve3(pipePoints[5], pipePoints[6]),
      new THREE.LineCurve3(pipePoints[6], pipePoints[2]),
      new THREE.LineCurve3(pipePoints[2], pipePoints[7]),
    ];

    const pipeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.5,
      roughness: 0.1,
      metalness: 0.8,
      clearcoat: 1.0
    });

    pipeCurves.forEach(curve => {
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.45, 12, false);
      const tube = new THREE.Mesh(tubeGeo, pipeMaterial);
      pipeGroup.add(tube);
    });

    // Central retention sump / culvert tank
    const tankGeo = new THREE.CylinderGeometry(2.5, 2.5, 3.5, 24);
    const tankMat = new THREE.MeshPhysicalMaterial({
      color: 0x0369a1,
      transparent: true,
      opacity: 0.45,
      wireframe: false
    });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.set(0, -2.2, 0);
    pipeGroup.add(tank);

    // Dynamic water level plane inside the central sump tank
    const waterLevelGeo = new THREE.CylinderGeometry(2.4, 2.4, 0.1, 24);
    const waterLevelMat = new THREE.MeshStandardMaterial({
      color: 0x00f2fe,
      roughness: 0.1,
      metalness: 0.8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6
    });
    const waterPlane = new THREE.Mesh(waterLevelGeo, waterLevelMat);
    waterPlane.position.set(0, -3.0, 0);
    pipeGroup.add(waterPlane);

    // 4. Moving Water Particles inside Pipes
    const waterParticlesCount = 120;
    const waterParticleGeo = new THREE.BufferGeometry();
    const waterPos = new Float32Array(waterParticlesCount * 3);
    const waterParticleData: Array<{ curveIndex: number; t: number; speed: number }> = [];

    for (let i = 0; i < waterParticlesCount; i++) {
      const cIdx = i % pipeCurves.length;
      const t = Math.random();
      const pt = pipeCurves[cIdx].getPoint(t);
      waterPos[i * 3] = pt.x + (Math.random() - 0.5) * 0.2;
      waterPos[i * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.2;
      waterPos[i * 3 + 2] = pt.z + (Math.random() - 0.5) * 0.2;
      waterParticleData.push({
        curveIndex: cIdx,
        t,
        speed: 0.003 + Math.random() * 0.005
      });
    }

    waterParticleGeo.setAttribute('position', new THREE.BufferAttribute(waterPos, 3));
    const waterParticleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.22,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const waterParticles = new THREE.Points(waterParticleGeo, waterParticleMat);
    pipeGroup.add(waterParticles);

    // 5. Glowing IoT Sensor Nodes & Pulse Beacons
    const sensorNodePositions = [
      { x: -5, z: -6, id: "SS-SEN-101", status: "online" },
      { x: 0, z: -3, id: "SS-SEN-102", status: "warning" },
      { x: 5, z: 2, id: "SS-SEN-103", status: "online" },
      { x: -4, z: 2, id: "SS-SEN-104", status: "critical" },
      { x: 3, z: -6, id: "SS-SEN-105", status: "warning" },
      { x: 0, z: 6, id: "SS-SEN-106", status: "online" }
    ];

    const sensorRings: THREE.Mesh[] = [];
    sensorNodePositions.forEach(sn => {
      // Station base pole
      const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.2);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(sn.x, 0.6, sn.z);
      cityGroup.add(pole);

      // Node head indicator
      const headGeo = new THREE.SphereGeometry(0.24, 16, 16);
      const color = sn.status === 'critical' ? 0xef4444 : (sn.status === 'warning' ? 0xf59e0b : 0x10b981);
      const headMat = new THREE.MeshBasicMaterial({ color });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.set(sn.x, 1.25, sn.z);
      cityGroup.add(head);

      // Pulsing telemetry radar ring on ground
      const ringGeo = new THREE.RingGeometry(0.2, 0.8, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(sn.x, 0.05, sn.z);
      cityGroup.add(ring);
      sensorRings.push(ring);

      // Vertical Laser Communication Beam to Central Cloud
      const beamGeo = new THREE.CylinderGeometry(0.015, 0.015, 8);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x00f2fe,
        transparent: true,
        opacity: 0.35
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(sn.x, 5.25, sn.z);
      cityGroup.add(beam);
    });

    // 6. Rainfall Particle System
    const rainCount = 1200;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPositions[i] = (Math.random() - 0.5) * 36;
      rainPositions[i + 1] = Math.random() * 24 + 1;
      rainPositions[i + 2] = (Math.random() - 0.5) * 36;
    }

    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.12,
      transparent: true,
      opacity: 0.65
    });
    const rainSystem = new THREE.Points(rainGeo, rainMat);
    scene.add(rainSystem);

    // 7. Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0x38bdf8, 2.8);
    sun.position.set(20, 30, 15);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    scene.add(sun);

    const blueLight = new THREE.PointLight(0x0284c7, 3, 20);
    blueLight.position.set(0, 4, 0);
    scene.add(blueLight);

    // Interaction & Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetRotY = 0;
    let targetRotX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      mouseY = -((e.clientY - rect.top) / height - 0.5) * 2;
      targetRotY = mouseX * 0.35;
      targetRotX = -mouseY * 0.15;
    };
    container.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Smooth camera / scene tilt interpolation
      cityGroup.rotation.y += (targetRotY - cityGroup.rotation.y) * 0.05;
      cityGroup.rotation.x += (targetRotX - cityGroup.rotation.x) * 0.05;

      // Slowly rotate city slightly
      cityGroup.rotation.y += 0.001;

      // Animate Rain
      const rPositions = rainGeo.attributes.position.array as Float32Array;
      const rainFallSpeed = stormMode ? 0.95 : 0.45;
      for (let i = 1; i < rainCount * 3; i += 3) {
        rPositions[i] -= rainFallSpeed;
        if (rPositions[i] < 0) {
          rPositions[i] = 24;
        }
      }
      rainGeo.attributes.position.needsUpdate = true;

      // Animate Water Level in Sump Tank
      // maps 0 - 160 cm to y: -3.6 to -1.0
      const targetWaterY = -3.6 + (avgLevel / 160.0) * 2.6;
      waterPlane.position.y += (targetWaterY - waterPlane.position.y) * 0.05;

      // Animate Water Particles along pipes
      const wPositions = waterParticleGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < waterParticlesCount; i++) {
        const item = waterParticleData[i];
        item.t += stormMode ? item.speed * 2.2 : item.speed;
        if (item.t > 1) item.t = 0;
        const pt = pipeCurves[item.curveIndex].getPoint(item.t);
        wPositions[i * 3] = pt.x;
        wPositions[i * 3 + 1] = pt.y;
        wPositions[i * 3 + 2] = pt.z;
      }
      waterParticleGeo.attributes.position.needsUpdate = true;

      // Pulse Radar Rings
      sensorRings.forEach((ring, idx) => {
        const scale = 1.0 + ((elapsed * 1.5 + idx * 0.4) % 2.0);
        ring.scale.set(scale, scale, 1);
        const mat = ring.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.8 - (scale - 1) * 0.5);
      });

      // Subsurface cutaway camera angle adjustment
      if (subsurfaceMode) {
        camera.position.y += (8 - camera.position.y) * 0.05;
        camera.position.z += (20 - camera.position.z) * 0.05;
      } else {
        camera.position.y += (18 - camera.position.y) * 0.05;
        camera.position.z += (26 - camera.position.z) * 0.05;
      }
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [stormMode, subsurfaceMode, avgLevel]);

  return (
    <div className="relative w-full h-[540px] lg:h-[620px] rounded-3xl overflow-hidden shadow-2xl border border-sky-100/60 dark:border-sky-900/40 bg-gradient-to-b from-sky-50/50 via-white/20 to-sky-100/30 dark:from-navy-950 dark:via-navy-900 dark:to-navy-950 backdrop-blur-xl">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Header Overlay with Controls */}
      <div className="absolute top-5 left-5 right-5 flex flex-wrap items-center justify-between gap-4 pointer-events-none">
        <div className="flex items-center gap-3 bg-white/80 dark:bg-navy-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-sky-200/60 dark:border-sky-800/50 shadow-sm pointer-events-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-sky-300">
            Smart City 3D Digital Twin
          </span>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-2">
            LoRa & Cellular Mesh Active
          </span>
        </div>

        {/* Interactive Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setSubsurfaceMode(!subsurfaceMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shadow-sm ${
              subsurfaceMode
                ? 'bg-brand-600 text-white shadow-brand-500/25'
                : 'bg-white/80 dark:bg-navy-800/80 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-navy-700'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {subsurfaceMode ? 'Surface View' : 'Inspect Subsurface Pipes'}
          </button>

          <button
            onClick={toggleStormMode}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shadow-md ${
              stormMode
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/30 animate-pulse'
                : 'bg-gradient-to-r from-sky-500 to-brand-600 hover:from-sky-600 hover:to-brand-700 text-white'
            }`}
          >
            {stormMode ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {stormMode ? 'Stop Storm Surge' : 'Simulate Rain Storm'}
          </button>
        </div>
      </div>

      {/* Floating 5 Glassmorphic Metric Cards */}
      <div className="absolute bottom-5 left-5 right-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pointer-events-none">
        {/* Card 1: Live Water Level */}
        <div className="bg-white/85 dark:bg-navy-900/85 backdrop-blur-md p-3.5 rounded-2xl border border-sky-100 dark:border-sky-900/50 shadow-glass-light dark:shadow-glass-dark pointer-events-auto transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-sky-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Live Water Level</span>
            <Waves className="w-4 h-4 text-brand-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{avgLevel}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">cm</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {avgLevel > 110 ? '🚨 Near overflow capacity' : 'Sump capacity optimal'}
          </p>
        </div>

        {/* Card 2: Rainfall Intensity */}
        <div className="bg-white/85 dark:bg-navy-900/85 backdrop-blur-md p-3.5 rounded-2xl border border-sky-100 dark:border-sky-900/50 shadow-glass-light dark:shadow-glass-dark pointer-events-auto transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-sky-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Rainfall Intensity</span>
            <CloudRain className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{avgRain}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">mm/h</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {avgRain > 35 ? 'Torrential downpour' : 'Moderate precipitation'}
          </p>
        </div>

        {/* Card 3: Drainage Health */}
        <div className="bg-white/85 dark:bg-navy-900/85 backdrop-blur-md p-3.5 rounded-2xl border border-sky-100 dark:border-sky-900/50 shadow-glass-light dark:shadow-glass-dark pointer-events-auto transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-sky-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Drainage Health</span>
            <Activity className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">88.4</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">%</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">Conduit clearance index</p>
        </div>

        {/* Card 4: Flood Risk Index */}
        <div className="bg-white/85 dark:bg-navy-900/85 backdrop-blur-md p-3.5 rounded-2xl border border-sky-100 dark:border-sky-900/50 shadow-glass-light dark:shadow-glass-dark pointer-events-auto transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-sky-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Flood Risk Index</span>
            <ShieldCheck className={`w-4 h-4 ${prediction.risk_score > 60 ? 'text-rose-500' : 'text-amber-500'}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold font-mono ${prediction.risk_score > 60 ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {prediction.risk_score}
            </span>
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-sky-100 dark:bg-navy-800 text-sky-800 dark:text-sky-300">
              {prediction.risk_category}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            Overflow window: ~{prediction.estimated_window_mins}m
          </p>
        </div>

        {/* Card 5: Active Sensor Nodes */}
        <div className="bg-white/85 dark:bg-navy-900/85 backdrop-blur-md p-3.5 rounded-2xl border border-sky-100 dark:border-sky-900/50 shadow-glass-light dark:shadow-glass-dark pointer-events-auto transition-transform hover:-translate-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-sky-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Sensor Nodes</span>
            <Cpu className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{activeSensors}</span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">/ {sensors.length} online</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">Zero-drift acoustic sync</p>
        </div>
      </div>
    </div>
  );
};
