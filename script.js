(function() {
  const bar = document.getElementById('loader-bar');
  const txt = document.getElementById('loader-text');
  const loader = document.getElementById('loader');
  const msgs = [
    'Carregando estruturas...',
    'Iniciando Three.js...',
    'Preparando a cidade...',
    'Finalizando sistemas...',
    'Bem-vindo à ATOBÁ.'
  ];
  let pct = 0;
  const iv = setInterval(() => {
    pct += Math.random() * 18 + 4;
    if (pct >= 100) pct = 100;
    bar.style.width = pct + '%';
    txt.textContent = msgs[Math.min(Math.floor(pct / 25), 4)];
    if (pct >= 100) {
      clearInterval(iv);
      setTimeout(() => {
        loader.style.transition = 'opacity 0.6s';
        loader.style.opacity = '0';
        setTimeout(() => {
          loader.style.display = 'none';
          document.body.style.overflow = '';
        }, 600);
      }, 400);
    }
  }, 80);
  document.body.style.overflow = 'hidden';
})();

// ════════════════════════════════════
// SCROLL UTILITIES
// ════════════════════════════════════
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = (scrollTop / docHeight) * 100;
  document.getElementById('progress-bar').style.width = pct + '%';

  // Navbar
  const nb = document.getElementById('navbar');
  if (scrollTop > 60) nb.classList.add('scrolled');
  else nb.classList.remove('scrolled');

  // Back to top
  const bt = document.getElementById('back-top');
  if (scrollTop > 400) bt.classList.add('visible');
  else bt.classList.remove('visible');

  // Reveal elements
  document.querySelectorAll('.reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) {
      el.classList.add('visible');
    }
  });

  // Counter animation
  animateCounters();

  // Finale animation
  animateFinale();
});

// Trigger reveal on load
document.querySelectorAll('.reveal').forEach(el => {
  const rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight - 80) el.classList.add('visible');
});

// ════════════════════════════════════
// COUNTER ANIMATION
// ════════════════════════════════════
const countersDone = new Set();
function animateCounters() {
  document.querySelectorAll('.num-val[data-target]').forEach(el => {
    if (countersDone.has(el)) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight - 50) {
      countersDone.add(el);
      const target = parseInt(el.getAttribute('data-target'));
      const suffix = el.innerHTML.match(/(<span>.*?<\/span>)/)?.[1] || '';
      let current = 0;
      const step = Math.max(1, Math.floor(target / 60));
      const iv = setInterval(() => {
        current = Math.min(current + step, target);
        el.innerHTML = current + suffix;
        if (current >= target) clearInterval(iv);
      }, 25);
    }
  });
}

// ════════════════════════════════════
// FINALE ANIMATION
// ════════════════════════════════════
let finaleDone = false;
function animateFinale() {
  if (finaleDone) return;
  const section = document.getElementById('finale');
  const rect = section.getBoundingClientRect();
  if (rect.top < window.innerHeight * 0.6) {
    finaleDone = true;
    const els = [
      { el: document.getElementById('finale-tagline'), delay: 0 },
      { el: document.getElementById('finale-quote'), delay: 300 },
      { el: document.getElementById('finale-brand'), delay: 700 },
      { el: document.getElementById('finale-sub'), delay: 1100 },
    ];
    els.forEach(({ el, delay }) => {
      setTimeout(() => {
        el.style.transition = 'opacity 0.9s, transform 0.9s';
        el.style.transform = 'translateY(0)';
        el.style.opacity = '1';
      }, delay);
    });
  }
}

// ════════════════════════════════════
// NAVBAR HAMBURGER
// ════════════════════════════════════
document.getElementById('hamburger').addEventListener('click', function() {
  const nav = document.getElementById('navbar');
  const expanded = nav.classList.toggle('nav-mobile-open');
  this.setAttribute('aria-expanded', expanded);
});

