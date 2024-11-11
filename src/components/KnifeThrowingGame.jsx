import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";

const KnifeThrowingGame = ({ onGameOver }) => {
  const mountRef = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const knives = useRef([]);
  const targets = useRef([]);
  const camera = useRef(null);
  const scene = useRef(null);
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

    const spawnTarget = () => {
      const targetGeometry = new THREE.SphereGeometry(0.5, 32, 32);
      const targetMaterial = new THREE.MeshBasicMaterial({ wireframe: true });
      const target = new THREE.Mesh(targetGeometry, targetMaterial);

      target.position.set((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 6, -15);
      target.userData.velocity = new THREE.Vector3().subVectors(camera.current.position, target.position).normalize().multiplyScalar(0.10);
      target.userData.hit = false; // Marca para controlar los golpes únicos

      scene.current.add(target);
      targets.current.push(target);
    };

    const handleMouseMove = (event) => {
      mousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const throwKnife = () => {
      const knifeGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.1);
      const knifeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const knife = new THREE.Mesh(knifeGeometry, knifeMaterial);

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

    const spawnInterval = setInterval(spawnTarget, 1000);

    const animate = () => {
      if (gameOver) return;

      requestAnimationFrame(animate);

      knives.current.forEach((knife, index) => {
        knife.position.add(knife.userData.velocity);

        if (knife.position.z < -20) {
          scene.current.remove(knife);
          knives.current.splice(index, 1);
        }
      });

      targets.current.forEach((target, index) => {
        target.position.add(target.userData.velocity);

        knives.current.forEach((knife, knifeIndex) => {
          if (knife.position.distanceTo(target.position) < 0.5) {
            scene.current.remove(target);
            scene.current.remove(knife);
            targets.current.splice(index, 1);
            knives.current.splice(knifeIndex, 1);
            setScore((prevScore) => prevScore + 1);
          }
        });

        if (target.position.distanceTo(camera.current.position) < 0.7 && !target.userData.hit) {
          target.userData.hit = true; // Marcar como golpeado para evitar duplicados
          scene.current.remove(target);
          targets.current.splice(index, 1);
          setLives((prevLives) => prevLives - 1);
        }
      });

      renderer.render(scene.current, camera.current);

      if (lives <= 0 && !gameOver) {
        setGameOver(true);
        onGameOver(score); // Notificar el fin del juego
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
