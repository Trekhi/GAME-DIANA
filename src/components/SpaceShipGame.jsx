import { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import "../styles/StarryBackground.css";

const SpaceShipGame = ({ onGameOver }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const mousePosition = useRef(new THREE.Vector2());
  const lasers = useRef([]);
  const asteroids = useRef([]);
  const shipRef = useRef(null);
  const asteroidModel = useRef(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  const gameOverCalled = useRef(false); // Asegura que `onGameOver` solo se llame una vez


  
  

  useEffect(() => {
    let animationFrameId; // Referencia para detener la animación
    let stars, starGeo;

    const init = () => {
      // Initialize scene, camera, renderer
      sceneRef.current = new THREE.Scene();
      cameraRef.current = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        5000
      );
      cameraRef.current.position.z = 5;

      rendererRef.current = new THREE.WebGLRenderer();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      containerRef.current.appendChild(rendererRef.current.domElement);

      // Starry background
      starGeo = new THREE.BufferGeometry();
      const positions = [];
      for (let i = 0; i < 6000; i++) {
        positions.push(
          Math.random() * 600 - 300,
          Math.random() * 600 - 300,
          Math.random() * 600 - 300
        );
      }
      starGeo.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      const sprite = new THREE.TextureLoader().load("star.png");
      const starMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 0.7,
        map: sprite,
        transparent: true,
      });
      stars = new THREE.Points(starGeo, starMaterial);
      sceneRef.current.add(stars);

      // Load spaceship model
      if (!shipRef.current) {  // Evita duplicar la nave
        const loader = new GLTFLoader();
        loader.load(
          "/models/spaceship.glb",
          (gltf) => {
            const ship = gltf.scene;
            ship.scale.set(-0.05, 0.05, 0.05);
            ship.position.z = 3;
            if (shipRef.current) {
              sceneRef.current.remove(shipRef.current);
            }
      
            shipRef.current = ship; // Asigna la nave cargada
            sceneRef.current.add(shipRef.current); // Agrégala a la escena
          },
          undefined,
          (error) => {
            console.error("Error loading spaceship model", error);
          }
        );
      } else {
        // Solo reinicia la posición de la nave si ya existe
        shipRef.current.position.set(0, 0, 3);
        sceneRef.current.add(shipRef.current);
      }

      // Load asteroid model
      const loader2 = new GLTFLoader();
      loader2.load(
        "/models/asteroid_01.glb",
        (gltf) => {
          asteroidModel.current = gltf.scene;
          asteroidModel.current.scale.set(0.01, 0.01, 0.01);
        },
        undefined,
        (error) => {
          console.error("Error loading asteroid model", error);
        }
      );

      // Lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 2);
      sceneRef.current.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(0, 10, 10);
      sceneRef.current.add(directionalLight);

      // Event listeners
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("resize", onWindowResize);
      window.addEventListener("click", shootLaser);
      setInterval(spawnAsteroid, 8000);

      animate();
    };

    // Ship movement
    const onMouseMove = (event) => {
      mousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    // Window resize
    const onWindowResize = () => {
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    // Laser shooting
    const shootLaser = () => {
      const laser = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.1, 0.5),
        new THREE.MeshBasicMaterial({ color: 0xff0000 })
      );
      laser.position.copy(cameraRef.current.position);
      laser.userData.velocity = new THREE.Vector3(
        mousePosition.current.x,
        mousePosition.current.y,
        -1
      )
        .unproject(cameraRef.current)
        .sub(cameraRef.current.position)
        .normalize()
        .multiplyScalar(0.5);
      sceneRef.current.add(laser);
      lasers.current.push(laser);
    };

    // Asteroid spawning
    const spawnAsteroid = () => {
      if (!asteroidModel.current) return;
      const asteroid = asteroidModel.current.clone();
      const zPosition = -100;
      const distance = Math.abs(zPosition - cameraRef.current.position.z);
      const vFov = (cameraRef.current.fov * Math.PI) / 180;
      const height = 2 * Math.tan(vFov / 2) * distance;
      const width = height * cameraRef.current.aspect;
      asteroid.position.set(
        (Math.random() - 0.5) * width,
        (Math.random() - 0.5) * height,
        zPosition
      );
      asteroid.userData.velocity = new THREE.Vector3()
        .subVectors(cameraRef.current.position, asteroid.position)
        .normalize()
        .multiplyScalar(0.17);
      asteroid.userData.hit = false;
      sceneRef.current.add(asteroid);
      asteroids.current.push(asteroid);
    };

    
    // Limita la posición de la nave dentro de la pantalla
    const limitShipPosition = (ship) => {
      const aspectRatio = window.innerWidth / window.innerHeight;
      const limitX = 1 * aspectRatio; // Limite horizontal (ajustable)
      const limitY = 1; // Limite vertical (ajustable)

      ship.position.x = Math.max(-limitX, Math.min(limitX, ship.position.x));
      ship.position.y = Math.max(-limitY, Math.min(limitY, ship.position.y));
    };  

    const animate = () => {
      if (gameOver) {
        if (!gameOverCalled.current ) {
          gameOverCalled.current = true; // Marca como ya llamado
          console.log("Game over 1:", score); // Debug
          onGameOver(score); // Llama al manejador solo una vez
        }
        return; // Detén la animación
      }
      // Animación normal aquí...
      animationFrameId = requestAnimationFrame(animate);

      const lasersToRemove = [];
      const asteroidsToRemove = [];

      // Update stars
      const positions = starGeo.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 2] -= 0.5;
        if (positions[i + 2] < -200) {
          positions[i + 2] = 200;
        }
      }
      starGeo.attributes.position.needsUpdate = true;
      stars.rotation.y += 0.002;

      // Ship movement
      if (shipRef.current) {
        shipRef.current.position.x += (mousePosition.current.x * 3 - shipRef.current.position.x) * 0.1;
        shipRef.current.position.y += (mousePosition.current.y * 2 - shipRef.current.position.y) * 0.1;
        limitShipPosition(shipRef.current);
        shipRef.current.lookAt(new THREE.Vector3(0, 0, -1));
      }

      lasers.current.forEach((laser, laserIndex) => {
        laser.position.add(laser.userData.velocity);
        if (laser.position.z < -20) {
          lasersToRemove.push(laserIndex);
          sceneRef.current.remove(laser);
        }
      });

      asteroids.current.forEach((asteroid, asteroidIndex) => {
        asteroid.rotation.y += 0.01;
        asteroid.position.add(asteroid.userData.velocity);

        lasers.current.forEach((laser, laserIndex) => {
          if (laser.position.distanceTo(asteroid.position) < 0.5) {
            sceneRef.current.remove(asteroid);
            sceneRef.current.remove(laser);
            asteroidsToRemove.push(asteroidIndex);
            lasersToRemove.push(laserIndex);
            setScore((prevScore) => prevScore + 1);
          }
        });

        if (asteroid.position.distanceTo(cameraRef.current.position) < 0.7 && !asteroid.userData.hit) {
          asteroid.userData.hit = true;
          sceneRef.current.remove(asteroid);
          asteroidsToRemove.push(asteroidIndex);
          setLives((prevLives) => prevLives - 1);
        }
      });

      lasersToRemove.forEach((index) => lasers.current.splice(index, 1));
      asteroidsToRemove.forEach((index) => asteroids.current.splice(index, 1));

      rendererRef.current.render(sceneRef.current, cameraRef.current);

      if (lives <= 0 && !gameOver) {
        setGameOver(true);
        console.log("Game overrrrrrr:", score); // Debug
        cancelAnimationFrame(animationFrameId);

      }
    };
 
    init();

    return () => {
      if (shipRef.current) {
        sceneRef.current.remove(shipRef.current);
      }
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("click", shootLaser);
      
    };
  }, [lives, gameOver]);

  return (
    <div>
      <div ref={containerRef} className="starry-background" />
      <div style={{ position: "absolute", top: 20, left: 20, color: "white" }}>
        Score: {score} | Lives: {lives}
      </div>
    </div>
  );
};

export default SpaceShipGame;