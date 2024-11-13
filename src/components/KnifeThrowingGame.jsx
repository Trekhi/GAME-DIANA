import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const KnifeThrowingGame = ({ onGameOver }) => {
  const mountRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const knives = useRef([]);
  const targets = useRef([]);
  const camera = useRef(null);
  const scene = useRef(null);
  const skullModel = useRef(null);
  const knifeModel = useRef(null);
  const mousePosition = useRef(new THREE.Vector2());

  useEffect(() => {
    scene.current = new THREE.Scene();
    camera.current = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    camera.current.position.z = 5;

    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.current.add(light);

        // Cargar el modelo de calavera
        const loader = new GLTFLoader();
        loader.load("/models/calavera2.glb", (gltf) => {
          skullModel.current = gltf.scene;
          skullModel.current.scale.set(0.5, 0.5, 0.5);
           // Ajustar el tamaño
        });

        // Cargar el modelo de calavera
        const loader2 = new GLTFLoader();
        loader2.load("/models/kitchen_knife.glb", (gltf) => {
          knifeModel.current = gltf.scene;
          knifeModel.current.scale.set(1, 1, 1); // Ajustar el tamaño
        });
    
        // Función para generar un enemigo
        const spawnTarget = () => {
          if (!skullModel.current) return;
    
          const target = skullModel.current.clone();
    
          // Configuración de la posición y velocidad
          const zPosition = -15;
          const distance = Math.abs(zPosition - camera.current.position.z);
          const vFov = (camera.current.fov * Math.PI) / 180;
          const height = 2 * Math.tan(vFov / 2) * distance;
          const width = height * camera.current.aspect;
    
          const x = (Math.random() - 0.5) * width;
          const y = (Math.random() - 0.5) * height;
    
          target.position.set(x, y, zPosition);
    
          target.userData.velocity = new THREE.Vector3()
            .subVectors(camera.current.position, target.position)
            .normalize()
            .multiplyScalar(0.15);
    
          target.userData.hit = false;
          scene.current.add(target);
          targets.current.push(target);
        };

    const handleMouseMove = (event) => {
      mousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const throwKnife = () => {
      
      const knife = knifeModel.current.clone();

      knife.position.copy(camera.current.position);
      const direction = new THREE.Vector3(mousePosition.current.x, mousePosition.current.y, -1)
        .unproject(camera.current)
        .sub(camera.current.position)
        .normalize();
      knife.userData.velocity = direction.multiplyScalar(0.5);

      scene.current.add(knife);
      knives.current.push(knife);
    };
    window.addEventListener("click", throwKnife);

    const spawnInterval = setInterval(spawnTarget, 2000);

    const animate = () => {
      if (gameOver) return;
    
      requestAnimationFrame(animate);
    
      const knivesToRemove = [];
      const targetsToRemove = [];
    
      knives.current.forEach((knife, knifeIndex) => {
        knife.position.add(knife.userData.velocity);
    
        if (knife.position.z < -20) {
          knivesToRemove.push(knifeIndex);
          scene.current.remove(knife);
        }
      });
    
      targets.current.forEach((target, targetIndex) => {
        // Animar la rotación de la calavera
        target.rotation.y += 0.01; // Rotación suave en el eje Y
    
        target.position.add(target.userData.velocity);
    
        // Hacer que el target mire hacia la cámara
        target.lookAt(camera.current.position);
    
        knives.current.forEach((knife, knifeIndex) => {
          if (knife.position.distanceTo(target.position) < 0.5) {
            scene.current.remove(target);
            scene.current.remove(knife);
            targetsToRemove.push(targetIndex);
            knivesToRemove.push(knifeIndex);
            setScore((prevScore) => prevScore + 1);
          }
        });
    
        if (target.position.distanceTo(camera.current.position) < 0.7 && !target.userData.hit) {
          target.userData.hit = true;
          scene.current.remove(target);
          targetsToRemove.push(targetIndex);
          setLives((prevLives) => prevLives - 1);
        }
      });
    
      knivesToRemove.forEach((index) => {
        knives.current.splice(index, 1);
      });
    
      targetsToRemove.forEach((index) => {
        targets.current.splice(index, 1);
      });
    
      renderer.render(scene.current, camera.current);
    
      if (lives <= 0 && !gameOver) {
        setGameOver(true);
        onGameOver(score);
      }
    };
    
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", throwKnife);
      clearInterval(spawnInterval);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, [lives, gameOver, onGameOver]);

  return (
    <div>
      <div ref={mountRef} style={{ width: "100vw", height: "100vh" }} />
      <div style={{ position: "absolute", top: 20, left: 20, color: "white" }}>
        Score: {score} | Lives: {lives}
      </div>
    </div>
  );
};

export default KnifeThrowingGame;
