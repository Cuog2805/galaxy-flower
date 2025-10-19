import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const FlowersDisplay = ({ onCameraReady }) => {
  const containerRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer, animationId, controls;
    const allFlowers = [];

    class LilyFlower {
      constructor(scene, starGeometries, options = {}) {
        this.scene = scene;
        this.starGeometries = starGeometries;
        this.coreStars = [];
        this.petalStars = [];
        this.connectionStars = [];
        this.group = new THREE.Group();

        this.position = options.position || { x: 0, y: 0, z: 0 };
        this.scale = options.scale || 1;
        this.rotation = options.rotation || 0;
        this.coreColor = options.coreColor || 'yellow';
        this.petalColor = options.petalColor || 'white';

        this.group.position.set(this.position.x, this.position.y, this.position.z);

        const normal = options.normal || new THREE.Vector3(0, 1, 0);
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
        this.group.setRotationFromQuaternion(quat);
        this.group.rotateY(this.rotation);

        this.create();
        scene.add(this.group);
      }

      create() {
        this.createGalacticCore();
        this.createLilyPetals();
        this.createPetalConnections();
      }

      createGalacticCore() {
        const coreStarCount = 350;
        const coreRadius = 35 * this.scale;

        for (let i = 0; i < coreStarCount; i++) {
          const geometry = this.starGeometries[Math.floor(Math.random() * this.starGeometries.length)];

          const colorSets = {
            yellow: [0xffff00, 0xffaa00, 0xffcc00, 0xff8800, 0xffdd00],
            blue: [0x4444ff, 0x6666ff, 0x8888ff, 0x5555ff, 0x7777ff],
            pink: [0xff66aa, 0xff88cc, 0xffaaee, 0xff5599, 0xff77bb],
          };
          const colors = colorSets[this.coreColor] || colorSets.yellow;
          const color = colors[Math.floor(Math.random() * colors.length)];

          const material = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: Math.random() * 0.4 + 0.6,
          });

          const star = new THREE.Mesh(geometry, material);
          const phi = Math.random() * Math.PI * 2;
          const theta = Math.acos(2 * Math.random() - 1);
          const r = Math.pow(Math.random(), 0.5) * coreRadius;

          star.position.x = r * Math.sin(theta) * Math.cos(phi);
          star.position.y = r * Math.sin(theta) * Math.sin(phi);
          star.position.z = r * Math.cos(theta);

          const scale = Math.random() * 1.2 + 0.4;
          star.scale.set(scale, scale, scale);

          star.orbitRadius = Math.sqrt(star.position.x ** 2 + star.position.z ** 2);
          star.orbitAngle = Math.atan2(star.position.z, star.position.x) + this.rotation;
          star.orbitSpeed = 0.005 * (1 + Math.random() * 0.3);
          star.verticalOffset = star.position.y;
          star.centerPos = { x: 0, y: 0, z: 0 };
          star.rotationSpeed = {
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02,
          };
          star.pulseSpeed = Math.random() * 0.02 + 0.01;
          star.pulsePhase = Math.random() * Math.PI * 2;

          this.group.add(star);
          this.coreStars.push(star);
        }
      }

      createLilyPetals() {
        const petalCount = 24;
        const starsPerPetal = 150;

        for (let petal = 0; petal < petalCount; petal++) {
          for (let i = 0; i < starsPerPetal; i++) {
            const geometry = this.starGeometries[Math.floor(Math.random() * this.starGeometries.length)];
            const t = i / starsPerPetal;
            const baseAngle = petal * (Math.PI * 2 / petalCount) + this.rotation;
            const radius = (40 + t * 280) * this.scale;

            let petalWidth;
            if (t < 0.3) petalWidth = t * 8;
            else if (t < 0.7) petalWidth = 0.9 + Math.sin((t - 0.3) * Math.PI * 2.5) * 5;
            else petalWidth = (1 - t) * 8;

            const curvature = Math.sin(t * Math.PI) * 0.3;
            const lateralOffset = (Math.random() - 0.5) * petalWidth * 30;
            const angle = baseAngle + lateralOffset / radius;

            let color;
            if (this.petalColor === 'white') {
              const colors = [0xffcc66, 0xffeeaa, 0xffffff, 0xffeeff];
              color = colors[Math.floor(Math.random() * colors.length)];
            } else if (this.petalColor === 'pink') {
              const colors = [0xff88aa, 0xffaacc, 0xffccee, 0xffddff, 0xffffff];
              color = colors[Math.floor(Math.random() * colors.length)];
            } else if (this.petalColor === 'purple') {
              const colors = [0x8844ff, 0xaa66ff, 0xbb88ff, 0xeeeeff];
              color = colors[Math.floor(Math.random() * colors.length)];
            } else color = 0xffffff;

            const material = new THREE.MeshBasicMaterial({
              color,
              transparent: true,
              opacity: Math.random() * 0.3 + 0.6,
            });

            const star = new THREE.Mesh(geometry, material);
            star.position.x = Math.cos(angle) * radius;
            star.position.z = Math.sin(angle) * radius;
            star.position.y = (Math.sin(t * Math.PI) * 60 + curvature * 80 + (Math.random() - 0.5) * 45) * this.scale;

            const scale = (1 - t * 0.6) * (Math.random() * 1.5 + 0.6);
            star.scale.set(scale, scale, scale);
            star.orbitRadius = radius;
            star.orbitAngle = angle;
            star.orbitSpeed = (1 - t * 0.7) * 0.0008;
            star.verticalOffset = star.position.y;
            star.centerPos = { x: 0, y: 0, z: 0 };
            star.rotationSpeed = {
              x: (Math.random() - 0.5) * 0.015,
              y: (Math.random() - 0.5) * 0.015,
              z: (Math.random() - 0.5) * 0.015,
            };
            star.pulseSpeed = Math.random() * 0.015 + 0.008;
            star.pulsePhase = Math.random() * Math.PI * 2;

            this.group.add(star);
            this.petalStars.push(star);
          }
        }
      }

      createPetalConnections() {
        const petalCount = 6;
        const connectionStarsPerGap = 80;

        for (let petal = 0; petal < petalCount; petal++) {
          const nextPetal = (petal + 1) % petalCount;
          let angle1 = petal * (Math.PI * 2 / petalCount) + this.rotation;
          let angle2 = nextPetal * (Math.PI * 2 / petalCount) + this.rotation;
          if (angle2 <= angle1) angle2 += Math.PI * 2;

          for (let i = 0; i < connectionStarsPerGap; i++) {
            const geometry = this.starGeometries[Math.floor(Math.random() * this.starGeometries.length)];
            const t = i / connectionStarsPerGap;
            const radius = (50 + t * 270) * this.scale;
            const blend = Math.random();
            const angle = angle1 + (angle2 - angle1) * blend;
            const lateralOffset = (Math.random() - 0.5) * 0.3 * radius;
            const finalAngle = angle + lateralOffset / radius;

            const colors = [0xffcc66, 0xffeeaa, 0xffffff, 0xffeeff, 0xeeeeff];
            const color = colors[Math.floor(Math.random() * colors.length)];

            const material = new THREE.MeshBasicMaterial({
              color,
              transparent: true,
              opacity: Math.random() * 0.3 + 0.45,
            });

            const star = new THREE.Mesh(geometry, material);
            star.position.x = Math.cos(finalAngle) * radius;
            star.position.z = Math.sin(finalAngle) * radius;
            const heightBlend = Math.sin(blend * Math.PI);
            star.position.y = (Math.sin(t * Math.PI) * 50 * heightBlend + (Math.random() - 0.5) * 20) * this.scale;

            const scale = (1 - t * 0.5) * (Math.random() * 1.2 + 0.5);
            star.scale.set(scale, scale, scale);

            star.orbitRadius = radius;
            star.orbitAngle = finalAngle;
            star.orbitSpeed = (1 - t * 0.7) * 0.001;
            star.verticalOffset = star.position.y;
            star.centerPos = { x: 0, y: 0, z: 0 };
            star.rotationSpeed = {
              x: (Math.random() - 0.5) * 0.015,
              y: (Math.random() - 0.5) * 0.015,
              z: (Math.random() - 0.5) * 0.015,
            };
            star.pulseSpeed = Math.random() * 0.015 + 0.008;
            star.pulsePhase = Math.random() * Math.PI * 2;

            this.group.add(star);
            this.connectionStars.push(star);
          }
        }
      }

      getAllStars() {
        return [...this.coreStars, ...this.petalStars, ...this.connectionStars];
      }

      destroy() {
        this.scene.remove(this.group);
        this.getAllStars().forEach((star) => {
          star.geometry?.dispose();
          star.material?.dispose();
        });
        this.coreStars = [];
        this.petalStars = [];
        this.connectionStars = [];
        this.group = null;
      }
    }

    function init() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.2, 3000);
      
      // Set camera position từ trên cao nhìn xuống
      camera.position.set(50, 750, 450);
      camera.lookAt(0, 0, 0);
      
      cameraRef.current = camera;
      
      if (onCameraReady) {
        onCameraReady(camera);
      }

      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      containerRef.current.appendChild(renderer.domElement);

      const initialRadius = Math.sqrt(
        camera.position.x ** 2 + 
        camera.position.y ** 2 + 
        camera.position.z ** 2
      );
      
      // Simple orbit controls
      let isDragging = false;
      let previousMousePosition = { x: 0, y: 0 };
      
      let rotation = { 
        x: Math.asin(camera.position.y / initialRadius),
        y: Math.atan2(camera.position.x, camera.position.z)
      };

      renderer.domElement.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      });

      renderer.domElement.addEventListener('mousemove', (e) => {
        if (isDragging) {
          const deltaX = e.clientX - previousMousePosition.x;
          const deltaY = e.clientY - previousMousePosition.y;
          
          rotation.y += deltaX * 0.005;
          rotation.x += deltaY * 0.005;
          
          rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, rotation.x));
          
          previousMousePosition = { x: e.clientX, y: e.clientY };
        }
      });

      renderer.domElement.addEventListener('mouseup', () => {
        isDragging = false;
      });

      renderer.domElement.addEventListener('wheel', (e) => {
        e.preventDefault();
        const currentRadius = Math.sqrt(
          camera.position.x ** 2 + 
          camera.position.y ** 2 + 
          camera.position.z ** 2
        );
        const newRadius = Math.max(300, Math.min(2000, currentRadius + e.deltaY * 0.5));
        const ratio = newRadius / currentRadius;
        camera.position.multiplyScalar(ratio);
      });

      controls = { rotation, isDragging };

      const starGeometries = [
        new THREE.SphereGeometry(1, 8, 8),
        new THREE.TetrahedronGeometry(1),
        new THREE.OctahedronGeometry(1),
        new THREE.IcosahedronGeometry(1, 0),
        new THREE.BoxGeometry(1, 1, 1),
      ];

      // Tạo hoa
      const positions = [];
      const k = 4000;
      const spacing = 200;
      const randomOffset = 80;
      const randomHeight = 40;

      for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
          if (Math.abs(i) === 2 && Math.abs(j) === 2) continue;

          const x = i * spacing + (Math.random() - 0.5) * randomOffset * 2;
          const z = j * spacing + (Math.random() - 0.5) * randomOffset * 2;
          const y = -(x * x + z * z) / k + (Math.random() - 0.5) * randomHeight;

          positions.push({ x, y, z });
        }
      }

      positions.forEach((pos) => {
        const coreC = Math.random() < 0.4 ? 'blue' : 'pink';
        const petalC = coreC === 'blue' ? 'purple' : 'pink';
        const normal = new THREE.Vector3(pos.x / (k / 2), 1, pos.z / (k / 2)).normalize();

        allFlowers.push(
          new LilyFlower(scene, starGeometries, {
            position: pos,
            scale: 0.7 + Math.random() * 0.3,
            rotation: Math.PI * Math.random(),
            normal: normal,
            coreColor: coreC,
            petalColor: petalC,
          })
        );
      });

      scene.add(new THREE.AmbientLight(0x404040));
    }

    function animate() {
      animationId = requestAnimationFrame(animate);

      // Update camera rotation
      if (controls) {
        const radius = Math.sqrt(
          camera.position.x ** 2 + 
          camera.position.y ** 2 + 
          camera.position.z ** 2
        );
        camera.position.x = radius * Math.sin(controls.rotation.y) * Math.cos(controls.rotation.x);
        camera.position.y = radius * Math.sin(controls.rotation.x);
        camera.position.z = radius * Math.cos(controls.rotation.y) * Math.cos(controls.rotation.x);
        camera.lookAt(0, 0, 0);
      }

      // Animate flowers
      allFlowers.forEach((flower) => {
        flower.getAllStars().forEach((star) => {
          star.orbitAngle += star.orbitSpeed;

          star.position.x = Math.cos(star.orbitAngle) * star.orbitRadius + star.centerPos.x;
          star.position.z = Math.sin(star.orbitAngle) * star.orbitRadius + star.centerPos.z;

          const t = performance.now() * 0.001;
          const amplitude = 2; 
          const freq = 1.5;  
          star.position.x += Math.sin(t * freq + star.pulsePhase) * amplitude * 0.5;
          star.position.y = star.verticalOffset + Math.cos(t * freq * 0.8 + star.pulsePhase) * amplitude;
          star.position.z += Math.sin(t * freq * 1.2 + star.pulsePhase * 0.7) * amplitude * 0.5;

          star.rotation.x += star.rotationSpeed.x;
          star.rotation.y += star.rotationSpeed.y;
          star.rotation.z += star.rotationSpeed.z;
          
          star.pulsePhase += star.pulseSpeed;
          const pulse = Math.sin(star.pulsePhase) * 0.2 + 0.8;
          star.material.opacity = pulse * 0.8;
        });
      });


      renderer.render(scene, camera);
    }

    init();
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      allFlowers.forEach((flower) => flower.destroy());
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement))
        containerRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};
export default FlowersDisplay;