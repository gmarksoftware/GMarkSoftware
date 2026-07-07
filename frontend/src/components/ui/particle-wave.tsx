import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ParticleWaveProps {
  className?: string;
  opacity?: number;
  interactive?: boolean;
  accentColor?: string;
  baseColor?: string;
}

const ParticleWave: React.FC<ParticleWaveProps> = ({ 
  className = '', 
  opacity = 0.6,
  interactive = true,
  accentColor = '#FF5A5F',
  baseColor
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    particles: THREE.Points;
    particleMaterial: THREE.ShaderMaterial;
    animationId: number | null;
    mouse: THREE.Vector2;
    raycaster: THREE.Raycaster;
    plane: THREE.Plane;
    defaultY: number;
    defaultZ: number;
    virtualBallPos: THREE.Vector3;
  } | null>(null);
  const isVisibleRef = useRef<boolean>(false);

  // Function to detect current theme
  const getCurrentTheme = () => {
    return document.documentElement.classList.contains('light') ? 'light' : 'dark';
  };

  // Function to get particle base color based on theme
  const getParticleColor = (theme: string) => {
    return theme === 'dark' 
      ? new THREE.Color('#E2E8F0') // Bright slate-200 for a visible and elegant telemetry backdrop
      : new THREE.Color('#475569'); // Dark slate-600 for contrast on light backgrounds
  };

  // Vertex Shader: Flowing wave + Raycasted mouse ripple displacement
  const particleVertex = `
    attribute float scale;
    uniform float uTime;
    uniform vec3 uMouse3D;
    varying float vWave;
    varying float vMouseForce;

    void main() {
      vec3 p = position;
      
      // Multi-frequency wave motion for high-tech telemetry flow
      float wave = sin(p.x * 0.2 + uTime) * 0.45 + cos(p.z * 0.2 + uTime * 0.8) * 0.35;
      // Add a higher-frequency micro-ripple for details
      wave += sin(p.x * 0.5 - uTime * 1.5) * 0.08;
      p.y += wave;
      
      // Calculate distance to raycast mouse on the flat plane
      float dist = distance(vec2(p.x, p.z), vec2(uMouse3D.x, uMouse3D.z));
      float radius = 6.0;
      float force = 0.0;
      
      if (dist < radius) {
        // Smooth dropoff and exponential curve
        force = 1.0 - (dist / radius);
        force = pow(force, 1.8);
        
        // Displace height
        p.y += force * 1.1;
        
        // Push particles slightly outward away from the cursor
        vec2 dir = vec2(p.x, p.z) - vec2(uMouse3D.x, uMouse3D.z);
        float len = length(dir);
        if (len > 0.001) {
          vec2 dirNorm = dir / len;
          p.x += dirNorm.x * force * 0.5;
          p.z += dirNorm.y * force * 0.5;
        }
      }
      
      vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
      
      vWave = wave;
      vMouseForce = force;
      
      // Dynamic scale: increase size on peak waves and hover
      float finalScale = scale * (1.0 + force * 1.5);
      gl_PointSize = finalScale * 48.0 * (1.0 / -mvPosition.z);
      gl_Position = projectionMatrix * mvPosition;
    }
  `;

  // Fragment Shader: Soft glowing circle rendering + Height/Mouse Color Interpolation
  const particleFragment = `
    uniform vec3 uColor;
    uniform vec3 uAccentColor;
    uniform float uOpacity;
    varying float vWave;
    varying float vMouseForce;

    void main() {
      // Restrict point drawing to a circle
      float r = length(gl_PointCoord - vec2(0.5));
      if (r > 0.5) discard;
      
      // Soft radial glow curve
      float alpha = smoothstep(0.5, 0.06, r);
      
      // Interpolate color between base color and accent brand red based on wave height
      float waveNorm = (vWave + 0.8) / 1.6;
      waveNorm = clamp(waveNorm, 0.0, 1.0);
      float colorBlend = pow(waveNorm, 1.6);
      
      // Hovered ripples glow accent color fully
      colorBlend = max(colorBlend, vMouseForce);
      
      vec3 finalColor = mix(uColor, uAccentColor, colorBlend);
      
      // Dynamic opacity: base ambient opacity + bright hover highlight
      float finalAlpha = alpha * uOpacity * (0.85 + vMouseForce * 0.95);
      
      gl_FragColor = vec4(finalColor, finalAlpha);
    }
  `;

  const initScene = () => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    const winWidth = parent ? parent.clientWidth : window.innerWidth;
    const winHeight = parent ? parent.clientHeight : window.innerHeight;
    const aspectRatio = winWidth / winHeight;

    // Camera
    const isMobile = winWidth < 768;
    const fov = isMobile ? 100 : 75;
    const camera = new THREE.PerspectiveCamera(fov, aspectRatio, 0.01, 1000);
    const defaultY = isMobile ? 4.6 : 3.2;
    const defaultZ = isMobile ? 4.8 : 6.0;
    camera.position.set(0, defaultY, defaultZ);

    // Scene
    const scene = new THREE.Scene();

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio at 2 for performance
    renderer.setSize(winWidth, winHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background

    // Performance adaptive particle density
    const amountX = isMobile ? 70 : 140;
    const amountY = isMobile ? 70 : 140;
    const gap = isMobile ? 0.7 : 0.38; // Span similar physical width

    const particleNum = amountX * amountY;
    const particlePositions = new Float32Array(particleNum * 3);
    const particleScales = new Float32Array(particleNum);
    
    let i = 0;
    let j = 0;
    for (let ix = 0; ix < amountX; ix++) {
      for (let iy = 0; iy < amountY; iy++) {
        particlePositions[i] = ix * gap - ((amountX * gap) / 2);
        particlePositions[i + 1] = 0;
        particlePositions[i + 2] = iy * gap - ((amountY * gap) / 2);
        
        // Randomize base scales for a organic digital dust vibe
        particleScales[j] = Math.random() * 0.65 + 0.45;
        i += 3;
        j++;
      }
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('scale', new THREE.BufferAttribute(particleScales, 1));

    const particleMaterial = new THREE.ShaderMaterial({
      transparent: true,
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: baseColor ? new THREE.Color(baseColor) : getParticleColor(getCurrentTheme()) },
        uAccentColor: { value: new THREE.Color(accentColor) },
        uOpacity: { value: opacity },
        uMouse3D: { value: new THREE.Vector3(-1000, -1000, -1000) }
      }
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const mouse = new THREE.Vector2(-10, -10);
    const raycaster = new THREE.Raycaster();
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0); // Flat y=0 plane

    sceneRef.current = {
      scene,
      camera,
      renderer,
      particles,
      particleMaterial,
      animationId: null,
      mouse,
      raycaster,
      plane,
      defaultY,
      defaultZ,
      virtualBallPos: new THREE.Vector3()
    };
  };

  const getWaveHeight = (x: number, z: number, time: number) => {
    let y = Math.sin(x * 0.2 + time) * 0.45 + Math.cos(z * 0.2 + time * 0.8) * 0.35;
    y += Math.sin(x * 0.5 - time * 1.5) * 0.08;
    return y;
  };

  const animate = () => {
    if (!sceneRef.current || !isVisibleRef.current) return;

    const { scene, camera, renderer, particleMaterial, mouse, raycaster, plane, defaultY, defaultZ, virtualBallPos } = sceneRef.current;
    
    const time = particleMaterial.uniforms.uTime.value + 0.022; // Smooth flow speed
    particleMaterial.uniforms.uTime.value = time;
    
    // 3D Mouse Intersection
    const intersection = new THREE.Vector3();
    if (interactive && mouse.x !== -10 && mouse.y !== -10) {
      // Raycast mouse position onto plane
      raycaster.setFromCamera(mouse, camera);
      raycaster.ray.intersectPlane(plane, intersection);
      
      // Smooth camera mouse parallax
      const targetX = mouse.x * 2.8;
      const targetY = defaultY + mouse.y * 1.8;
      camera.position.x += (targetX - camera.position.x) * 0.04;
      camera.position.y += (targetY - camera.position.y) * 0.04;
    } else {
      // Idle circular orbit target when mouse is inactive
      const idleTime = Date.now() * 0.001;
      intersection.set(Math.sin(idleTime) * 2.0, 0, Math.cos(idleTime) * 2.0);
      
      // Ease camera back to default look position
      camera.position.x += (0 - camera.position.x) * 0.02;
      camera.position.y += (defaultY - camera.position.y) * 0.02;
      camera.position.z += (defaultZ - camera.position.z) * 0.02;
    }
    
    // Virtual ball follows the target position (X and Z) with smooth lag/inertia
    virtualBallPos.x += (intersection.x - virtualBallPos.x) * 0.08;
    virtualBallPos.z += (intersection.z - virtualBallPos.z) * 0.08;
    
    // Virtual ball height matches wave height at its current position
    const waveY = getWaveHeight(virtualBallPos.x, virtualBallPos.z, time);
    virtualBallPos.y = waveY + 0.18; // Float slightly above wave
    
    // Displace particles under the virtual ball
    particleMaterial.uniforms.uMouse3D.value.copy(virtualBallPos);
    
    // Theme sync
    const currentTheme = getCurrentTheme();
    const currentBaseColor = baseColor ? new THREE.Color(baseColor) : getParticleColor(currentTheme);
    particleMaterial.uniforms.uColor.value.copy(currentBaseColor);
    particleMaterial.uniforms.uAccentColor.value.set(accentColor);
    particleMaterial.uniforms.uOpacity.value = opacity;
    
    const targetLookAt = new THREE.Vector3(0, -0.8, 0);
    camera.lookAt(targetLookAt);
    renderer.render(scene, camera);
    
    sceneRef.current.animationId = requestAnimationFrame(animate);
  };

  const handleResize = () => {
    if (!sceneRef.current || !canvasRef.current) return;

    const { camera, renderer } = sceneRef.current;
    const parent = canvasRef.current.parentElement;
    const winWidth = parent ? parent.clientWidth : window.innerWidth;
    const winHeight = parent ? parent.clientHeight : window.innerHeight;

    camera.aspect = winWidth / winHeight;
    const isMobile = winWidth < 768;
    camera.fov = isMobile ? 100 : 75;
    
    sceneRef.current.defaultY = isMobile ? 4.6 : 3.2;
    sceneRef.current.defaultZ = isMobile ? 4.8 : 6.0;

    camera.updateProjectionMatrix();
    renderer.setSize(winWidth, winHeight);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!sceneRef.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    
    sceneRef.current.mouse.x = x;
    sceneRef.current.mouse.y = y;
  };

  const handleMouseLeave = () => {
    if (sceneRef.current) {
      sceneRef.current.mouse.set(-10, -10);
    }
  };

  useEffect(() => {
    initScene();

    const observer = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisibleRef.current;
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !wasVisible) {
          animate();
        }
      },
      { threshold: 0.05 }
    );

    if (canvasRef.current) {
      observer.observe(canvasRef.current);
    }

    const handleResizeEvent = () => handleResize();
    const handleMouseMoveEvent = (e: MouseEvent) => handleMouseMove(e);
    const handleMouseLeaveEvent = () => handleMouseLeave();

    window.addEventListener('resize', handleResizeEvent);
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMoveEvent);
      window.addEventListener('mouseleave', handleMouseLeaveEvent);
    }

    return () => {
      observer.disconnect();
      if (sceneRef.current?.animationId) {
        cancelAnimationFrame(sceneRef.current.animationId);
      }
      window.removeEventListener('resize', handleResizeEvent);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMoveEvent);
        window.removeEventListener('mouseleave', handleMouseLeaveEvent);
      }
      
      // Cleanup Three.js resources
      if (sceneRef.current) {
        const { scene, renderer, particles } = sceneRef.current;
        scene.remove(particles);
        if (particles.geometry) particles.geometry.dispose();
        if (particles.material) {
          if (Array.isArray(particles.material)) {
            particles.material.forEach(material => material.dispose());
          } else {
            particles.material.dispose();
          }
        }
        renderer.dispose();
      }
    };
  }, [interactive, accentColor, baseColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`block ${className}`}
      style={{
        width: '100%',
        height: '100%',
        margin: 0,
        overflow: 'hidden'
      }}
    />
  );
};

export { ParticleWave };
