/* ============================================================
   FLOATING PARTICLES
   ============================================================ */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['rgba(0,212,255,', 'rgba(124,58,237,', 'rgba(16,185,129,'];

  function makeParticle() {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.4,
      a: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.3 + 0.08,
      drift: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.45 + 0.08,
      pulseSpeed: Math.random() * 0.02 + 0.005,
      pulsePhase: Math.random() * Math.PI * 2,
      color
    };
  }

  for (let i = 0; i < 90; i++) particles.push(makeParticle());

  // Occasional line connections
  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,212,255,${0.04 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  let tick = 0;
  function animate() {
    ctx.clearRect(0, 0, W, H);
    tick++;

    drawLines();

    particles.forEach(p => {
      // Pulse opacity
      const pulse = Math.sin(tick * p.pulseSpeed + p.pulsePhase) * 0.2 + 0.8;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + (p.opacity * pulse) + ')';
      ctx.fill();

      // Move
      p.y -= p.speed;
      p.x += p.drift;

      // Wrap
      if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
      if (p.x < -5) p.x = W + 5;
      if (p.x > W + 5) p.x = -5;
    });

    requestAnimationFrame(animate);
  }
  animate();
})();

/* ============================================================
   CLOCK
   ============================================================ */
function updateClock() {
  const now  = new Date();
  const h    = now.getHours().toString().padStart(2, '0');
  const m    = now.getMinutes().toString().padStart(2, '0');
  const str  = `${h}:${m}`;
  const tel  = document.getElementById('phoneTime');
  const lel  = document.getElementById('lockTime');
  const del2 = document.getElementById('lockDate');
  if (tel) tel.textContent = str;
  if (lel) lel.textContent = str;
  if (del2) {
    const opts = { weekday: 'long', day: 'numeric', month: 'long' };
    del2.textContent = now.toLocaleDateString('en-GB', opts);
  }
}
updateClock();
setInterval(updateClock, 15000);

/* ============================================================
   PHONE UNLOCK
   ============================================================ */
function unlockPhone() {
  const lock = document.getElementById('lockScreen') || document.querySelector('.lock-screen');
  if (lock) {
    lock.style.transition = 'transform 0.45s cubic-bezier(.4,0,.2,1)';
    lock.style.transform  = 'translateY(-110%)';
    lock.style.pointerEvents = 'none';
  }
}

/* ============================================================
   TYPEWRITER
   ============================================================ */
const roles = [
  'DevOps Engineer',
  'Cloud Enthusiast',
  'Hackathon Builder',
  'CNCF Contributor',
  'Problem Solver'
];
let rIdx = 0, cIdx = 0, deleting = false;
const roleEl = document.getElementById('roleText');

function typeRole() {
  if (!roleEl) return;
  const cur = roles[rIdx];
  if (!deleting) {
    roleEl.textContent = cur.slice(0, ++cIdx);
    if (cIdx === cur.length) { deleting = true; setTimeout(typeRole, 2200); return; }
  } else {
    roleEl.textContent = cur.slice(0, --cIdx);
    if (cIdx === 0) { deleting = false; rIdx = (rIdx + 1) % roles.length; }
  }
  setTimeout(typeRole, deleting ? 52 : 82);
}
// Start after content area comes in
setTimeout(typeRole, 9500);

/* ============================================================
   SECTION NAVIGATION
   ============================================================ */
const navLinks    = document.querySelectorAll('.nav-link');
const sections    = document.querySelectorAll('.section');
const ctaBtns     = document.querySelectorAll('.cta-nav');
const sectionOrder = ['about', 'projects', 'skills', 'contact'];

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
  const i = sectionOrder.indexOf(active.id);
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') showSection(sectionOrder[(i + 1) % 4]);
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   showSection(sectionOrder[(i - 1 + 4) % 4]);
});

function reanimateBars() {
  document.querySelectorAll('.bar-fill').forEach((b, i) => {
    b.style.animation = 'none';
    b.offsetWidth; // reflow
    b.style.setProperty('--delay', `${i * 0.07}s`);
    b.style.animation = '';
  });
}

/* ============================================================
   APP OPEN / CLOSE
   ============================================================ */