// ════════════════════════════════════
// BACK TO TOP
// ════════════════════════════════════
document.getElementById('back-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ════════════════════════════════════
// HERO THREE.JS — CITY SCENE
// ════════════════════════════════════
(function initHeroScene() {
  const canvas = document.getElementById('hero-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x061826, 0.018);

  const camera = new THREE.PerspectiveCamera(55, canvas.offsetWidth / canvas.offsetHeight, 0.1, 300);
  camera.position.set(0, 12, 35);
  camera.lookAt(0, 4, 0);

  // Lights
  scene.add(new THREE.AmbientLight(0x1a3d5c, 1.5));
  const sun = new THREE.DirectionalLight(0xFF7A00, 1.2);
  sun.position.set(20, 30, 20);
  sun.castShadow = true;
  scene.add(sun);
  const rimLight = new THREE.DirectionalLight(0x4488ff, 0.4);
  rimLight.position.set(-20, 10, -10);
  scene.add(rimLight);

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(200, 200, 40, 40),
    new THREE.MeshLambertMaterial({ color: 0x061826, wireframe: false })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid
  const grid = new THREE.GridHelper(200, 60, 0xFF7A00, 0x0B2545);
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add(grid);

  // Building factory
  function makeBuilding(x, z, w, d, h, color, wireframe = false) {
    const mat = wireframe
      ? new THREE.MeshBasicMaterial({ color, wireframe: true })
      : new THREE.MeshLambertMaterial({ color });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    mesh.position.set(x, h / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.targetY = h / 2;
    mesh.position.y = wireframe ? h / 2 : -h;
    scene.add(mesh);
    return mesh;
  }

  const buildings = [];
  const buildingData = [
    // x, z, w, d, h, color
    [0, 0, 4, 4, 22, 0x12325a],
    [-8, 2, 3, 3, 16, 0x0B2545],
    [8, -1, 3.5, 3.5, 18, 0x1a3d6e],
    [-14, -3, 2.5, 2.5, 12, 0x0B2545],
    [14, 4, 2.8, 2.8, 14, 0x12325a],
    [-5, -8, 3, 4, 10, 0x374151],
    [5, -6, 2.5, 3, 8, 0x0B2545],
    [-18, 6, 2, 2.5, 9, 0x374151],
    [18, -2, 2.2, 2.2, 11, 0x1a3d6e],
    [-10, 8, 2, 2, 6, 0x0B2545],
    [10, 8, 2, 2, 7, 0x374151],
    [0, -12, 5, 3, 7, 0x12325a],
    [-22, 0, 1.8, 2, 8, 0x0B2545],
    [22, 6, 1.8, 1.8, 6, 0x374151],
  ];

  buildingData.forEach(([x, z, w, d, h, col], i) => {
    buildings.push(makeBuilding(x, z, w, d, h, col, i < 4));
  });

  // Windows (point lights / small cubes)
  function addWindows(building) {
    const geom = new THREE.BoxGeometry(0.3, 0.3, 0.1);
    const mat = new THREE.MeshBasicMaterial({ color: 0xFF7A00, transparent: true, opacity: 0.8 });
    for (let i = 0; i < 8; i++) {
      const w = new THREE.Mesh(geom, mat.clone());
      w.material.opacity = Math.random() * 0.5 + 0.4;
      const bBox = new THREE.Box3().setFromObject(building);
      const size = new THREE.Vector3();
      bBox.getSize(size);
      w.position.set(
        building.position.x + (Math.random() - 0.5) * size.x * 0.7,
        Math.random() * size.y * 0.8 + building.position.y - size.y / 2 + 1,
        building.position.z + size.z / 2 + 0.05
      );
      scene.add(w);
    }
  }

  // Crane
  function makeCrane(x, z) {
    const g = new THREE.Group();
    const mat = new THREE.MeshLambertMaterial({ color: 0xFF7A00 });
    const mast = new THREE.Mesh(new THREE.BoxGeometry(0.3, 20, 0.3), mat);
    mast.position.y = 10;
    g.add(mast);
    const boom = new THREE.Mesh(new THREE.BoxGeometry(14, 0.25, 0.25), mat);
    boom.position.set(4, 20.2, 0);
    g.add(boom);
    const counter = new THREE.Mesh(new THREE.BoxGeometry(5, 0.25, 0.25), mat);
    counter.position.set(-3.5, 20.2, 0);
    g.add(counter);
    const cable = new THREE.Mesh(new THREE.BoxGeometry(0.05, 4, 0.05), new THREE.MeshBasicMaterial({ color: 0xD9D9D9 }));
    cable.position.set(8, 17.5, 0);
    g.add(cable);
    const hook = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), mat);
    hook.position.set(8, 15, 0);
    g.add(hook);
    g.position.set(x, 0, z);
    scene.add(g);
    return g;
  }

  const crane1 = makeCrane(4, 6);
  const crane2 = makeCrane(-12, -5);

  // Particles (floating dust/sparks)
  const particleCount = 200;
  const pPositions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    pPositions[i * 3] = (Math.random() - 0.5) * 60;
    pPositions[i * 3 + 1] = Math.random() * 30;
    pPositions[i * 3 + 2] = (Math.random() - 0.5) * 60;
  }
  const pGeom = new THREE.BufferGeometry();
  pGeom.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
  const pMat = new THREE.PointsMaterial({ color: 0xFF7A00, size: 0.15, transparent: true, opacity: 0.6 });
  scene.add(new THREE.Points(pGeom, pMat));

  // Build animation
  let buildProgress = 0;
  buildings.forEach((b, i) => {
    setTimeout(() => {
      b.userData.animating = true;
    }, i * 120 + 800);
  });

  let frameId;
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  function tick(t) {
    frameId = requestAnimationFrame(tick);

    // Rise buildings
    buildings.forEach(b => {
      if (b.userData.animating) {
        b.position.y += (b.userData.targetY - b.position.y) * 0.04;
        if (Math.abs(b.position.y - b.userData.targetY) < 0.05) {
          b.position.y = b.userData.targetY;
          b.userData.animating = false;
          // Switch wireframe to solid
          if (b.material.wireframe) {
            b.material = new THREE.MeshLambertMaterial({ color: parseInt(b.material.color.getHexString(), 16) });
          }
        }
      }
    });

    // Crane rotation
    crane1.rotation.y = Math.sin(t * 0.0003) * 0.4;
    crane2.rotation.y = Math.cos(t * 0.0002) * 0.5;

    // Camera gentle drift
    camera.position.x += (mouseX * 3 - camera.position.x) * 0.015;
    camera.position.y += (-mouseY * 2 + 12 - camera.position.y) * 0.015;
    camera.lookAt(0, 4, 0);

    // Particle movement
    const pos = pGeom.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3 + 1] += 0.015;
      if (pos[i * 3 + 1] > 32) pos[i * 3 + 1] = 0;
    }
    pGeom.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }
  tick(0);

  // Resize
  const resizeObserver = new ResizeObserver(() => {
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
    camera.updateProjectionMatrix();
  });
  resizeObserver.observe(canvas);
})();

