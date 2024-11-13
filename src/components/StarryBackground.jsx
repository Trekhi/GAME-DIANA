import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import "../styles/StarryBackground.css";

//FONDO DE INICIO

const StarryBackground = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    let scene, camera, renderer, stars, starGeo;

    // Función de inicialización
    const init = () => {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
      camera.position.z = 1;
      camera.rotation.x = Math.PI / 2;

      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      containerRef.current.appendChild(renderer.domElement);

      // Usando BufferGeometry en lugar de Geometry
      starGeo = new THREE.BufferGeometry();
      const positions = [];
      for (let i = 0; i < 6000; i++) {
        const x = Math.random() * 600 - 300;
        const y = Math.random() * 600 - 300;
        const z = Math.random() * 600 - 300; // Asignando valores aleatorios para el eje Z
        positions.push(x, y, z);
      }

      // Asignando las posiciones a la geometría
      starGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

      const sprite = new THREE.TextureLoader().load('star.png');
      const starMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.7,
        map: sprite,
        transparent: true,
      });

      stars = new THREE.Points(starGeo, starMaterial);
      scene.add(stars);

      window.addEventListener('resize', onWindowResize, false);

      animate();
    };

    // Ajuste de la ventana
    const onWindowResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    // Animación de las estrellas (acercándose a la cámara)
    const animate = () => {
      const positions = starGeo.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        // Movimiento hacia la cámara (eje Z)
        positions[i + 2] -= 0.5; // Estrella moviéndose hacia la cámara (acercándose)
        
        // Cuando una estrella se acerca demasiado a la cámara, se reposiciona
        if (positions[i + 2] < -200) {
          positions[i + 2] = 200; // Establecemos la posición Z en un valor alejado
        }
      }

      starGeo.attributes.position.needsUpdate = true; // Actualizar las posiciones

      stars.rotation.y += 0.002; // Rotación de las estrellas

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    // Inicializa Three.js
    init();

    // Limpieza al desmontar el componente
    return () => {
      window.removeEventListener('resize', onWindowResize);
      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  return <div ref={containerRef} className="starry-background" />;
};

export default StarryBackground;