function openApp(id) {
  const w = document.getElementById('app-' + id);
  if (w) { w.classList.add('open'); }
}
function closeApp(id) {
  const w = document.getElementById('app-' + id);
  if (w) { w.classList.remove('open'); }
}

function sendEmail(e) {
  e.preventDefault();
  const sub  = document.getElementById('emailSubject')?.value || 'Hello from your portfolio';
  const body = document.getElementById('emailBody')?.value || '';
  window.open(`mailto:achansaipranay3@gmail.com?subject=${encodeURIComponent(sub)}&body=${encodeURIComponent(body)}`, '_blank');
}

/* ============================================================
   TIC TAC TOE
   ============================================================ */
let board = Array(9).fill(null);
let scores = { X: 0, O: 0, Draw: 0 };
let gameOver = false;
let aiMode = 'easy';
const WIN_LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

function setMode(mode) {
  aiMode = mode;
  document.getElementById('modeEasy').classList.toggle('active', mode === 'easy');
  document.getElementById('modeHard').classList.toggle('active', mode === 'hard');
  tttReset();
}

function tttMove(idx) {
  if (board[idx] || gameOver) return;
  board[idx] = 'X';
  renderBoard();
  const r = checkResult();
  if (r) { endGame(r); return; }
  document.getElementById('tttStatus').textContent = 'CPU thinking…';
  setTimeout(() => {
    const ai = aiMode === 'hard' ? bestMove() : easyMove();
    if (ai !== -1) {
      board[ai] = 'O';
      renderBoard();
      const r2 = checkResult();
      if (r2) endGame(r2);
      else document.getElementById('tttStatus').textContent = 'Your turn — X';
    }
  }, 320);
}

function easyMove() {
  const empty = board.map((v, i) => v ? null : i).filter(v => v !== null);
  return empty.length ? empty[Math.floor(Math.random() * empty.length)] : -1;
}

function bestMove() {
  let best = -Infinity, move = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      const s = minimax(board, false, -Infinity, Infinity);
      board[i] = null;
      if (s > best) { best = s; move = i; }
    }
  }
  return move;
}

function minimax(b, isMax, alpha, beta) {
  const r = checkResult(b);
  if (r === 'O') return 10;
  if (r === 'X') return -10;
  if (r === 'Draw') return 0;
  if (isMax) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!b[i]) { b[i] = 'O'; best = Math.max(best, minimax(b, false, alpha, beta)); b[i] = null; alpha = Math.max(alpha, best); if (beta <= alpha) break; }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!b[i]) { b[i] = 'X'; best = Math.min(best, minimax(b, true, alpha, beta)); b[i] = null; beta = Math.min(beta, best); if (beta <= alpha) break; }
    }
    return best;
  }
}

function checkResult(b) {
  b = b || board;
  for (const [a, c, d] of WIN_LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  if (b.every(v => v)) return 'Draw';
  return null;
}

function getWinLine() {
  for (const line of WIN_LINES) {
    const [a, c, d] = line;
    if (board[a] && board[a] === board[c] && board[a] === board[d]) return line;
  }
  return null;
}

function renderBoard() {
  document.querySelectorAll('.ttt-cell').forEach((cell, i) => {
    cell.textContent = board[i] || '';
    cell.className = 'ttt-cell';
    if (board[i]) cell.classList.add(board[i].toLowerCase());
  });
}

function endGame(result) {
  gameOver = true;
  const winLine = getWinLine();
  const cells = document.querySelectorAll('.ttt-cell');
  const statusEl = document.getElementById('tttStatus');
  if (result === 'Draw') {
    scores.Draw++;
    statusEl.textContent = "It's a draw! 🤝";
  } else {
    if (winLine) winLine.forEach(i => cells[i].classList.add('win'));
    if (result === 'X') { scores.X++;  statusEl.textContent = 'You win! 🎉'; }
    else                { scores.O++;  statusEl.textContent = 'CPU wins! 🤖'; }
  }
  document.getElementById('scoreX').textContent    = scores.X;
  document.getElementById('scoreO').textContent    = scores.O;
  document.getElementById('scoreDraw').textContent = scores.Draw;
}

function tttReset() {
  board = Array(9).fill(null);
  gameOver = false;
  renderBoard();
  document.getElementById('tttStatus').textContent = 'Your turn — X';
}