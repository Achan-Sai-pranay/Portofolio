/* ═══════════════════════════════════════════════════
   NEW-1. MOUSE GRAVITY WELL
═══════════════════════════════════════════════════ */
(function() {
  if (window.innerWidth <= 900) return;
  const GRAVITY_R  = 140;
  const STRENGTH   = 0.22;

  let mx = -9999, my = -9999;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive:true });

  function tick() {
    const pts = window._pts;
    if (!pts) { requestAnimationFrame(tick); return; }
    pts.forEach(p => {
      const dx = mx - p.x, dy = my - p.y;
      const d2 = dx*dx + dy*dy;
      if (d2 < GRAVITY_R * GRAVITY_R) {
        const d    = Math.sqrt(d2);
        const pull = (1 - d / GRAVITY_R) * STRENGTH;
        p.gx += dx * pull * 0.06;
        p.gy += dy * pull * 0.06;
      }
    });
    requestAnimationFrame(tick);
  }
  tick();
})();

/* ═══════════════════════════════════════════════════
   NEW-2. PARTICLE EXPLOSION ON CLICK
═══════════════════════════════════════════════════ */
(function() {
  if (window.innerWidth <= 900) return;
  const c = document.createElement('canvas');
  c.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:6;';
  document.body.appendChild(c);
  const ctx = c.getContext('2d');
  let W = c.width = window.innerWidth, H = c.height = window.innerHeight;
  window.addEventListener('resize', () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; }, { passive:true });

  const bursts = [];
  const COLS   = ['rgba(0,212,255,','rgba(124,58,237,','rgba(16,185,129,','rgba(255,255,255,'];

  document.addEventListener('click', e => {
    if (e.target.closest('button,a,.ios-app,.ttt-cell,input,textarea,.aw-back')) return;
    const count = 22 + Math.floor(Math.random() * 10);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4;
      const speed = Math.random() * 5 + 2;
      bursts.push({
        x: e.clientX, y: e.clientY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: Math.random() * 2.5 + 0.8,
        alpha: 1,
        color: COLS[Math.floor(Math.random() * COLS.length)],
      });
    }
  });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.x  += b.vx; b.y  += b.vy;
      b.vy += 0.12;
      b.vx *= 0.97;
      b.alpha -= 0.032;
      if (b.alpha <= 0) { bursts.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fillStyle = b.color + b.alpha + ')';
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ═══════════════════════════════════════════════════
   NEW-3. PARTICLE COLOR ZONES ON SCROLL
═══════════════════════════════════════════════════ */
(function() {
  if (window.innerWidth <= 900) return;
  const scrollMain = document.getElementById('scrollMain');
  if (!scrollMain) return;

  const ZONES = [
    { id: 'about',    color: 'rgba(0,212,255,'   },
    { id: 'projects', color: 'rgba(124,58,237,'  },
    { id: 'skills',   color: 'rgba(16,185,129,'  },
    { id: 'terminal', color: 'rgba(0,212,255,'   },
    { id: 'contact',  color: 'rgba(124,58,237,'  },
  ];

  let currentColor  = 'rgba(0,212,255,';
  let targetColor   = 'rgba(0,212,255,';
  let transProgress = 1;
  let transId = null;

  function startTransition(newColor) {
    if (newColor === targetColor) return;
    targetColor  = newColor;
    transProgress = 0;
    if (!transId) animateTransition();
  }

  function animateTransition() {
    transProgress = Math.min(transProgress + 0.008, 1);
    if (transProgress < 1) transId = requestAnimationFrame(animateTransition);
    else transId = null;
    const pts = window._pts;
    if (!pts) return;
    pts.forEach(p => {
      p.colorOverride = transProgress >= 1 ? targetColor : p.baseColor;
    });
    if (transProgress >= 1) currentColor = targetColor;
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const zone = ZONES.find(z => z.id === e.target.id);
        if (zone) startTransition(zone.color);
      }
    });
  }, { root: scrollMain, threshold: 0.5 });

  ZONES.forEach(z => {
    const el = document.getElementById(z.id);
    if (el) obs.observe(el);
  });
})();

