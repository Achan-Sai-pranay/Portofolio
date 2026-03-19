/* ─────────────────────────────
   PARTICLES
───────────────────────────── */
(function() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H;

  const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize);

  const COLS = ['rgba(0,212,255,', 'rgba(124,58,237,', 'rgba(16,185,129,'];
  const pts = Array.from({length: 80}, () => ({
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

    // Lines between close particles
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,212,255,${0.035*(1 - d/110)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.lineTo(pts[j].x, pts[j].y);
          ctx.stroke();
        }
      }
    }

    pts.forEach(p => {
      const pulse = Math.sin(t * p.ps + p.pp) * 0.22 + 0.78;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = p.color + (p.op * pulse) + ')';
      ctx.fill();
      p.y += p.vy; p.x += p.vx;
      if (p.y < -6) { p.y = H + 6; p.x = Math.random() * W; }
      if (p.x < -6) p.x = W + 6;
      if (p.x > W + 6) p.x = -6;
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ─────────────────────────────
   3D TILT on mouse move
───────────────────────────── */
(function() {
  const wrapper = document.getElementById('phoneWrapper');
  if (!wrapper) return;

  let targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  let isSlid = false;

  // After slide animation finishes, enable tilt
  setTimeout(() => { isSlid = true; }, 6000);

  document.addEventListener('mousemove', e => {
    if (!isSlid) return;
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    targetY = ((e.clientX - cx) / cx) * 10;   // rotateY
    targetX = -((e.clientY - cy) / cy) * 7;  // rotateX
  });

  document.addEventListener('mouseleave', () => { targetX = 0; targetY = 0; });

  function animate() {
    if (isSlid) {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      wrapper.style.transform = `translateX(-34vw) rotateX(${currentX}deg) rotateY(${currentY + 8}deg)`;
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

// Tap zone
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
   SECTION NAV
───────────────────────────── */
const navLinks     = document.querySelectorAll('.nav-link');
const sections     = document.querySelectorAll('.section');
const ctaBtns      = document.querySelectorAll('.cta-nav');
const secOrder     = ['about','projects','skills','contact'];

function showSection(id) {
  sections.forEach(s => s.classList.toggle('active-section', s.id === id));
  navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === id));
  if (id === 'skills') reanimateBars();
}
navLinks.forEach(l => l.addEventListener('click', e => { e.preventDefault(); showSection(l.dataset.section); }));
ctaBtns.forEach(b => b.addEventListener('click', e => { e.preventDefault(); showSection(b.dataset.target); }));
document.addEventListener('keydown', e => {
  const active = [...sections].find(s => s.classList.contains('active-section'));
  if (!active) return;
  const i = secOrder.indexOf(active.id);
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') showSection(secOrder[(i+1)%4]);
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   showSection(secOrder[(i-1+4)%4]);
});
function reanimateBars() {
  document.querySelectorAll('.bar-fill').forEach((b,i) => {
    b.style.animation = 'none'; b.offsetWidth;
    b.style.setProperty('--delay', `${i*0.07}s`);
    b.style.animation = '';
  });
}

/* ─────────────────────────────
   APP OPEN / CLOSE
───────────────────────────── */
window.openApp = function(id) {
  const w = document.getElementById('app-' + id);
  if (w) { w.classList.add('open'); }
};
window.closeApp = function(id) {
  const w = document.getElementById('app-' + id);
  if (w) { w.classList.remove('open'); }
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
   ICON PRESS EFFECT (iOS bounce)
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