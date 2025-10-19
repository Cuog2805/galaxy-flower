import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const TextDisplay = ({ onCameraReady }) => {
  const containerRef = useRef(null);
  const cameraRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer, animationId, controls;
    const textStars = [];

    function init() {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000);
      camera.position.set(0, 50, 900);
      cameraRef.current = camera;

      if (onCameraReady) onCameraReady(camera);

      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      containerRef.current.appendChild(renderer.domElement);

      // Simple orbit controls
      let isDragging = false;
      let previousMousePosition = { x: 0, y: 0 };
      let rotation = { x: 0, y: 0 };

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
      renderer.domElement.addEventListener('mouseup', () => { isDragging = false; });
      renderer.domElement.addEventListener('wheel', (e) => {
        e.preventDefault();
        camera.position.z += e.deltaY * 0.1;
        camera.position.z = Math.max(100, Math.min(1500, camera.position.z));
      });

      controls = { rotation, isDragging };

      const starGeometries = [
        new THREE.SphereGeometry(1, 8, 8),
        new THREE.TetrahedronGeometry(1),
        new THREE.OctahedronGeometry(1),
        new THREE.IcosahedronGeometry(1, 0),
        new THREE.BoxGeometry(1, 1, 1),
      ];

      createText(scene, starGeometries, textStars);
      createBackgroundStars(scene);

      scene.add(new THREE.AmbientLight(0x404040));
    }

    function createBackgroundStars(scene) {
        const starCount = 3000; // số lượng sao nền
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const radius = 2000 * Math.random(); // giới hạn khoảng cách
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos((Math.random() * 2) - 1);

            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 2,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const stars = new THREE.Points(geometry, material);
        scene.add(stars);
    }


    function createText(scene, starGeometries, textStars) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const mainFontSize = 300;
      const subFontSize = 180;
      const mainText = 'little gift for bonghoadepnhat';
      const subText = 'click here';

      ctx.font = `bold ${mainFontSize}px Arial, sans-serif`;
      const textMetrics = ctx.measureText(mainText);
      const textWidth = textMetrics.width;

      canvas.width = Math.max(2048, textWidth + 200);
      canvas.height = mainFontSize * 3;

      // main text
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${mainFontSize}px Arial, sans-serif`;
      ctx.fillText(mainText, canvas.width / 2, canvas.height / 2 - 30);

      // sub text
      const textGap = 150; // 👈 khoảng cách giữa 2 dòng
      ctx.font = `bold ${subFontSize}px Arial, sans-serif`;
      ctx.fillStyle = '#ffddee';
      ctx.fillText(subText, canvas.width / 2, canvas.height / 2 + mainFontSize / 2 + textGap);

      // extract pixels
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;

      const sampling = 8;
      const scale = 0.5;

      for (let y = 0; y < canvas.height; y += sampling) {
        for (let x = 0; x < canvas.width; x += sampling) {
          const i = (y * canvas.width + x) * 4;
          const alpha = pixels[i + 3];
          if (alpha > 128) {
            const geometry = starGeometries[Math.floor(Math.random() * starGeometries.length)];
            const colorSets = [
              0xff88aa, 0xffaacc, 0xffccee, 0xffddff, 0xffffff,
              0xff66aa, 0xff99cc, 0xffbbee,
            ];
            const color = colorSets[Math.floor(Math.random() * colorSets.length)];

            const material = new THREE.MeshBasicMaterial({
              color,
              transparent: true,
              opacity: Math.random() * 0.3 + 0.6,
            });

            const star = new THREE.Mesh(geometry, material);
            star.position.x = (x - canvas.width / 2) * scale;
            star.position.y = (canvas.height / 2 - y) * scale;
            star.position.z = (Math.random() - 0.5) * 20;

            star.position.x += (Math.random() - 0.5) * 3;
            star.position.y += (Math.random() - 0.5) * 3;

            const starScale = Math.random() * 2 + 1;
            star.scale.set(starScale, starScale, starScale);

            star.rotationSpeed = {
              x: (Math.random() - 0.5) * 0.01,
              y: (Math.random() - 0.5) * 0.01,
              z: (Math.random() - 0.5) * 0.01,
            };
            star.pulseSpeed = Math.random() * 0.02 + 0.01;
            star.pulsePhase = Math.random() * Math.PI * 2;

            scene.add(star);
            textStars.push(star);
          }
        }
      }
    }

    function animate() {
      animationId = requestAnimationFrame(animate);
      if (controls) {
        const radius = camera.position.length();
        camera.position.x = radius * Math.sin(controls.rotation.y) * Math.cos(controls.rotation.x);
        camera.position.y = radius * Math.sin(controls.rotation.x);
        camera.position.z = radius * Math.cos(controls.rotation.y) * Math.cos(controls.rotation.x);
        camera.lookAt(0, 0, 0);
      }

      textStars.forEach((star) => {
        star.rotation.x += star.rotationSpeed.x;
        star.rotation.y += star.rotationSpeed.y;
        star.rotation.z += star.rotationSpeed.z;
        star.pulsePhase += star.pulseSpeed;
        const pulse = Math.sin(star.pulsePhase) * 0.2 + 0.8;
        star.material.opacity = pulse * 0.8;
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
      textStars.forEach((star) => {
        scene.remove(star);
        star.geometry?.dispose();
        star.material?.dispose();
      });
      renderer.dispose();
      if (containerRef.current?.contains(renderer.domElement))
        containerRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default TextDisplay;