// ════════════════════════════════════
// FINALE THREE.JS — CITY OVERVIEW
// ════════════════════════════════════
(function initFinaleScene() {
  const canvas = document.getElementById('finale-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x061826, 0.012);

  const camera = new THREE.PerspectiveCamera(45, canvas.offsetWidth / canvas.offsetHeight, 0.1, 500);
  camera.position.set(0, 60, 80);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0x1a3d5c, 2));
  const sun = new THREE.DirectionalLight(0xFF7A00, 1.5);
  sun.position.set(30, 60, 30);
  scene.add(sun);

  // Big city
  const mat = new THREE.MeshLambertMaterial({ color: 0x0B2545 });
  const winMat = new THREE.MeshBasicMaterial({ color: 0xFF7A00, transparent: true, opacity: 0.9 });

  function addBuilding(x, z, w, d, h) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat.clone());
    mesh.position.set(x, h / 2, z);
    scene.add(mesh);
    // Windows
    for (let i = 0; i < 6; i++) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.1), winMat.clone());
      win.material.opacity = Math.random() * 0.6 + 0.3;
      win.position.set(
        x + (Math.random() - 0.5) * w * 0.6,
        Math.random() * h * 0.8 + 1,
        z + d / 2 + 0.05
      );
      scene.add(win);
    }
  }

  const cityData = [];
  for (let i = 0; i < 40; i++) {
    const angle = (i / 40) * Math.PI * 2;
    const r = Math.random() * 30 + 8;
    cityData.push([
      Math.cos(angle) * r,
      Math.sin(angle) * r,
      Math.random() * 3 + 1.5,
      Math.random() * 3 + 1.5,
      Math.random() * 25 + 5
    ]);
  }
  cityData.push([0, 0, 6, 6, 40]);
  cityData.push([10, 5, 4, 4, 30]);
  cityData.push([-10, -5, 4, 4, 28]);

  cityData.forEach(([x, z, w, d, h]) => addBuilding(x, z, w, d, h));

  // Ground grid
  const grid = new THREE.GridHelper(200, 80, 0xFF7A00, 0x0B2545);
  grid.material.opacity = 0.15;
  grid.material.transparent = true;
  scene.add(grid);

  // Particles
  const pCount = 400;
  const pPos = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 120;
    pPos[i * 3 + 1] = Math.random() * 60;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 120;
  }
  const pG = new THREE.BufferGeometry();
  pG.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  scene.add(new THREE.Points(pG, new THREE.PointsMaterial({ color: 0xFF7A00, size: 0.2, transparent: true, opacity: 0.5 })));

  let cameraAngle = 0;
  function tick() {
    requestAnimationFrame(tick);
    cameraAngle += 0.002;
    camera.position.x = Math.sin(cameraAngle) * 90;
    camera.position.z = Math.cos(cameraAngle) * 90;
    camera.position.y = 55 + Math.sin(cameraAngle * 0.5) * 10;
    camera.lookAt(0, 10, 0);
    renderer.render(scene, camera);
  }
  tick();

  new ResizeObserver(() => {
    renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
    camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
    camera.updateProjectionMatrix();
  }).observe(canvas);
})();

// ════════════════════════════════════
// FORM SUBMIT
// ════════════════════════════════════
document.querySelector('.contact-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('.form-submit');
  btn.innerHTML = '<i class="fas fa-check"></i> Mensagem Enviada!';
  btn.style.background = '#22c55e';
  setTimeout(() => {
    btn.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Mensagem';
    btn.style.background = '';
    this.reset();
  }, 3000);
});

// Prefers reduced motion
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll('.testi-track').forEach(el => {
    el.style.animation = 'none';
  });
}