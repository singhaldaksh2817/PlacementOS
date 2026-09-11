import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useStore } from '../../store/useStore';
import { THEMES } from '../../lib/themeSystem';

export default function PlacementJourney3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const { activeTheme } = useStore();
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch (e) {
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 500;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Theme Light Setup
    const themeConfig = THEMES[activeTheme] || THEMES.midnight;
    const themeColor = new THREE.Color(themeConfig.lightColorHex);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(themeColor, 3, 50);
    pointLight.position.set(5, 5, 10);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xffffff, 1.5, 30);
    pointLight2.position.set(-8, -5, -5);
    scene.add(pointLight2);

    // 4. Central Core — Icosahedron (PlacementOS AI Engine)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const coreGeo = new THREE.IcosahedronGeometry(2.2, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: themeColor,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: true,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreGroup.add(coreMesh);

    // Inner glowing sphere
    const innerGeo = new THREE.SphereGeometry(1.4, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({
      color: themeColor,
      wireframe: false,
      transparent: true,
      opacity: 0.6,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerMesh);

    // Outer Torus Ring
    const torusGeo = new THREE.TorusGeometry(3.6, 0.06, 16, 100);
    const torusMat = new THREE.MeshStandardMaterial({
      color: themeColor,
      roughness: 0.1,
      metalness: 0.9,
    });
    const torusMesh = new THREE.Mesh(torusGeo, torusMat);
    torusMesh.rotation.x = Math.PI / 3;
    coreGroup.add(torusMesh);

    // 5. Orbiting Nodes (Skills -> Learn -> Practice -> Interview -> Placed)
    const nodesData = [
      { name: 'SKILLS', angle: 0, radius: 6.5, color: 0x22d3ee, iconShape: 'octa' },
      { name: 'LEARN', angle: (Math.PI * 2) / 5, radius: 6.5, color: 0x8b5cf6, iconShape: 'box' },
      { name: 'PRACTICE', angle: ((Math.PI * 2) / 5) * 2, radius: 6.5, color: 0x3b82f6, iconShape: 'dodeca' },
      { name: 'INTERVIEW', angle: ((Math.PI * 2) / 5) * 3, radius: 6.5, color: 0xf59e0b, iconShape: 'tetra' },
      { name: 'PLACED', angle: ((Math.PI * 2) / 5) * 4, radius: 6.5, color: 0x10b981, iconShape: 'star' },
    ];

    const nodeMeshes: THREE.Group[] = [];

    nodesData.forEach((data) => {
      const nodeGroup = new THREE.Group();
      const x = Math.cos(data.angle) * data.radius;
      const y = Math.sin(data.angle) * data.radius;
      nodeGroup.position.set(x, y, 0);

      let geom: THREE.BufferGeometry;
      if (data.iconShape === 'octa') geom = new THREE.OctahedronGeometry(0.75);
      else if (data.iconShape === 'box') geom = new THREE.BoxGeometry(0.9, 0.9, 0.9);
      else if (data.iconShape === 'dodeca') geom = new THREE.DodecahedronGeometry(0.7);
      else if (data.iconShape === 'tetra') geom = new THREE.TetrahedronGeometry(0.85);
      else geom = new THREE.SphereGeometry(0.65, 16, 16);

      const mat = new THREE.MeshStandardMaterial({
        color: data.color,
        roughness: 0.3,
        metalness: 0.7,
      });

      const mesh = new THREE.Mesh(geom, mat);
      nodeGroup.add(mesh);

      // Node connection line to central core
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, 0),
      ]);
      const lineMat = new THREE.LineDashedMaterial({
        color: themeColor,
        dashSize: 0.3,
        gapSize: 0.15,
        linewidth: 1,
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      scene.add(line);

      scene.add(nodeGroup);
      nodeMeshes.push(nodeGroup);
    });

    // 6. Floating Particles
    const particlesGeo = new THREE.BufferGeometry();
    const particleCount = 120;
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 25;
      posArray[i + 1] = (Math.random() - 0.5) * 25;
      posArray[i + 2] = (Math.random() - 0.5) * 20;
    }

    particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMat = new THREE.PointsMaterial({
      size: 0.08,
      color: themeColor,
      transparent: true,
      opacity: 0.7,
    });
    const particlePoints = new THREE.Points(particlesGeo, particlesMat);
    scene.add(particlePoints);

    // 7. Mouse Parallax Effect
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      mouseX = (x / width - 0.5) * 2;
      mouseY = (y / height - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      coreGroup.rotation.y = elapsedTime * 0.4;
      coreGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.2;
      torusMesh.rotation.z = elapsedTime * 0.6;

      // Rotate camera gently
      camera.position.x = targetX * 1.8;
      camera.position.y = -targetY * 1.8;
      camera.lookAt(0, 0, 0);

      // Animate Orbiting Nodes
      nodeMeshes.forEach((node, i) => {
        const baseAngle = nodesData[i].angle + elapsedTime * 0.2;
        const radius = nodesData[i].radius;
        node.position.x = Math.cos(baseAngle) * radius;
        node.position.y = Math.sin(baseAngle) * radius;
        node.position.z = Math.sin(elapsedTime * 1.5 + i) * 0.5;
        node.rotation.x += 0.02;
        node.rotation.y += 0.03;
      });

      particlePoints.rotation.y = elapsedTime * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 600;
      const newHeight = container.clientHeight || 500;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeTheme]);

  if (!webglSupported) {
    return (
      <div className="w-full h-full min-h-[380px] flex items-center justify-center p-6 text-center rounded-3xl border border-white/10 bg-white/5">
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto text-2xl">
            🚀
          </div>
          <h3 className="font-heading font-bold text-lg text-white">PlacementOS 3D Engine</h3>
          <p className="text-xs text-slate-400 max-w-xs">
            Interactive Career Journey Visualization (Skills ➔ Practice ➔ Interview ➔ Placed)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[420px] flex items-center justify-center overflow-hidden">
      <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Floating Badges overlay */}
      <div className="absolute top-4 left-4 pointer-events-none z-10 hidden sm:block">
        <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Interactive Placement Journey</span>
        </div>
      </div>
    </div>
  );
}