/* ═══════════════════════════════════════════════════
   NEW-4. BREATHING CONSTELLATION
═══════════════════════════════════════════════════ */
(function() {
  const c = document.createElement('canvas');
  c.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:1;opacity:0.5;';
  document.body.appendChild(c);
  const ctx = c.getContext('2d');
  let W = c.width = window.innerWidth, H = c.height = window.innerHeight;
  window.addEventListener('resize', () => { W = c.width = window.innerWidth; H = c.height = window.innerHeight; }, {passive:true});

  const STARS = [
    {x:.12,y:.18},{x:.25,y:.08},{x:.38,y:.22},{x:.18,y:.35},{x:.30,y:.45},
    {x:.45,y:.12},{x:.55,y:.28},{x:.65,y:.15},{x:.72,y:.38},{x:.60,y:.48},
    {x:.80,y:.22},{x:.88,y:.12},{x:.78,y:.55},{x:.50,y:.60},{x:.35,y:.70},
    {x:.20,y:.65},{x:.10,y:.55},{x:.42,y:.80},{x:.68,y:.72},{x:.85,y:.68},
  ];
  const EDGES = [
    [0,1],[1,2],[2,4],[0,3],[3,4],[2,5],[5,6],[6,7],[7,8],[6,9],
    [8,10],[10,11],[10,12],[9,12],[9,13],[4,13],[13,14],[3,15],[15,16],
    [14,15],[13,18],[12,19],[11,10],[17,14],[18,19],
  ];

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 0.004;
    const breathe = 1 + Math.sin(t) * 0.06;

    EDGES.forEach(([a, b]) => {
      const ax = STARS[a].x * W * breathe + (1-breathe)*W*0.5;
      const ay = STARS[a].y * H * breathe + (1-breathe)*H*0.5;
      const bx = STARS[b].x * W * breathe + (1-breathe)*W*0.5;
      const by = STARS[b].y * H * breathe + (1-breathe)*H*0.5;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(0,212,255,0.055)`;
      ctx.lineWidth = 0.7;
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    });

    STARS.forEach(s => {
      const sx = s.x * W * breathe + (1-breathe)*W*0.5;
      const sy = s.y * H * breathe + (1-breathe)*H*0.5;
      const pulse = 0.9 + Math.sin(t * 1.4 + s.x * 10) * 0.35;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${0.22 * pulse})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ═══════════════════════════════════════════════════
   NEW-5. WARP SPEED ON NAV CLICK
═══════════════════════════════════════════════════ */
(function() {
  if (window.innerWidth <= 900) return;
  const warpC = document.createElement('canvas');
  warpC.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:500;opacity:0;transition:opacity .1s;';
  document.body.appendChild(warpC);
  const ctx = warpC.getContext('2d');
  let W = warpC.width = window.innerWidth, H = warpC.height = window.innerHeight;
  window.addEventListener('resize', () => { W = warpC.width = window.innerWidth; H = warpC.height = window.innerHeight; }, {passive:true});

  let warpActive = false, warpT = 0, warpRaf = null;
  const CX = () => W / 2, CY = () => H / 2;

  function triggerWarp() {
    warpActive = true; warpT = 0;
    warpC.style.opacity = '1';
    if (warpRaf) cancelAnimationFrame(warpRaf);
    warpLoop();
  }

  function warpLoop() {
    ctx.clearRect(0, 0, W, H);
    warpT++;
    if (warpT > 22) {
      warpActive = false;
      warpC.style.opacity = '0';
      ctx.clearRect(0, 0, W, H);
      return;
    }

    const progress = warpT / 22;
    const numStreaks = 80;
    for (let i = 0; i < numStreaks; i++) {
      const angle  = (i / numStreaks) * Math.PI * 2;
      const minR   = 60 + progress * 80;
      const length = progress * 250 + 20;
      const alpha  = (1 - progress) * 0.5;

      ctx.beginPath();
      ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
      ctx.lineWidth = Math.random() * 1.2 + 0.3;
      ctx.moveTo(CX() + Math.cos(angle) * minR, CY() + Math.sin(angle) * minR);
      ctx.lineTo(CX() + Math.cos(angle) * (minR + length), CY() + Math.sin(angle) * (minR + length));
      ctx.stroke();
    }
    warpRaf = requestAnimationFrame(warpLoop);
  }

  document.addEventListener('click', e => {
    const link = e.target.closest('.nav-link, .pdot, .scroll-cta');
    if (link) triggerWarp();
  });
})();

/* ═══════════════════════════════════════════════════
   NEW-6. DYNAMIC ISLAND ANIMATION
═══════════════════════════════════════════════════ */
(function() {
  const island = document.querySelector('.dynamic-island');
  if (!island) return;

  const notifications = [
    { icon:'📬', text:'New message received' },
    { icon:'☁',  text:'Cloud deploy complete' },
    { icon:'✅',  text:'Pipeline passed' },
    { icon:'🔔',  text:'achansaipranay3@gmail.com' },
  ];
  let expanded = false, nIdx = 0;

  function expand() {
    if (expanded) return;
    expanded = true;
    const n = notifications[nIdx % notifications.length];
    nIdx++;
    island.innerHTML = `
      <div class="di-notif">
        <span class="di-notif-icon">${n.icon}</span>
        <span class="di-notif-text">${n.text}</span>
      </div>`;
    island.classList.add('di-expanded');
    setTimeout(collapse, 2800);
  }

  function collapse() {
    island.classList.remove('di-expanded');
    setTimeout(() => {
      if (!expanded) return;
      expanded = false;
      island.innerHTML = `<div class="di-cam"></div><div class="di-sensor"></div>`;
    }, 400);
  }

  island.addEventListener('mouseenter', expand);
  setInterval(expand, 15000);
})();

/* ═══════════════════════════════════════════════════
   NEW-7. LOCK SCREEN LIVE WALLPAPER (Ken Burns)
═══════════════════════════════════════════════════ */
(function() {
  const wall = document.querySelector('.lock-wallpaper');
  if (!wall) return;
  wall.style.cssText += `
    animation: kenBurns 12s ease-in-out infinite alternate;
    transform-origin: center center;
  `;
  if (!document.getElementById('kbStyle')) {
    const s = document.createElement('style');
    s.id = 'kbStyle';
    s.textContent = `
      @keyframes kenBurns {
        0%   { transform: scale(1.0) translate(0%, 0%);    }
        25%  { transform: scale(1.06) translate(-1.5%, 1%); }
        50%  { transform: scale(1.04) translate(1%, -1.5%); }
        75%  { transform: scale(1.08) translate(-1%, 0.5%); }
        100% { transform: scale(1.05) translate(0.5%, -1%); }
      }
    `;
    document.head.appendChild(s);
  }
})();

/* ═══════════════════════════════════════════════════
   NEW-8. SPOTLIGHT CURSOR IN SKILLS SECTION
═══════════════════════════════════════════════════ */
(function() {
  if (window.innerWidth <= 900) return;
  const skillsSection = document.getElementById('skills');
  if (!skillsSection) return;

  const spotlight = document.createElement('div');
  spotlight.style.cssText = `
    position:absolute; pointer-events:none; z-index:1;
    width:340px; height:340px; border-radius:50%;
    background: radial-gradient(circle, rgba(0,212,255,0.07) 0%, rgba(0,212,255,0.03) 40%, transparent 70%);
    transform:translate(-50%,-50%);
    transition: left .08s ease, top .08s ease, opacity .4s;
    opacity:0;
  `;
  skillsSection.style.position = 'relative';
  skillsSection.appendChild(spotlight);

  let insideSkills = false;

  document.addEventListener('mousemove', e => {
    if (!insideSkills) return;
    const rect = skillsSection.getBoundingClientRect();
    spotlight.style.left = (e.clientX - rect.left) + 'px';
    spotlight.style.top  = (e.clientY - rect.top)  + 'px';
  }, { passive: true });

  const scrollMain = document.getElementById('scrollMain');
  const obs = new IntersectionObserver(entries => {
    insideSkills = entries[0].isIntersecting;
    spotlight.style.opacity = insideSkills ? '1' : '0';
  }, { root: scrollMain, threshold: 0.3 });
  obs.observe(skillsSection);
})();

/* ═══════════════════════════════════════════════════
   NEW-9. MORPHING SECTION DIVIDERS
═══════════════════════════════════════════════════ */
(function() {
  const sections = document.querySelectorAll('.scroll-section');
  sections.forEach((sec, i) => {
    if (i === sections.length - 1) return;
    const wrap = document.createElement('div');
    wrap.className = 'wave-divider';
    wrap.innerHTML = `
      <svg viewBox="0 0 1440 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <path class="wave-path" d="M0,20 C240,40 480,0 720,20 C960,40 1200,0 1440,20 L1440,40 L0,40 Z"/>
      </svg>`;
    sec.appendChild(wrap);
  });
})();

/* ═══════════════════════════════════════════════════
   NEW-10. PORTAL TRANSITION BETWEEN SECTIONS
═══════════════════════════════════════════════════ */
(function() {
  if (window.innerWidth <= 900) return;
  const portal = document.createElement('div');
  portal.id = 'portalOverlay';
  portal.style.cssText = `
    position:fixed; inset:0; z-index:490;
    pointer-events:none; overflow:hidden;
  `;
  portal.innerHTML = `
    <div id="portalIris" style="
      position:absolute; border-radius:50%;
      background: radial-gradient(circle, rgba(0,212,255,0.15) 0%, rgba(7,13,26,0.95) 60%, transparent 100%);
      transform: translate(-50%,-50%) scale(0);
      transition: transform 0.45s cubic-bezier(.77,0,.18,1), opacity 0.3s;
      opacity:0;
      width:200vmax; height:200vmax;
      top:50%; left:50%;
      pointer-events:none;
    "></div>`;
  document.body.appendChild(portal);

  const iris = document.getElementById('portalIris');
  let portalCooldown = false;

  function flash() {
    if (portalCooldown) return;
    portalCooldown = true;
    iris.style.opacity = '1';
    iris.style.transform = 'translate(-50%,-50%) scale(0.015)';
    iris.getBoundingClientRect();
    iris.style.transition = 'transform 0.38s cubic-bezier(.77,0,.18,1), opacity 0.3s';
    iris.style.transform = 'translate(-50%,-50%) scale(1)';

    setTimeout(() => {
      iris.style.transform = 'translate(-50%,-50%) scale(0)';
      iris.style.opacity = '0';
      setTimeout(() => { portalCooldown = false; }, 500);
    }, 380);
  }

  document.addEventListener('click', e => {
    if (e.target.closest('.nav-link, .pdot, .scroll-cta')) flash();
  });
})();

/* ═══════════════════════════════════════════════════
   ORBITAL SKILLS SYSTEM — v4
═══════════════════════════════════════════════════ */
(function() {
  const canvas = document.getElementById('orbitalCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const RINGS = [
    {
      radius: 0.17, speed: 0.00055, color: [0,212,255],
      label: 'Cloud & DevOps',
      skills: [
        { name:'Docker',         pct:0.90, used:'K8s Microservices · All projects'        },
        { name:'Kubernetes',     pct:0.80, used:'CNCF contributions · Codtech internship' },
        { name:'AWS',            pct:0.85, used:'Codtech internship · Personal infra'     },
        { name:'Linux',          pct:0.85, used:'Daily driver · Scripting · Server admin' },
      ],
    },
    {
      radius: 0.29, speed: 0.00038, color: [124,58,237],
      label: 'CI/CD & IaC',
      skills: [
        { name:'GitHub Actions', pct:0.88, used:'Automated CI/CD · Secure Pipeline'      },
        { name:'Terraform',      pct:0.75, used:'IaC patterns · Multi-env deploys'       },
        { name:'Jenkins',        pct:0.78, used:'Automated CI/CD · Codtech internship'   },
        { name:'Helm',           pct:0.72, used:'K8s Microservices · Package management' },
        { name:'ArgoCD',         pct:0.55, used:'GitOps exploration · CNCF ecosystem'    },
      ],
    },
    {
      radius: 0.41, speed: 0.00025, color: [16,185,129],
      label: 'Languages',
      skills: [
        { name:'Python',         pct:0.80, used:'Automation scripts · Data tasks'        },
        { name:'Bash',           pct:0.85, used:'CI/CD scripts · Linux automation'       },
        { name:'YAML',           pct:0.92, used:'K8s manifests · Docker Compose'         },
        { name:'C / C++',        pct:0.65, used:'MCET academics · Competitive prog.'     },
        { name:'Go',             pct:0.40, used:'Learning for K8s operators'             },
      ],
    },
    {
      radius: 0.53, speed: 0.00016, color: [255,189,46],
      label: 'Tools',
      skills: [
        { name:'Prometheus',     pct:0.70, used:'Monitoring pipelines · SRE learning'    },
        { name:'Grafana',        pct:0.68, used:'Dashboards · Observability'             },
        { name:'Ansible',        pct:0.65, used:'Config management · Automation'         },
        { name:'Git',            pct:0.92, used:'Every project · Open-source contrib.'   },
        { name:'ELK Stack',      pct:0.60, used:'Log analysis · Debugging pipelines'    },
        { name:'nginx',          pct:0.62, used:'Reverse proxy · Web servers'            },
      ],
    },
  ];

  const c = ([r,g,b], a=1) => `rgba(${r},${g},${b},${a})`;

  const nodes = [];
  RINGS.forEach((ring, ri) => {
    ring.skills.forEach((sk, si) => {
      const total = ring.skills.length;
      nodes.push({
        ring: ri, skill: sk,
        baseAngle: (si / total) * Math.PI * 2,
        x:0, y:0, prevX:[], prevY:[],
        r: 5 + sk.pct * 6.5,
        color: ring.color,
        speed: ring.speed * (ri % 2 === 0 ? 1 : -1),
        hovered:false, pinned:false,
        entryProgress: 0,
        entryDelay: ri * 0.35 + si * 0.08,
        bursts: [],
        wasHovered: false,
      });
    });
  });

  let W, H, CX, CY, MAX_R;
  let hoveredNode = null;
  let pinnedNode = null;
  let lastDisplayNode = null;
  let pendingDetailNode = null;
  let detailFlushScheduled = false;

  let mouseX = -9999, mouseY = -9999;
  let t = 0, startT = null;
  let animating = false;

  const detailEl = document.getElementById('orbitalDetail');
  const elName   = document.getElementById('odName');
  const elLvl    = document.getElementById('odLevel');
  const elFill   = document.getElementById('odFill');
  const elUsed   = document.getElementById('odUsed');

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const size = Math.min(rect.width, 560);
    const dpr  = window.devicePixelRatio || 1;
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width  = size + 'px';
    canvas.style.height = size + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    W = H = size;
    CX = CY = size / 2;
    MAX_R = size * 0.5 * 0.82;
  }

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

  function getPos(node, time, radiusScale) {
    radiusScale = radiusScale || 1;
    const ring = RINGS[node.ring];
    const r = ring.radius * MAX_R * 2 * radiusScale;
    const a = node.baseAngle + time * node.speed * 1000;
    return { x: CX + Math.cos(a) * r, y: CY + Math.sin(a) * r };
  }

  function levelLabel(pct) {
    if (pct >= 0.88) return 'Expert';
    if (pct >= 0.75) return 'Advanced';
    if (pct >= 0.60) return 'Proficient';
    if (pct >= 0.40) return 'Intermediate';
    return 'Learning';
  }

  function requestDetailUpdate(node) {
    pendingDetailNode = node;
    if (!detailFlushScheduled) {
      detailFlushScheduled = true;
      setTimeout(_flushDetail, 0);
    }
  }

  function _flushDetail() {
    detailFlushScheduled = false;
    if (!detailEl) return;

    const node = pendingDetailNode;

    if (!node) {
      if (lastDisplayNode !== null) {
        detailEl.classList.remove('show');
        lastDisplayNode = null;
      }
      return;
    }

    if (lastDisplayNode === node) return;
    lastDisplayNode = node;

    elName.textContent = node.skill.name;
    elLvl.textContent  = levelLabel(node.skill.pct) + ' · ' + Math.round(node.skill.pct * 100) + '%';
    elUsed.textContent = node.skill.used;
    const [r,g,b] = node.color;
    elFill.style.background = `linear-gradient(90deg, rgb(${r},${g},${b}), rgba(${r},${g},${b},0.5))`;
    elFill.style.boxShadow  = `0 0 10px rgba(${r},${g},${b},0.6)`;
    elFill.style.width = '0%';
    detailEl.classList.add('show');
    requestAnimationFrame(() => {
      if (lastDisplayNode === node) {
        elFill.style.width = (node.skill.pct * 100) + '%';
      }
    });
  }

  function draw(ts) {
    if (!animating) return;
    if (!startT) startT = ts;
    const elapsed = (ts - startT) * 0.001;
    t = ts * 0.001;

    ctx.save();
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createRadialGradient(CX, CY, 0, CX, CY, MAX_R * 1.1);
    bg.addColorStop(0,   'rgba(0,212,255,0.04)');
    bg.addColorStop(0.5, 'rgba(7,13,26,0)');
    bg.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    RINGS.forEach((ring, ri) => {
      const r = ring.radius * MAX_R * 2;

      ctx.beginPath();
      ctx.arc(CX, CY, r, 0, Math.PI * 2);
      ctx.strokeStyle = c(ring.color, 0.1);
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 10]);
      ctx.stroke();
      ctx.setLineDash([]);

      const skills = ring.skills;
      const avgPct = skills.reduce((s, sk) => s + sk.pct, 0) / skills.length;
      const arcLen = avgPct * Math.PI * 2;
      const arcStart = -Math.PI / 2 + t * ring.speed * 1000 * 0.3;
      ctx.beginPath();
      ctx.arc(CX, CY, r, arcStart, arcStart + arcLen);
      ctx.strokeStyle = c(ring.color, 0.45);
      ctx.lineWidth = 2.5;
      ctx.shadowColor = c(ring.color, 0.6);
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      const scanA = t * ring.speed * 4000 * (ri % 2 === 0 ? 1 : -1);
      const scanLen = 0.35;
      ctx.beginPath();
      ctx.arc(CX, CY, r, scanA, scanA + scanLen);
      const scanGrad = ctx.createLinearGradient(
        CX + Math.cos(scanA) * r, CY + Math.sin(scanA) * r,
        CX + Math.cos(scanA + scanLen) * r, CY + Math.sin(scanA + scanLen) * r
      );
      scanGrad.addColorStop(0, c(ring.color, 0));
      scanGrad.addColorStop(1, c(ring.color, 0.6));
      ctx.strokeStyle = scanGrad;
      ctx.lineWidth = 2;
      ctx.stroke();

      const labelA = -Math.PI / 2;
      const lx = CX + Math.cos(labelA) * r;
      const ly = CY + Math.sin(labelA) * r - 8;
      ctx.font = "500 9px 'JetBrains Mono', monospace";
      ctx.fillStyle = c(ring.color, 0.55);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(ring.label, lx, ly);
    });

    hoveredNode = null;

    nodes.forEach(node => {
      const ep = Math.min(1, Math.max(0, (elapsed - node.entryDelay) / 0.7));
      node.entryProgress = easeOut(ep);
      if (ep <= 0) return;

      const pos = getPos(node, t, node.entryProgress);
      node.x = pos.x; node.y = pos.y;

      node.prevX.push(node.x);
      node.prevY.push(node.y);
      if (node.prevX.length > 18) { node.prevX.shift(); node.prevY.shift(); }

      const dx = mouseX - node.x, dy = mouseY - node.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      node.hovered = dist < node.r + 16;
      if (node.hovered) hoveredNode = node;

      const isActive = node.hovered || node === pinnedNode;

      if (node.prevX.length > 2) {
        for (let i = 1; i < node.prevX.length; i++) {
          const frac = i / node.prevX.length;
          const tailAlpha = frac * (isActive ? 0.5 : 0.22);
          const tailR = node.r * frac * 0.55;
          ctx.beginPath();
          ctx.arc(node.prevX[i], node.prevY[i], Math.max(0.5, tailR), 0, Math.PI * 2);
          ctx.fillStyle = c(node.color, tailAlpha);
          ctx.fill();
        }
      }

      const glowR = node.r * (isActive ? 4.5 : 2.8);
      const grd = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, glowR);
      grd.addColorStop(0, c(node.color, isActive ? 0.4 : 0.15));
      grd.addColorStop(1, c(node.color, 0));
      ctx.beginPath();
      ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.fill();

      const drawR = node.r * (isActive ? 1.4 : 1) * node.entryProgress;
      ctx.beginPath();
      ctx.arc(node.x, node.y, drawR, 0, Math.PI * 2);
      const nGrd = ctx.createRadialGradient(
        node.x - drawR * 0.3, node.y - drawR * 0.3, 0,
        node.x, node.y, drawR
      );
      nGrd.addColorStop(0, c(node.color, isActive ? 1 : 0.9));
      nGrd.addColorStop(0.6, c(node.color, isActive ? 0.8 : 0.65));
      nGrd.addColorStop(1,   c(node.color, 0.3));
      ctx.fillStyle = nGrd;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(node.x, node.y, drawR, 0, Math.PI * 2);
      ctx.strokeStyle = isActive ? 'rgba(255,255,255,0.8)' : c(node.color, 0.5);
      ctx.lineWidth = isActive ? 1.5 : 0.8;
      if (isActive) { ctx.shadowColor = c(node.color, 0.9); ctx.shadowBlur = 12; }
      ctx.stroke();
      ctx.shadowBlur = 0;

      const pArcLen = node.skill.pct * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(node.x, node.y, drawR + 4, -Math.PI/2, -Math.PI/2 + pArcLen);
      ctx.strokeStyle = c(node.color, isActive ? 0.9 : 0.4);
      ctx.lineWidth = isActive ? 2 : 1.2;
      ctx.stroke();

      const ldx = node.x - CX, ldy = node.y - CY;
      const lLen = Math.sqrt(ldx*ldx + ldy*ldy) || 1;
      const lx3 = node.x + (ldx/lLen) * (drawR + 13);
      const ly3 = node.y + (ldy/lLen) * (drawR + 13);

      ctx.font = `${isActive ? '600' : '400'} ${isActive ? 11 : 9}px 'JetBrains Mono', monospace`;
      ctx.fillStyle = isActive ? '#fff' : c(node.color, 0.8);
      ctx.textAlign = lx3 < CX ? 'right' : 'left';
      ctx.textBaseline = ly3 < CY ? 'bottom' : 'top';
      ctx.fillText(node.skill.name, lx3, ly3);

      if (node.hovered && !node.wasHovered) {
        for (let i = 0; i < 8; i++) {
          const a = Math.random() * Math.PI * 2;
          const spd = Math.random() * 2 + 1;
          node.bursts.push({ x:node.x, y:node.y, vx:Math.cos(a)*spd, vy:Math.sin(a)*spd, life:1 });
        }
      }
      node.wasHovered = node.hovered;

      for (let bi = node.bursts.length - 1; bi >= 0; bi--) {
        const b = node.bursts[bi];
        b.x += b.vx; b.y += b.vy; b.life -= 0.06; b.vx *= 0.92; b.vy *= 0.92;
        if (b.life <= 0) {
          node.bursts.splice(bi, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(b.x, b.y, 1.5 * b.life, 0, Math.PI * 2);
        ctx.fillStyle = c(node.color, b.life * 0.9);
        ctx.fill();
      }
    });

    const activeNode = hoveredNode || pinnedNode;
    if (activeNode) {
      const [r2,g2,b2] = activeNode.color;
      const beamGrad = ctx.createLinearGradient(CX, CY, activeNode.x, activeNode.y);
      beamGrad.addColorStop(0,   `rgba(${r2},${g2},${b2},0)`);
      beamGrad.addColorStop(0.4, `rgba(${r2},${g2},${b2},0.3)`);
      beamGrad.addColorStop(1,   `rgba(${r2},${g2},${b2},0.7)`);
      ctx.beginPath();
      ctx.moveTo(CX, CY);
      ctx.lineTo(activeNode.x, activeNode.y);
      ctx.strokeStyle = beamGrad;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      nodes.forEach(sib => {
        if (sib.ring !== activeNode.ring || sib === activeNode) return;
        if (sib.entryProgress < 0.5) return;
        const sg = ctx.createLinearGradient(activeNode.x, activeNode.y, sib.x, sib.y);
        sg.addColorStop(0,   c(activeNode.color, 0.3));
        sg.addColorStop(1,   c(activeNode.color, 0.06));
        ctx.beginPath();
        ctx.moveTo(activeNode.x, activeNode.y);
        ctx.lineTo(sib.x, sib.y);
        ctx.strokeStyle = sg;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      });
    }

    const pulse = 0.5 + Math.sin(t * 1.6) * 0.5;
    const coreR = 28;

    [0.06, 0.12, 0.22].forEach((a, i) => {
      const gr = coreR * (4 - i) * (1 + pulse * 0.12);
      const gg = ctx.createRadialGradient(CX, CY, 0, CX, CY, gr);
      gg.addColorStop(0, `rgba(0,212,255,${a})`);
      gg.addColorStop(1, 'rgba(0,212,255,0)');
      ctx.beginPath();
      ctx.arc(CX, CY, gr, 0, Math.PI * 2);
      ctx.fillStyle = gg;
      ctx.fill();
    });

    ctx.beginPath();
    ctx.arc(CX, CY, coreR, 0, Math.PI * 2);
    const coreBodyGrd = ctx.createRadialGradient(CX-8, CY-8, 0, CX, CY, coreR);
    coreBodyGrd.addColorStop(0, 'rgba(0,40,60,0.98)');
    coreBodyGrd.addColorStop(1, 'rgba(0,15,25,0.98)');
    ctx.fillStyle = coreBodyGrd;
    ctx.fill();

    const spinA = t * 1.2;
    for (let i = 0; i < 8; i++) {
      const a = spinA + (i / 8) * Math.PI * 2;
      const dotR = coreR * 0.72;
      const dotX = CX + Math.cos(a) * dotR;
      const dotY = CY + Math.sin(a) * dotR;
      const dotAlpha = 0.3 + 0.5 * Math.pow(Math.sin(a - spinA * 0.5) * 0.5 + 0.5, 2);
      ctx.beginPath();
      ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,212,255,${dotAlpha})`;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(CX, CY, coreR, 0, Math.PI * 2);
    const borderGrd = ctx.createLinearGradient(CX-coreR, CY-coreR, CX+coreR, CY+coreR);
    borderGrd.addColorStop(0, 'rgba(0,212,255,0.9)');
    borderGrd.addColorStop(0.5, 'rgba(124,58,237,0.6)');
    borderGrd.addColorStop(1, 'rgba(0,212,255,0.9)');
    ctx.strokeStyle = borderGrd;
    ctx.lineWidth = 1.8;
    ctx.shadowColor = 'rgba(0,212,255,0.8)';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.font = "700 14px 'Syne', sans-serif";
    ctx.fillStyle = 'rgba(0,212,255,1)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ASP', CX, CY);

    canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
    requestDetailUpdate(hoveredNode || pinnedNode || null);

    ctx.restore();
    requestAnimationFrame(draw);
  }

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    mouseX = (e.clientX - rect.left) * (canvas.width / dpr / rect.width);
    mouseY = (e.clientY - rect.top)  * (canvas.height / dpr / rect.height);
  }, { passive: true });

  canvas.addEventListener('mouseleave', () => {
    mouseX = -9999; mouseY = -9999;
    pinnedNode = null;
    requestDetailUpdate(null);
  });

  canvas.addEventListener('click', () => {
    if (hoveredNode) {
      pinnedNode = (pinnedNode === hoveredNode) ? null : hoveredNode;
    } else {
      pinnedNode = null;
    }
    requestDetailUpdate(hoveredNode || pinnedNode || null);
  });

  const isMobile = window.innerWidth <= 900;
  const scrollRoot = isMobile ? null : document.getElementById('scrollMain');
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !animating) {
      animating = true;
      startT = null;
      resize();
      requestAnimationFrame(draw);
      obs.disconnect();
    }
  }, { root: scrollRoot, threshold: 0.15 });

  const skillsSection = document.getElementById('skills');
  if (skillsSection) obs.observe(skillsSection);
  window.addEventListener('resize', () => { if (animating) resize(); }, { passive: true });
})();

/* ═══════════════════════════════════════════════════
   F. MATRIX RAIN COLUMN
═══════════════════════════════════════════════════ */
(function() {
  const canvas = document.getElementById('matrixCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const CHARS = '01kubectl∞{}[]|><∂∑λdockerterraformhelmawsk8s∇≡∈∉⟨⟩';
  const FONT_SIZE = 13;
  const COL_COUNT = 3;
  const cols = Array.from({ length: COL_COUNT }, (_, i) => ({
    x: W - (i + 1) * (FONT_SIZE + 6),
    y: Math.random() * H,
    speed: Math.random() * 1.2 + 0.6,
  }));

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.font = `${FONT_SIZE}px 'JetBrains Mono', monospace`;

    cols.forEach((col, ci) => {
      const colX = W - (ci + 1) * (FONT_SIZE + 6);
      for (let row = 0; row < 22; row++) {
        const charY = ((col.y - row * FONT_SIZE + H) % H);
        const distFromHead = row;
        const alpha = Math.max(0, 0.22 - distFromHead * 0.01);
        const char = CHARS[Math.floor(Math.random() * CHARS.length)];
        const color = row === 0
          ? `rgba(180,255,255,${alpha * 2.5})`
          : `rgba(0,212,255,${alpha})`;
        ctx.fillStyle = color;
        ctx.fillText(char, colX, charY);
      }
      col.y = (col.y + col.speed) % H;
    });

    cols.forEach((col, i) => { col.x = W - (i + 1) * (FONT_SIZE + 6); });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ═══════════════════════════════════════════════════
   G. CONSTELLATION CONNECT
═══════════════════════════════════════════════════ */
(function() {
  if (window.innerWidth <= 900) return;
  const overlay = document.createElement('canvas');
  overlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:4;';
  document.body.appendChild(overlay);
  const ctx = overlay.getContext('2d');
  let W, H, mouseX = -999, mouseY = -999;
  const resize = () => { W = overlay.width = window.innerWidth; H = overlay.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; }, { passive: true });

  const NODES = Array.from({ length: 40 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -(Math.random() * 0.2 + 0.05),
  }));

  const CONNECT_RADIUS = 130;
  const MOUSE_RADIUS   = 160;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    NODES.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.y < -10) { n.y = H + 10; n.x = Math.random() * W; }
      if (n.x < -10) n.x = W + 10;
      if (n.x > W + 10) n.x = -10;
    });

    const nearby = NODES.filter(n => {
      const dx = n.x - mouseX, dy = n.y - mouseY;
      return dx*dx + dy*dy < MOUSE_RADIUS * MOUSE_RADIUS;
    });

    for (let i = 0; i < nearby.length; i++) {
      for (let j = i + 1; j < nearby.length; j++) {
        const dx = nearby[i].x - nearby[j].x;
        const dy = nearby[i].y - nearby[j].y;
        const d  = Math.sqrt(dx*dx + dy*dy);
        if (d < CONNECT_RADIUS) {
          const alpha = (1 - d / CONNECT_RADIUS) * 0.35;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.moveTo(nearby[i].x, nearby[i].y);
          ctx.lineTo(nearby[j].x, nearby[j].y);
          ctx.stroke();
        }
      }
      const dx = nearby[i].x - mouseX;
      const dy = nearby[i].y - mouseY;
      const d  = Math.sqrt(dx*dx + dy*dy);
      const alpha = (1 - d / MOUSE_RADIUS) * 0.5;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
      ctx.lineWidth = 0.6;
      ctx.moveTo(nearby[i].x, nearby[i].y);
      ctx.lineTo(mouseX, mouseY);
      ctx.stroke();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ═══════════════════════════════════════════════════
   H. SPLIT CHARACTER ENTRANCE
═══════════════════════════════════════════════════ */
(function() {
  document.querySelectorAll('.split-chars').forEach(el => {
    const text = el.textContent;
    el.textContent = '';
    text.split('').forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.style.animationDelay = `${0.35 + i * 0.055}s`;
      el.appendChild(span);
    });
  });
})();

/* ═══════════════════════════════════════════════════
   I. SCRAMBLE TEXT
═══════════════════════════════════════════════════ */
(function() {
  const SCRAMBLE_CHARS = '!<>-_\\/[]{}—=+*^?#abcdefghijklmnopqrstuvwxyz01';

  function scramble(el) {
    const original = el.dataset.original || el.textContent;
    let iteration  = 0;
    const total    = original.length * 3;

    clearInterval(el._scrambleInterval);
    el._scrambleInterval = setInterval(() => {
      el.textContent = original.split('').map((ch, idx) => {
        if (idx < iteration / 3) return original[idx];
        if (ch === ' ') return ' ';
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }).join('');
      iteration++;
      if (iteration > total) {
        el.textContent = original;
        clearInterval(el._scrambleInterval);
      }
    }, 28);
  }

  const isMobile   = window.innerWidth <= 900;
  const scrollRoot = isMobile ? null : document.getElementById('scrollMain');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { scramble(e.target); obs.unobserve(e.target); }
    });
  }, { root: scrollRoot, threshold: 0.5 });

  document.querySelectorAll('.scramble-text').forEach(el => obs.observe(el));
})();

/* ═══════════════════════════════════════════════════
   J. PROGRESS DOTS NAV
═══════════════════════════════════════════════════ */
(function() {
  if (window.innerWidth <= 900) return;
  const dots = document.querySelectorAll('.pdot');
  const scrollMain = document.getElementById('scrollMain');
  if (!dots.length || !scrollMain) return;

  dots.forEach(dot => {
    dot.addEventListener('click', e => {
      e.preventDefault();
      const target = document.getElementById(dot.dataset.section);
      if (target) scrollMain.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
    });
  });

  const sections = document.querySelectorAll('.scroll-section');
  const sObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.dataset.section;
        dots.forEach(d => d.classList.toggle('active', d.dataset.section === id));
      }
    });
  }, { root: scrollMain, threshold: 0.4 });
  sections.forEach(s => sObs.observe(s));
})();

/* ═══════════════════════════════════════════════════
   K. SKILL BAR TOOLTIP
═══════════════════════════════════════════════════ */
(function() {
  const tooltip = document.getElementById('skillTooltip');
  if (!tooltip) return;

  document.querySelectorAll('.bar-item[data-tooltip]').forEach(item => {
    item.addEventListener('mouseenter', e => {
      tooltip.textContent = item.dataset.tooltip;
      tooltip.classList.add('visible');
      positionTooltip(e);
    });
    item.addEventListener('mousemove', positionTooltip);
    item.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
  });

  function positionTooltip(e) {
    const x = e.clientX + 14;
    const y = e.clientY + 14;
    const tw = tooltip.offsetWidth;
    tooltip.style.left = (x + tw > window.innerWidth - 20 ? e.clientX - tw - 14 : x) + 'px';
    tooltip.style.top  = y + 'px';
  }
})();

/* ═══════════════════════════════════════════════════
   L. NOTIFICATION BADGE
═══════════════════════════════════════════════════ */
(function() {
  const badge = document.getElementById('mailBadge');
  if (!badge) return;

  function showBadge() {
    badge.classList.add('show');
    setTimeout(() => badge.classList.remove('show'), 4000);
  }
  setTimeout(() => { showBadge(); setInterval(showBadge, 30000); }, 8000);
})();

/* ═══════════════════════════════════════════════════
   M. SCREEN REFLECTION SWEEP
═══════════════════════════════════════════════════ */
(function() {
  const ref = document.getElementById('screenReflection');
  if (!ref) return;

  function sweep() {
    ref.classList.remove('sweep');
    void ref.offsetWidth;
    ref.classList.add('sweep');
  }
  setTimeout(() => { sweep(); setInterval(sweep, 10000); }, 5000);
})();

/* ═══════════════════════════════════════════════════
   N. KONAMI CODE + "sudo hire me" EASTER EGG
═══════════════════════════════════════════════════ */
(function() {
  const overlay = document.getElementById('konamiOverlay');
  const canvas  = document.getElementById('konamiCanvas');
  if (!overlay || !canvas) return;
  const ctx = canvas.getContext('2d');

  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
                  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let kIdx = 0;

  document.addEventListener('keydown', e => {
    if (e.key === KONAMI[kIdx]) {
      kIdx++;
      if (kIdx === KONAMI.length) { triggerKonami(); kIdx = 0; }
    } else {
      kIdx = e.key === KONAMI[0] ? 1 : 0;
    }
  });

  let konamiRaf = null;
  function triggerKonami() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    overlay.classList.add('active');

    const cols   = Math.floor(canvas.width / 16);
    const drops  = Array(cols).fill(1);
    const CHARS2 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*';

    function draw() {
      ctx.fillStyle = 'rgba(0,0,0,0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00d4ff';
      ctx.font = '15px JetBrains Mono, monospace';
      drops.forEach((y, i) => {
        ctx.fillText(CHARS2[Math.floor(Math.random() * CHARS2.length)], i * 16, y * 16);
        if (y * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
      konamiRaf = requestAnimationFrame(draw);
    }
    draw();

    const close = () => {
      overlay.classList.remove('active');
      cancelAnimationFrame(konamiRaf);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      overlay.removeEventListener('click', close);
    };
    overlay.addEventListener('click', close);
    setTimeout(close, 5000);
  }

  const _origRun = window.itermRun;
  window.itermRun = function(cmd) {
    if (cmd.trim().toLowerCase() === 'sudo hire me') {
      triggerSudoHireMe();
    } else if (_origRun) {
      _origRun(cmd);
    }
  };

  setTimeout(() => {
    const input = document.getElementById('itermInput');
    if (!input) return;
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' && input.value.trim().toLowerCase() === 'sudo hire me') {
        e.stopImmediatePropagation();
        input.value = '';
        triggerSudoHireMe();
      }
    }, true);
  }, 1000);

  function triggerSudoHireMe() {
    const output = document.getElementById('itermOutput');
    if (output) {
      const addLine = (cls, html) => {
        const d = document.createElement('div');
        d.className = `iterm-line ${cls}`;
        d.innerHTML = html;
        output.appendChild(d);
        output.scrollTop = output.scrollHeight;
      };
      addLine('cmd-line', '<span class="ip">achan@mcet:~$</span> sudo hire me');
      addLine('out-ok',   '[sudo] password for recruiter: ••••••••');
      addLine('out-ok',   '✓ Authentication successful');
      addLine('out-head', '🚀 EXECUTING: hire Achan Sai Pranay...');
      addLine('out-val',  'Loading: talent.yml ████████████████ 100%');
      addLine('out-ok',   '✓ DevOps skills verified');
      addLine('out-ok',   '✓ Cloud experience confirmed');
      addLine('out-ok',   '✓ Hackathon builder detected');
      addLine('out-ok',   '✓ CNCF contributor badge granted');
      addLine('out-head', '🎉 HIRE SUCCESSFUL — Contact: achansaipranay3@gmail.com');
      addLine('spacer',   '');
    }
    setTimeout(triggerKonami, 600);
  }
})();

/* ═══════════════════════════════════════════════════
   A. AURORA BOREALIS BACKGROUND
═══════════════════════════════════════════════════ */
(function() {
  const canvas = document.getElementById('auroraCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;
  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const blobs = [
    { x:0.15, y:0.3,  r:0.38, hue:185, speed:0.00018, ox:0, oy:0, phase:0    },
    { x:0.70, y:0.2,  r:0.32, hue:270, speed:0.00024, ox:0, oy:0, phase:2.1  },
    { x:0.45, y:0.75, r:0.28, hue:160, speed:0.00020, ox:0, oy:0, phase:4.3  },
    { x:0.85, y:0.6,  r:0.35, hue:200, speed:0.00016, ox:0, oy:0, phase:1.4  },
    { x:0.25, y:0.85, r:0.25, hue:290, speed:0.00022, ox:0, oy:0, phase:3.7  },
  ];

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t += 1;

    blobs.forEach(b => {
      const bx = (b.x + Math.sin(t * b.speed * 1.3 + b.phase) * 0.14) * W;
      const by = (b.y + Math.cos(t * b.speed       + b.phase) * 0.10) * H;
      const br = b.r * Math.min(W, H);

      const alpha = 0.13 + Math.sin(t * b.speed * 0.7 + b.phase) * 0.04;

      const grad = ctx.createRadialGradient(bx, by, 0, bx, by, br);
      grad.addColorStop(0,   `hsla(${b.hue},90%,60%,${alpha})`);
      grad.addColorStop(0.4, `hsla(${b.hue + 20},80%,50%,${alpha * 0.5})`);
      grad.addColorStop(1,   `hsla(${b.hue},70%,40%,0)`);

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(bx, by, br * 1.4, br * 0.7,
                  Math.sin(t * b.speed * 0.5) * 0.4, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ═══════════════════════════════════════════════════
   B. SHOOTING STARS
═══════════════════════════════════════════════════ */
(function() {
  const sc = document.getElementById('keywordsCanvas');
  if (!sc) return;
  const overlay = document.createElement('canvas');
  overlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:3;';
  document.body.appendChild(overlay);
  const ctx = overlay.getContext('2d');
  let W, H;
  const resize = () => { W = overlay.width = window.innerWidth; H = overlay.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const stars = [];

  function spawnStar() {
    const angle = (Math.random() * 20 + 20) * Math.PI / 180;
    const speed = Math.random() * 6 + 7;
    stars.push({
      x:     Math.random() * W * 0.7,
      y:     Math.random() * H * 0.4,
      vx:    Math.cos(angle) * speed,
      vy:    Math.sin(angle) * speed,
      len:   Math.random() * 100 + 80,
      alpha: 1,
      width: Math.random() * 1.2 + 0.4,
    });
  }

  function scheduleStar() {
    spawnStar();
    setTimeout(scheduleStar, Math.random() * 3500 + 3500);
  }
  setTimeout(scheduleStar, 1500);

  function spd(s) { return Math.hypot(s.vx, s.vy); }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      s.x += s.vx; s.y += s.vy;
      s.alpha -= 0.018;

      if (s.alpha <= 0 || s.x > W + 50 || s.y > H + 50) {
        stars.splice(i, 1); continue;
      }

      const sp = spd(s);
      const grad = ctx.createLinearGradient(
        s.x, s.y,
        s.x - s.vx * (s.len / sp), s.y - s.vy * (s.len / sp)
      );
      grad.addColorStop(0,   `rgba(255,255,255,${s.alpha})`);
      grad.addColorStop(0.3, `rgba(0,212,255,${s.alpha * 0.6})`);
      grad.addColorStop(1,   'rgba(0,212,255,0)');

      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth   = s.width;
      ctx.lineCap     = 'round';
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(
        s.x - s.vx * (s.len / sp),
        s.y - s.vy * (s.len / sp)
      );
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.width * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ═══════════════════════════════════════════════════
   C. GLITCH FLICKER
═══════════════════════════════════════════════════ */
(function() {
  const el = document.getElementById('glitchName');
  if (!el) return;

  el.setAttribute('data-text', el.textContent);

  function scheduleGlitch() {
    const delay = Math.random() * 6000 + 4000;
    setTimeout(() => {
      el.classList.add('glitching');
      setTimeout(() => el.classList.remove('glitching'), 150);
      scheduleGlitch();
    }, delay);
  }
  scheduleGlitch();
})();

/* ═══════════════════════════════════════════════════
   D. COUNTER NUMBER STATS BAR
═══════════════════════════════════════════════════ */
(function() {
  const statNums = document.querySelectorAll('.stat-num');
  if (!statNums.length) return;

  let animated = false;

  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function animateCounters() {
    if (animated) return;
    animated = true;

    statNums.forEach(el => {
      const target   = parseInt(el.dataset.target, 10);
      const duration = 1800 + Math.random() * 400;
      const start    = performance.now();

      el.classList.add('counting');

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased    = easeOutQuart(progress);
        el.textContent = Math.round(eased * target);

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = target;
          el.classList.remove('counting');
        }
      }
      requestAnimationFrame(tick);
    });
  }

  const bar = document.querySelector('.stats-bar');
  if (!bar) return;

  const isMobile = window.innerWidth <= 900;
  const scrollRoot = isMobile ? null : document.getElementById('scrollMain');

  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      animateCounters();
      obs.disconnect();
    }
  }, { root: scrollRoot, threshold: 0.4 });

  obs.observe(bar);
})();

/* ═══════════════════════════════════════════════════
   E. CARD 3D TILT ON HOVER
═══════════════════════════════════════════════════ */
(function() {
  if (window.innerWidth <= 900) return;

  const MAX_TILT = 12;
  const PERSPECTIVE = 800;

  document.querySelectorAll('[data-tilt]').forEach(card => {
    let rafId = null;
    let currentX = 0, currentY = 0;
    let targetX  = 0, targetY  = 0;
    let isOver   = false;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function animate() {
      currentX = lerp(currentX, targetX, 0.1);
      currentY = lerp(currentY, targetY, 0.1);

      card.style.transform =
        `perspective(${PERSPECTIVE}px) rotateX(${currentX}deg) rotateY(${currentY}deg) scale3d(1.02,1.02,1.02)`;

      if (isOver || Math.abs(currentX) > 0.05 || Math.abs(currentY) > 0.05) {
        rafId = requestAnimationFrame(animate);
      } else {
        card.style.transform = '';
        card.style.transition = 'transform 0.6s cubic-bezier(.22,1,.36,1), border-color .25s';
      }
    }

    card.addEventListener('mouseenter', () => {
      isOver = true;
      card.style.transition = 'border-color .25s';
      if (!rafId) animate();
    });

    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - 0.5;
      const y = (e.clientY - rect.top)  / rect.height - 0.5;
      targetY =  x * MAX_TILT * 2;
      targetX = -y * MAX_TILT * 2;

      card.style.setProperty('--mx', `${(x + 0.5) * 100}%`);
      card.style.setProperty('--my', `${(y + 0.5) * 100}%`);
    });

    card.addEventListener('mouseleave', () => {
      isOver   = false;
      targetX  = 0;
      targetY  = 0;
      card.style.setProperty('--mx', '50%');
      card.style.setProperty('--my', '50%');
      if (!rafId) animate();
    });
  });
})();

/* ═══════════════════════════════════════════════════
   1. CUSTOM CURSOR + GLOW TRAIL
   FIX: cursor ring getting stuck — snap ring to off-screen
        on mouseleave so it doesn't linger visibly
═══════════════════════════════════════════════════ */
(function() {
  if (window.innerWidth <= 900) return;

  const dot   = document.getElementById('cursor-dot');
  const ring  = document.getElementById('cursor-ring');
  const glow  = document.getElementById('cursor-glow');
  if (!dot || !ring || !glow) return;

  let mouseX = -200, mouseY = -200;
  let ringX  = -200, ringY  = -200;
  let visible = false;

  function applyPositions() {
    dot.style.left  = mouseX + 'px';
    dot.style.top   = mouseY + 'px';
    glow.style.left = mouseX + 'px';
    glow.style.top  = mouseY + 'px';
  }

  function animateRing() {
    // Only lerp when visible — prevents the ring lagging far behind
    if (visible) {
      ringX += (mouseX - ringX) * 0.14;
      ringY += (mouseY - ringY) * 0.14;
    } else {
      // Snap immediately when not visible so it never appears "stuck"
      ringX = mouseX;
      ringY = mouseY;
    }
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    applyPositions();
  }, { passive: true });

  const hoverEls = 'a, button, [onclick], .ios-app, .nav-link, .iterm-cmd-item, .ttt-cell, .proj-card-big, .ccard, .chip, .card-stack span, .btn-resume';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hoverEls)) document.body.classList.add('cursor-hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hoverEls)) document.body.classList.remove('cursor-hover');
  });

  document.addEventListener('mousedown', () => document.body.classList.add('cursor-click'));
  document.addEventListener('mouseup',   () => document.body.classList.remove('cursor-click'));

  // FIX: on mouseleave, immediately snap ring to off-screen position
  document.addEventListener('mouseleave', () => {
    visible = false;
    mouseX = -200; mouseY = -200;
    ringX  = -200; ringY  = -200;
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
    glow.style.opacity = '0';
    // Force immediate position update so ring doesn't ghost on re-enter
    ring.style.left = '-200px';
    ring.style.top  = '-200px';
  });

  document.addEventListener('mouseenter', () => {
    visible = true;
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
    glow.style.opacity = '1';
  });
})();

/* ═══════════════════════════════════════════════════
   2. MAGNETIC BUTTONS
═══════════════════════════════════════════════════ */
(function() {
  if (window.innerWidth <= 900) return;

  const STRENGTH = 0.38;
  const RADIUS   = 90;

  document.querySelectorAll('[data-magnetic]').forEach(el => {
    let tx = 0, ty = 0;
    let active = false;

    function onMove(e) {
      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = e.clientX - cx;
      const dy   = e.clientY - cy;
      const dist = Math.sqrt(dx*dx + dy*dy);

      if (dist < RADIUS) {
        active = true;
        const pull = (1 - dist / RADIUS);
        tx = dx * STRENGTH * pull;
        ty = dy * STRENGTH * pull;
        el.style.transition = 'transform 0.1s ease';
        el.style.transform  = `translate(${tx}px, ${ty}px)`;
      } else if (active) {
        active = false;
        el.style.transition = 'transform 0.5s cubic-bezier(.22,1,.36,1)';
        el.style.transform  = 'translate(0,0)';
      }
    }

    function onLeave() {
      active = false;
      el.style.transition = 'transform 0.5s cubic-bezier(.22,1,.36,1)';
      el.style.transform  = 'translate(0,0)';
    }

    document.addEventListener('mousemove', onMove, { passive: true });
    el.addEventListener('mouseleave', onLeave);
  });
})();

/* ═══════════════════════════════════════════════════
   3. BUTTON RIPPLE EFFECT
═══════════════════════════════════════════════════ */
(function() {
  function addRipple(e) {
    const btn  = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x    = e.clientX - rect.left - size / 2;
    const y    = e.clientY - rect.top  - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple-wave';
    ripple.style.cssText = `
      width: ${size}px; height: ${size}px;
      left: ${x}px; top: ${y}px;
    `;
    btn.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  }

  function attachRipples() {
    document.querySelectorAll('.btn-primary, .btn-outline, .btn-resume').forEach(btn => {
      if (!btn.dataset.rippleAttached) {
        btn.addEventListener('click', addRipple);
        btn.dataset.rippleAttached = '1';
      }
    });
  }
  attachRipples();
  new MutationObserver(attachRipples).observe(document.body, { childList: true, subtree: true });
})();

/* ═══════════════════════════════════════════════════
   4. SCROLL-LINKED PARALLAX
═══════════════════════════════════════════════════ */
(function() {
  if (window.innerWidth <= 900) return;
  const scrollMain = document.getElementById('scrollMain');
  if (!scrollMain) return;

  const orbs = [
    { el: null, selector: '#about .orb-cyan',      rate: 0.18 },
    { el: null, selector: '#projects .orb-purple',  rate: -0.12 },
    { el: null, selector: '#skills .orb-green',     rate: 0.22 },
    { el: null, selector: '#contact .orb-cyan',     rate: -0.15 },
  ];

  function resolveOrbs() {
    orbs.forEach(o => { o.el = document.querySelector(o.selector); });
  }
  setTimeout(resolveOrbs, 500);

  let ticking = false;
  scrollMain.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const st = scrollMain.scrollTop;
      orbs.forEach(o => {
        if (!o.el) return;
        const offset = st * o.rate;
        o.el.style.transform = `translateY(calc(-50% + ${offset}px))`;
      });
      ticking = false;
    });
  }, { passive: true });

  scrollMain.addEventListener('scroll', () => {
    requestAnimationFrame(() => {
      const st = scrollMain.scrollTop;
      const hero = document.querySelector('.hero-name');
      if (hero) hero.style.transform = `translateY(${st * 0.06}px)`;
    });
  }, { passive: true });
})();

/* ─────────────────────────────
   SKILLS PANEL OPEN / CLOSE
───────────────────────────── */
window.openSkillsPanel = function() {
  const panel    = document.getElementById('skillsPanel');
  const backdrop = document.getElementById('skillsPanelBackdrop');
  if (!panel || !backdrop) return;
  panel.classList.add('open');
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeSkillsPanel = function() {
  const panel    = document.getElementById('skillsPanel');
  const backdrop = document.getElementById('skillsPanelBackdrop');
  if (!panel || !backdrop) return;
  panel.classList.remove('open');
  backdrop.classList.remove('open');
  document.body.style.overflow = '';
};

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') window.closeSkillsPanel();
});

/* ─────────────────────────────
   PARTICLES
───────────────────────────── */
(function() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  const isMobileCheck = () => window.innerWidth <= 900;
  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const COUNT = isMobileCheck() ? 35 : 80;
  const LINK_DIST = 110;
  const LINK_DIST_SQ = LINK_DIST * LINK_DIST;

  const COLS = ['rgba(0,212,255,', 'rgba(124,58,237,', 'rgba(16,185,129,'];
  window._pts = Array.from({length: COUNT}, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.5 + 0.4,
    vy: -(Math.random() * 0.25 + 0.07),
    vx: (Math.random() - 0.5) * 0.2,
    baseVx: 0, baseVy: 0,
    op: Math.random() * 0.4 + 0.08,
    pp: Math.random() * Math.PI * 2,
    ps: Math.random() * 0.018 + 0.006,
    color: COLS[Math.floor(Math.random() * COLS.length)],
    baseColor: null,
    gx: 0, gy: 0,
  }));
  const pts = window._pts;
  pts.forEach(p => {
    p.baseVx = p.vx;
    p.baseVy = p.vy;
    p.baseColor = p.color;
  });

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t++;
    ctx.lineWidth = 0.5;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x;
        const dy = pts[i].y - pts[j].y;
        const dSq = dx*dx + dy*dy;
        if (dSq < LINK_DIST_SQ) {
          const alpha = 0.035 * (1 - dSq / LINK_DIST_SQ);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }
    for (let k = 0; k < pts.length; k++) {
      const p = pts[k];
      const pulse = Math.sin(t * p.ps + p.pp) * 0.22 + 0.78;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = (p.colorOverride || p.color) + (p.op * pulse) + ')';
      ctx.fill();
      p.x += p.vx + p.gx;
      p.y += p.vy + p.gy;
      p.gx *= 0.88;
      p.gy *= 0.88;
      if (p.y < -6) { p.y = H + 6; p.x = Math.random() * W; }
      if (p.x < -6) p.x = W + 6;
      if (p.x > W + 6) p.x = -6;
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ─────────────────────────────
   FLOATING KEYWORDS
───────────────────────────── */
(function() {
  const canvas = document.getElementById('keywordsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize, { passive: true });

  const WORDS = [
    'kubectl','docker','terraform','kubernetes','CI/CD',
    'ansible','helm','aws','nginx','linux',
    'bash','python','git','jenkins','grafana',
    'prometheus','yaml','devops','cloud','pipeline',
    'deploy','container','pod','node','ingress',
    'github actions','argocd','vault','etcd','rbac',
    'dockerfile','eks','iam','vpc','s3',
    'microservices','sre','observability','cncf','k8s',
  ];

  const FONT = "'JetBrains Mono', monospace";

  const PALETTE = [
    'rgba(0,212,255,',
    'rgba(124,58,237,',
    'rgba(16,185,129,',
    'rgba(255,255,255,',
  ];

  const COUNT = window.innerWidth <= 900 ? 18 : 32;

  function randWord() { return WORDS[Math.floor(Math.random() * WORDS.length)]; }
  function randColor() { return PALETTE[Math.floor(Math.random() * PALETTE.length)]; }

  function spawnWord(initialY) {
    const size = Math.random() * 8 + 10;
    return {
      text:  randWord(),
      x:     Math.random() * W,
      y:     initialY !== undefined ? initialY : H + Math.random() * H,
      size,
      speed: Math.random() * 0.35 + 0.12,
      color: randColor(),
      alpha: 0,
      maxAlpha: Math.random() * 0.13 + 0.04,
      fadeDir: 1,
      fadeDone: false,
    };
  }

  const words = Array.from({ length: COUNT }, () => spawnWord(Math.random() * H));

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t++;

    for (const w of words) {
      const progress = 1 - (w.y / H);

      if (progress < 0.15) {
        w.alpha = Math.min(w.maxAlpha, w.alpha + 0.002);
      } else if (progress > 0.75) {
        w.alpha = Math.max(0, w.alpha - 0.003);
      } else {
        w.alpha = Math.min(w.maxAlpha, w.alpha + 0.004);
      }

      ctx.save();
      ctx.font = `${w.size}px ${FONT}`;
      ctx.fillStyle = w.color + w.alpha + ')';
      ctx.fillText(w.text, w.x, w.y);
      ctx.restore();

      w.y -= w.speed;

      if (w.y < -30) {
        Object.assign(w, spawnWord(H + 20));
        w.x = Math.random() * W;
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ─────────────────────────────
   PHONE 3D TILT
───────────────────────────── */
(function() {
  if (window.innerWidth <= 900) return;
  const wrapper = document.getElementById('phoneWrapper');
  if (!wrapper) return;

  let targetX = 0, targetY = 7, currentX = 0, currentY = 7;
  let isReady = false;

  setTimeout(() => { isReady = true; }, 6900);

  document.addEventListener('mousemove', e => {
    if (!isReady) return;
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    targetY = ((e.clientX - cx) / cx) * 12 + 7;
    targetX = -((e.clientY - cy) / cy) * 8;
  }, { passive: true });

  document.addEventListener('mouseleave', () => { targetX = 0; targetY = 7; });

  function animate() {
    if (isReady) {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      wrapper.style.transform = `translate(-50%, -50%) rotateX(${currentX}deg) rotateY(${currentY}deg)`;
    }
    requestAnimationFrame(animate);
  }
  animate();
})();

/* ─────────────────────────────
   CLOCK
───────────────────────────── */
function updateClock() {
  const now = new Date();
  const hh  = now.getHours().toString().padStart(2,'0');
  const mm  = now.getMinutes().toString().padStart(2,'0');
  const str = `${hh}:${mm}`;
  ['phoneTime','lockTime'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = str;
  });
  const ltb = document.getElementById('lockTimeBig');
  if (ltb) ltb.textContent = str;
  const ld = document.getElementById('lockDate');
  if (ld) ld.textContent = now.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' });
}
updateClock();
setInterval(updateClock, 15000);

/* ─────────────────────────────
   UNLOCK PHONE
───────────────────────────── */
window.unlockPhone = function() {
  const lock = document.getElementById('lockScreen');
  if (!lock) return;
  lock.style.transition = 'transform 0.5s cubic-bezier(.4,0,.2,1), opacity 0.5s';
  lock.style.transform  = 'translateY(-108%)';
  lock.style.opacity    = '0';
  lock.style.pointerEvents = 'none';
};
setTimeout(() => {
  const tz = document.getElementById('lockTapZone');
  if (tz) tz.addEventListener('click', unlockPhone);
}, 5000);

/* ─────────────────────────────
   TYPEWRITER
───────────────────────────── */
const roles = ['DevOps Engineer','Cloud Enthusiast','Hackathon Builder','CNCF Contributor','Problem Solver'];
let ri = 0, ci = 0, del = false;
const roleEl = document.getElementById('roleText');
function typeRole() {
  if (!roleEl) return;
  const cur = roles[ri];
  if (!del) {
    roleEl.textContent = cur.slice(0, ++ci);
    if (ci === cur.length) { del = true; setTimeout(typeRole, 2200); return; }
  } else {
    roleEl.textContent = cur.slice(0, --ci);
    if (ci === 0) { del = false; ri = (ri + 1) % roles.length; }
  }
  setTimeout(typeRole, del ? 52 : 82);
}
setTimeout(typeRole, 9200);

/* ─────────────────────────────
   APP OPEN / CLOSE
───────────────────────────── */
window.openApp = function(id) {
  const w = document.getElementById('app-' + id);
  if (w) w.classList.add('open');
};
window.closeApp = function(id) {
  const w = document.getElementById('app-' + id);
  if (w) w.classList.remove('open');
};
window.sendEmail = function(e) {
  e.preventDefault();
  const s = document.getElementById('emailSubject')?.value || 'Hello from your portfolio';
  const b = document.getElementById('emailBody')?.value || '';
  window.open(`mailto:achansaipranay3@gmail.com?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(b)}`, '_blank');
};

/* ─────────────────────────────
   TIC TAC TOE
───────────────────────────── */
let board = Array(9).fill(null), scores = {X:0,O:0,Draw:0}, gameOver = false, aiMode = 'easy';
const WINS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

window.setMode = function(mode) {
  aiMode = mode;
  document.getElementById('modeEasy').classList.toggle('active', mode==='easy');
  document.getElementById('modeHard').classList.toggle('active', mode==='hard');
  tttReset();
};
window.tttMove = function(i) {
  if (board[i] || gameOver) return;
  board[i] = 'X'; renderBoard();
  const r = checkWin(); if (r) { endGame(r); return; }
  document.getElementById('tttStatus').textContent = 'CPU thinking…';
  setTimeout(() => {
    const ai = aiMode === 'hard' ? bestMove() : easyMove();
    if (ai !== -1) { board[ai] = 'O'; renderBoard(); const r2 = checkWin(); if (r2) endGame(r2); else document.getElementById('tttStatus').textContent = 'Your turn — X'; }
  }, 300);
};
function easyMove() { const e = board.map((v,i)=>v?null:i).filter(v=>v!==null); return e.length ? e[Math.floor(Math.random()*e.length)] : -1; }
function bestMove() { let b=-Infinity,m=-1; for(let i=0;i<9;i++){if(!board[i]){board[i]='O';const s=mm(board,false,-Infinity,Infinity);board[i]=null;if(s>b){b=s;m=i;}}} return m; }
function mm(b,max,a,be) {
  const r=checkWin(b); if(r==='O')return 10; if(r==='X')return -10; if(r==='Draw')return 0;
  if(max){let bst=-Infinity;for(let i=0;i<9;i++){if(!b[i]){b[i]='O';bst=Math.max(bst,mm(b,false,a,be));b[i]=null;a=Math.max(a,bst);if(be<=a)break;}}return bst;}
  else{let bst=Infinity;for(let i=0;i<9;i++){if(!b[i]){b[i]='X';bst=Math.min(bst,mm(b,true,a,be));b[i]=null;be=Math.min(be,bst);if(be<=a)break;}}return bst;}
}
function checkWin(b) {
  b=b||board;
  for(const [a,c,d] of WINS) if(b[a]&&b[a]===b[c]&&b[a]===b[d]) return b[a];
  if(b.every(v=>v)) return 'Draw'; return null;
}
function getWinLine() { for(const l of WINS){const[a,c,d]=l;if(board[a]&&board[a]===board[c]&&board[a]===board[d])return l;} return null; }
function renderBoard() { document.querySelectorAll('.ttt-cell').forEach((c,i)=>{c.textContent=board[i]||'';c.className='ttt-cell';if(board[i])c.classList.add(board[i].toLowerCase());}); }
function endGame(r) {
  gameOver=true; const wl=getWinLine(); const cells=document.querySelectorAll('.ttt-cell'); const st=document.getElementById('tttStatus');
  if(r==='Draw'){scores.Draw++;st.textContent="Draw! 🤝";}
  else{if(wl)wl.forEach(i=>cells[i].classList.add('win'));if(r==='X'){scores.X++;st.textContent="You win! 🎉";}else{scores.O++;st.textContent="CPU wins! 🤖";}}
  document.getElementById('scoreX').textContent=scores.X;
  document.getElementById('scoreO').textContent=scores.O;
  document.getElementById('scoreDraw').textContent=scores.Draw;
}
window.tttReset = function() { board=Array(9).fill(null);gameOver=false;renderBoard();document.getElementById('tttStatus').textContent='Your turn — X'; };

/* ─────────────────────────────
   ICON PRESS EFFECT
───────────────────────────── */
document.querySelectorAll('.ios-app').forEach(app => {
  app.addEventListener('pointerdown', () => {
    const icon = app.querySelector('.ios-icon');
    if (icon) { icon.style.transform = 'scale(0.86)'; icon.style.transition = 'transform 0.1s ease'; }
  });
  app.addEventListener('pointerup', () => {
    const icon = app.querySelector('.ios-icon');
    if (icon) { icon.style.transform = 'scale(1)'; icon.style.transition = 'transform 0.25s cubic-bezier(.34,1.56,.64,1)'; }
  });
});

/* ═══════════════════════════════════════════════
   SMOOTH SCROLL + INTERSECTION OBSERVER
═══════════════════════════════════════════════ */
const scrollMain      = document.getElementById('scrollMain');
const topNav          = document.getElementById('topNav');
const navLinks        = document.querySelectorAll('.nav-link');
const scrollProgress  = document.getElementById('scrollProgress');
const scrollSections  = document.querySelectorAll('.scroll-section');
const scrollCtaBtns   = document.querySelectorAll('.scroll-cta');
const isMobile        = window.innerWidth <= 900;

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const targetId = link.getAttribute('href').replace('#', '');
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;
    if (isMobile) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (scrollMain) {
      scrollMain.scrollTo({ top: targetEl.offsetTop, behavior: 'smooth' });
    }
  });
});

scrollCtaBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;
    if (isMobile) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (scrollMain) {
      scrollMain.scrollTo({ top: targetEl.offsetTop, behavior: 'smooth' });
    }
  });
});

function updateProgress(scrollTop, totalHeight) {
  if (!scrollProgress) return;
  const pct = totalHeight > 0 ? scrollTop / totalHeight : 0;
  scrollProgress.style.transform = `scaleX(${pct})`;
}

if (scrollMain && !isMobile) {
  scrollMain.addEventListener('scroll', () => {
    const scrollTop = scrollMain.scrollTop;
    const totalHeight = scrollMain.scrollHeight - scrollMain.clientHeight;
    updateProgress(scrollTop, totalHeight);
    if (topNav) topNav.classList.toggle('nav-scrolled', scrollTop > 10);
  }, { passive: true });
}

const observerRoot = isMobile ? null : scrollMain;

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const sectionId = entry.target.getAttribute('data-section');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-section') === sectionId);
      });
    }
  });
}, { root: observerRoot, threshold: 0.35 });

scrollSections.forEach(section => sectionObserver.observe(section));

const revealItems = document.querySelectorAll('.reveal-item');
const revealCards = document.querySelectorAll('.reveal-card');

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { root: observerRoot, threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealItems.forEach(el => revealObserver.observe(el));
revealCards.forEach(el => revealObserver.observe(el));

const skillBlocks = document.querySelectorAll('.skill-block');
const skillObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      skillObserver.unobserve(entry.target);
    }
  });
}, { root: observerRoot, threshold: 0.2 });
skillBlocks.forEach(block => skillObserver.observe(block));

if (!isMobile) {
  document.addEventListener('keydown', e => {
    if (!scrollMain) return;
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;

    const sections = Array.from(scrollSections);
    let current = 0, maxVisible = 0;
    sections.forEach((sec, idx) => {
      const rect = sec.getBoundingClientRect();
      const containerRect = scrollMain.getBoundingClientRect();
      const visible = Math.min(rect.bottom, containerRect.bottom) - Math.max(rect.top, containerRect.top);
      if (visible > maxVisible) { maxVisible = visible; current = idx; }
    });

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = sections[Math.min(current + 1, sections.length - 1)];
      if (next) scrollMain.scrollTo({ top: next.offsetTop, behavior: 'smooth' });
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = sections[Math.max(current - 1, 0)];
      if (prev) scrollMain.scrollTo({ top: prev.offsetTop, behavior: 'smooth' });
    }
  });
}

/* ═══════════════════════════════════════════════
   3D DRAGGABLE TERMINAL
   FIX: terminal not returning to default state —
        inertia now always nudges toward default
        once velocity is low, regardless of threshold.
        idleFloat is paused during active inertia.
═══════════════════════════════════════════════ */
(function() {
  const wrapper = document.getElementById('terminal3dWrapper');
  const terminal = document.getElementById('terminal3d');
  if (!wrapper || !terminal) return;

  const DEFAULT_X = 8, DEFAULT_Y = -10, DEFAULT_Z = -1;
  let rotX = DEFAULT_X, rotY = DEFAULT_Y, rotZ = DEFAULT_Z;
  let velX = 0, velY = 0;
  let dragging = false;
  let lastX = 0, lastY = 0;
  let lastDX = 0, lastDY = 0;

  const MAX_X = 35, MAX_Y = 40;

  function applyTransform() {
    terminal.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`;
  }
  applyTransform();

  wrapper.addEventListener('mousedown', e => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    velX = 0; velY = 0;
    wrapper.style.cursor = 'grabbing';
    e.preventDefault();
  });

  window.addEventListener('mousemove', e => {
    if (!dragging) return;
    lastDX = e.clientX - lastX;
    lastDY = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;

    rotY += lastDX * 0.45;
    rotX -= lastDY * 0.45;
    rotX = Math.max(-MAX_X, Math.min(MAX_X, rotX));
    rotY = Math.max(-MAX_Y, Math.min(MAX_Y, rotY));
    applyTransform();
  });

  window.addEventListener('mouseup', () => {
    if (!dragging) return;
    dragging = false;
    wrapper.style.cursor = 'grab';
    // Use last delta as initial velocity
    velX = lastDY * 0.45;
    velY = lastDX * 0.45;
    startInertia();
  });

  wrapper.addEventListener('touchstart', e => {
    const t = e.touches[0];
    dragging = true;
    lastX = t.clientX;
    lastY = t.clientY;
    velX = 0; velY = 0;
    e.preventDefault();
  }, { passive: false });

  window.addEventListener('touchmove', e => {
    if (!dragging) return;
    const t = e.touches[0];
    lastDX = t.clientX - lastX;
    lastDY = t.clientY - lastY;
    lastX = t.clientX;
    lastY = t.clientY;

    rotY += lastDX * 0.45;
    rotX -= lastDY * 0.45;
    rotX = Math.max(-MAX_X, Math.min(MAX_X, rotX));
    rotY = Math.max(-MAX_Y, Math.min(MAX_Y, rotY));
    applyTransform();
  }, { passive: false });

  window.addEventListener('touchend', () => {
    if (!dragging) return;
    dragging = false;
    velX = lastDY * 0.45;
    velY = lastDX * 0.45;
    startInertia();
  });

  let inertiaId = null;
  let inertiaActive = false;

  function startInertia() {
    if (inertiaId) cancelAnimationFrame(inertiaId);
    inertiaActive = true;

    function step() {
      if (dragging) {
        inertiaActive = false;
        return;
      }

      // Apply velocity
      rotX -= velX;
      rotY += velY;
      rotX = Math.max(-MAX_X, Math.min(MAX_X, rotX));
      rotY = Math.max(-MAX_Y, Math.min(MAX_Y, rotY));

      // Decay velocity
      velX *= 0.88;
      velY *= 0.88;

      // Always nudge toward default — works at any velocity level
      // This guarantees return to default even after slow drags
      const snapStrength = (Math.abs(velX) < 0.5 && Math.abs(velY) < 0.5) ? 0.04 : 0.008;
      rotX += (DEFAULT_X - rotX) * snapStrength;
      rotY += (DEFAULT_Y - rotY) * snapStrength;
      rotZ += (DEFAULT_Z - rotZ) * snapStrength;

      applyTransform();

      // Stop inertia loop once very close to default and velocity is negligible
      const atDefault = Math.abs(rotX - DEFAULT_X) < 0.08
                     && Math.abs(rotY - DEFAULT_Y) < 0.08
                     && Math.abs(rotZ - DEFAULT_Z) < 0.02
                     && Math.abs(velX) < 0.02
                     && Math.abs(velY) < 0.02;

      if (atDefault) {
        rotX = DEFAULT_X; rotY = DEFAULT_Y; rotZ = DEFAULT_Z;
        velX = 0; velY = 0;
        applyTransform();
        inertiaActive = false;
        inertiaId = null;
        return;
      }

      inertiaId = requestAnimationFrame(step);
    }
    step();
  }

  // Idle float — only runs when inertia is not active and not dragging
  let idleT = 0;
  function idleFloat() {
    idleT += 0.008;

    if (!dragging && !inertiaActive) {
      const bobX = Math.sin(idleT * 1.1) * 1.5;
      const bobY = Math.cos(idleT * 0.7) * 2;
      terminal.style.transform = `rotateX(${DEFAULT_X + bobX}deg) rotateY(${DEFAULT_Y + bobY}deg) rotateZ(${DEFAULT_Z}deg)`;
    }

    requestAnimationFrame(idleFloat);
  }
  idleFloat();
})();

