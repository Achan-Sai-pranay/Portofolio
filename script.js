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
  const pts = Array.from({length: COUNT}, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    r: Math.random() * 1.5 + 0.4,
    vy: -(Math.random() * 0.25 + 0.07),
    vx: (Math.random() - 0.5) * 0.2,
    op: Math.random() * 0.4 + 0.08,
    pp: Math.random() * Math.PI * 2,
    ps: Math.random() * 0.018 + 0.006,
    color: COLS[Math.floor(Math.random() * COLS.length)]
  }));

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
      ctx.fillStyle = p.color + (p.op * pulse) + ')';
      ctx.fill();
      p.y += p.vy; p.x += p.vx;
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
   DevOps / cloud words drift upward, fade in + out
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

  // Pick a font that matches the mono theme
  const FONT = "'JetBrains Mono', monospace";

  // Colour palette — cyan / purple / green matching portfolio accents
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
    const size = Math.random() * 8 + 10; // 10–18px
    return {
      text:  randWord(),
      x:     Math.random() * W,
      y:     initialY !== undefined ? initialY : H + Math.random() * H, // start below viewport
      size,
      speed: Math.random() * 0.35 + 0.12,  // very slow drift
      color: randColor(),
      alpha: 0,
      maxAlpha: Math.random() * 0.13 + 0.04, // 0.04–0.17 — very subtle
      fadeDir: 1,  // 1=fading in, -1=fading out
      fadeDone: false,
    };
  }

  // Initial spread across the whole screen
  const words = Array.from({ length: COUNT }, () => spawnWord(Math.random() * H));

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, W, H);
    t++;

    for (const w of words) {
      // Fade in / hold / fade out based on vertical progress
      const progress = 1 - (w.y / H); // 0 at bottom, 1 at top

      if (progress < 0.15) {
        // Bottom 15% — fade in
        w.alpha = Math.min(w.maxAlpha, w.alpha + 0.002);
      } else if (progress > 0.75) {
        // Top 25% — fade out
        w.alpha = Math.max(0, w.alpha - 0.003);
      } else {
        // Middle — hold max
        w.alpha = Math.min(w.maxAlpha, w.alpha + 0.004);
      }

      // Draw
      ctx.save();
      ctx.font = `${w.size}px ${FONT}`;
      ctx.fillStyle = w.color + w.alpha + ')';
      ctx.fillText(w.text, w.x, w.y);
      ctx.restore();

      // Move upward
      w.y -= w.speed;

      // Recycle when past top
      if (w.y < -30) {
        Object.assign(w, spawnWord(H + 20));
        // randomise x fresh on recycle
        w.x = Math.random() * W;
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
})();


   (function() {
  if (window.innerWidth <= 900) return;
  const wrapper = document.getElementById('phoneWrapper');
  if (!wrapper) return;

  let targetX = 0, targetY = 7, currentX = 0, currentY = 7;
  let isReady = false;

  // Match the CSS animation end time (5.8s start + 1s duration)
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
   3D DRAGGABLE TERMINAL  (NEW)
   Drag to rotate on any axis — inertia on release
═══════════════════════════════════════════════ */
(function() {
  const wrapper = document.getElementById('terminal3dWrapper');
  const terminal = document.getElementById('terminal3d');
  if (!wrapper || !terminal) return;

  // current rotation state
  let rotX = 8, rotY = -10, rotZ = -1;
  // velocity for inertia
  let velX = 0, velY = 0;
  // drag tracking
  let dragging = false;
  let lastX = 0, lastY = 0;
  let lastDX = 0, lastDY = 0;

  // clamp ranges so it doesn't flip completely
  const MAX_X = 35, MAX_Y = 40;

  function applyTransform() {
    terminal.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`;
  }
  applyTransform();

  // Mouse events
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
    // transfer last delta to velocity for inertia
    velX = lastDY * 0.45;
    velY = lastDX * 0.45;
    startInertia();
  });

  // Touch events
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

  // Inertia + spring-back to default angle
  let inertiaId = null;
  const DEFAULT_X = 8, DEFAULT_Y = -10;

  function startInertia() {
    if (inertiaId) cancelAnimationFrame(inertiaId);
    function step() {
      if (dragging) return;
      // inertia decay
      velX *= 0.88;
      velY *= 0.88;
      rotX -= velX;
      rotY += velY;
      rotX = Math.max(-MAX_X, Math.min(MAX_X, rotX));
      rotY = Math.max(-MAX_Y, Math.min(MAX_Y, rotY));

      // spring back toward default when velocity is low
      if (Math.abs(velX) < 0.05 && Math.abs(velY) < 0.05) {
        rotX += (DEFAULT_X - rotX) * 0.04;
        rotY += (DEFAULT_Y - rotY) * 0.04;
        rotZ += (-1 - rotZ) * 0.04;
      }

      applyTransform();
      inertiaId = requestAnimationFrame(step);
    }
    step();
  }

  // Auto-float animation when not dragging (gentle idle bob)
  let idleT = 0;
  function idleFloat() {
    if (dragging) { idleT++; requestAnimationFrame(idleFloat); return; }
    idleT += 0.008;
    const bobX = Math.sin(idleT * 1.1) * 1.5;
    const bobY = Math.cos(idleT * 0.7) * 2;
    // Only apply idle when velocity is near zero (not mid-inertia)
    if (Math.abs(velX) < 0.1 && Math.abs(velY) < 0.1) {
      terminal.style.transform = `rotateX(${rotX + bobX}deg) rotateY(${rotY + bobY}deg) rotateZ(${rotZ}deg)`;
    }
    requestAnimationFrame(idleFloat);
  }
  idleFloat();
})();

/* ═══════════════════════════════════════════════
   INTERACTIVE TERMINAL
   Commands: whoami | skills | projects | experience
             education | contact | goals | resume | clear | help
═══════════════════════════════════════════════ */
(function() {
  const output  = document.getElementById('itermOutput');
  const input   = document.getElementById('itermInput');
  if (!output || !input) return;

  // ── Command database ──────────────────────────
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
      { t:'out',  v:'→  github.com/achansaipranay' },
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
      { t:'key',  v:'GitHub   ' },{ t:'val', v:'github.com/achansaipranay' },
      { t:'key',  v:'LinkedIn ' },{ t:'val', v:'linkedin.com/in/achansaipranay' },
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

  // ── Helpers ───────────────────────────────────
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

  // Typewriter for a single line — returns a Promise
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

  // Render a batch of lines with a stagger delay
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
      // trigger download
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

  // Global so the clickable sidebar calls it
  window.itermRun = function(cmd) {
    input.value = '';
    runCommand(cmd);
    input.focus();
  };

  // Keyboard enter
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = input.value;
      input.value = '';
      runCommand(val);
    }
  });

  // History navigation (↑ / ↓)
  const history = [];
  let histIdx = -1;
  input.addEventListener('keydown', e => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    if (e.key === 'ArrowUp' && histIdx < history.length - 1) histIdx++;
    if (e.key === 'ArrowDown' && histIdx > -1) histIdx--;
    input.value = histIdx >= 0 ? history[histIdx] : '';
  });
  // patch runCommand to also track history
  const _orig = runCommand;
  async function runCommandTracked(raw) {
    const cmd = raw.trim();
    if (cmd) { history.unshift(cmd); histIdx = -1; }
    return _orig(raw);
  }
  window.itermRun = function(cmd) { input.value = ''; runCommandTracked(cmd); input.focus(); };
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { const v = input.value; input.value = ''; runCommandTracked(v); }
  }, true); // capture so this runs before the earlier listener (fine — both fire)

  // ── Boot sequence ─────────────────────────────
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

  // Focus input when clicking anywhere in the terminal
  document.querySelector('.iterm-window')?.addEventListener('click', () => input.focus());
})();