/* ═══════════════════════════════════════════════
   INTERACTIVE TERMINAL
═══════════════════════════════════════════════ */
(function() {
  const output  = document.getElementById('itermOutput');
  const input   = document.getElementById('itermInput');
  if (!output || !input) return;

  const COMMANDS = {
    whoami: [
      { t:'head', v:'👤  Achan Sai Pranay' },
      { t:'out',  v:'Role    : DevOps & Cloud Engineering Student' },
      { t:'out',  v:'College : Methodist College of Engineering & Technology' },
      { t:'out',  v:'City    : Hyderabad, India' },
      { t:'out',  v:'Year    : B.E. CSE 2024 – 2028' },
      { t:'sp' },
      { t:'ok',   v:'✓  CNCF Open-Source Contributor' },
      { t:'ok',   v:'✓  Hackathon Builder — Hack for Infinity 2K26' },
      { t:'ok',   v:'✓  DevOps Intern @ Codtech IT Solutions' },
    ],
    skills: [
      { t:'head', v:'🛠  Tech Stack' },
      { t:'key',  v:'Cloud & Infra  →  ' },{ t:'val', v:'AWS · Kubernetes · Terraform · Docker' },
      { t:'key',  v:'CI/CD          →  ' },{ t:'val', v:'GitHub Actions · Jenkins · ArgoCD' },
      { t:'key',  v:'Monitoring     →  ' },{ t:'val', v:'Prometheus · Grafana · ELK Stack' },
      { t:'key',  v:'Languages      →  ' },{ t:'val', v:'Python · Bash · YAML · Go (basics)' },
      { t:'key',  v:'Tools          →  ' },{ t:'val', v:'Git · Helm · Ansible · Nginx · Vault' },
      { t:'sp' },
      { t:'head', v:'📚  Currently Learning' },
      { t:'out',  v:'→  CKA (Certified Kubernetes Administrator)' },
      { t:'out',  v:'→  AWS Solutions Architect Associate' },
      { t:'out',  v:'→  Kubernetes Operators & CRDs' },
    ],
    projects: [
      { t:'head', v:'🚀  Projects' },
      { t:'table',v:'NAME                    STATUS    STACK' },
      { t:'table',v:'────────────────────────────────────────────' },
      { t:'table',v:'Neuro Reader            🏆 Live   JS · Groq AI · Chrome API' },
      { t:'table',v:'Secure DevOps Pipeline  ✓ Done   Jenkins · SonarQube · OWASP' },
      { t:'table',v:'K8s Microservices       ✓ Done   Kubernetes · Docker · Helm' },
      { t:'table',v:'Automated CI/CD         ✓ Done   GitHub Actions · Docker' },
      { t:'sp' },
      { t:'out',  v:'→  github.com/Achan-Sai-pranay' },
    ],
    experience: [
      { t:'head', v:'💼  Experience' },
      { t:'key',  v:'Mar–Apr 2026  ' },{ t:'val', v:'DevOps Intern @ Codtech IT Solutions' },
      { t:'out',  v:'             CI/CD pipelines · Docker · Jenkins' },
      { t:'out',  v:'             GitHub Actions · Kubernetes deployments' },
      { t:'sp' },
      { t:'key',  v:'Mar 2026     ' },{ t:'val', v:'Hackathon — Hack for Infinity 2K26' },
      { t:'out',  v:'             Built Neuro Reader in 8h @ Osmania University' },
      { t:'sp' },
      { t:'key',  v:'2024–now     ' },{ t:'val', v:'CNCF Open-Source Contributor' },
      { t:'out',  v:'             Kubernetes documentation & community contributions' },
    ],
    education: [
      { t:'head', v:'🎓  Education' },
      { t:'key',  v:'2024 – 2028  ' },{ t:'val', v:'B.E. Computer Science' },
      { t:'out',  v:'             Methodist College of Engineering & Technology' },
      { t:'out',  v:'             Hyderabad, Telangana' },
      { t:'sp' },
      { t:'out',  v:'Focus: DevOps · Cloud Engineering · Systems' },
      { t:'out',  v:'Target: Cloud Engineer / SRE / Platform Engineer' },
    ],
    contact: [
      { t:'head', v:'📬  Contact' },
      { t:'key',  v:'Email    ' },{ t:'val', v:'achansaipranay3@gmail.com' },
      { t:'key',  v:'GitHub   ' },{ t:'val', v:'github.com/Achan-Sai-pranay' },
      { t:'key',  v:'LinkedIn ' },{ t:'val', v:'linkedin.com/in/achan-sai-pranay-00528239b' },
      { t:'key',  v:'Phone    ' },{ t:'val', v:'+91-8179154009' },
      { t:'key',  v:'Location ' },{ t:'val', v:'Hyderabad, India' },
      { t:'sp' },
      { t:'ok',   v:'✓  Open to internships & collaborations' },
    ],
    goals: [
      { t:'head', v:'🎯  Goals' },
      { t:'key',  v:'Short-term  ' },{ t:'val', v:'CKA + AWS SAA certifications' },
      { t:'key',  v:'Mid-term    ' },{ t:'val', v:'Platform / SRE role — Hyderabad' },
      { t:'key',  v:'Long-term   ' },{ t:'val', v:'Microsoft or Google Hyderabad SDE' },
      { t:'key',  v:'Target year ' },{ t:'val', v:'2027' },
      { t:'sp' },
      { t:'out',  v:'Roadmap: DevOps → MLOps → Cloud Architecture' },
    ],
    resume: [
      { t:'ok',   v:'Downloading resume...' },
      { t:'out',  v:'→  Achan_Sai_Pranay_Resume.pdf' },
    ],
    help: [
      { t:'head', v:'Available commands:' },
      { t:'out',  v:'whoami · skills · projects · experience' },
      { t:'out',  v:'education · contact · goals · resume · clear' },
    ],
  };

  function addLine(cls, html) {
    const div = document.createElement('div');
    div.className = `iterm-line ${cls}`;
    div.innerHTML = html;
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
    return div;
  }

  function addPromptLine(cmd) {
    addLine('cmd-line', `<span class="ip">achan@mcet:~$</span> ${escHtml(cmd)}`);
  }

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function typewriteLine(cls, text, speed=18) {
    return new Promise(resolve => {
      const div = addLine(cls, '');
      let i = 0;
      function tick() {
        div.textContent = text.slice(0, ++i);
        output.scrollTop = output.scrollHeight;
        if (i < text.length) setTimeout(tick, speed);
        else resolve();
      }
      tick();
    });
  }

  async function renderLines(lines) {
    for (const l of lines) {
      await new Promise(r => setTimeout(r, 28));
      if      (l.t === 'head')  addLine('out-head',  escHtml(l.v));
      else if (l.t === 'out')   addLine('out-line',  escHtml(l.v));
      else if (l.t === 'key')   addLine('out-key',   escHtml(l.v));
      else if (l.t === 'val')   addLine('out-val',   escHtml(l.v));
      else if (l.t === 'ok')    addLine('out-ok',    escHtml(l.v));
      else if (l.t === 'err')   addLine('out-err',   escHtml(l.v));
      else if (l.t === 'table') addLine('out-table', escHtml(l.v));
      else if (l.t === 'sp')    addLine('spacer',    '');
    }
  }

  let busy = false;

  async function runCommand(raw) {
    if (busy) return;
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    busy = true;

    addPromptLine(raw.trim());

    if (cmd === 'clear') {
      output.innerHTML = '';
      busy = false;
      return;
    }

    if (cmd === 'resume') {
      await renderLines(COMMANDS.resume);
      const a = document.createElement('a');
      a.href = 'resume.pdf';
      a.download = 'Achan_Sai_Pranay_Resume.pdf';
      a.click();
      busy = false;
      return;
    }

    if (COMMANDS[cmd]) {
      await renderLines(COMMANDS[cmd]);
    } else {
      addLine('out-err', `command not found: ${escHtml(cmd)} — type <span style="color:var(--accent)">help</span> for available commands`);
    }

    addLine('spacer', '');
    busy = false;
  }

  window.itermRun = function(cmd) {
    input.value = '';
    runCommand(cmd);
    input.focus();
  };

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = input.value;
      input.value = '';
      runCommand(val);
    }
  });

  const history = [];
  let histIdx = -1;
  input.addEventListener('keydown', e => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    if (e.key === 'ArrowUp' && histIdx < history.length - 1) histIdx++;
    if (e.key === 'ArrowDown' && histIdx > -1) histIdx--;
    input.value = histIdx >= 0 ? history[histIdx] : '';
  });

  const _orig = runCommand;
  async function runCommandTracked(raw) {
    const cmd = raw.trim();
    if (cmd) { history.unshift(cmd); histIdx = -1; }
    return _orig(raw);
  }
  window.itermRun = function(cmd) { input.value = ''; runCommandTracked(cmd); input.focus(); };
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const v = input.value; input.value = ''; runCommandTracked(v); }
  }, true);

  async function boot() {
    await new Promise(r => setTimeout(r, 400));
    await typewriteLine('out-line', 'Initializing achan-devops-shell v1.0.0 ...', 22);
    await new Promise(r => setTimeout(r, 180));
    addLine('out-ok',  '✓  Environment ready');
    addLine('out-line','Type a command or click one on the left.');
    addLine('out-line','Try: <span style="color:var(--accent)">whoami</span>, <span style="color:var(--accent)">projects</span>, or <span style="color:var(--accent)">help</span>');
    addLine('spacer',  '');
  }
  boot();

  document.querySelector('.iterm-window')?.addEventListener('click', () => input.focus());
})();