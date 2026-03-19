/* ============================================================
   CLOCK
   ============================================================ */
function updateClock() {
  const now = new Date();
  const h = now.getHours().toString().padStart(2,'0');
  const m = now.getMinutes().toString().padStart(2,'0');
  const timeStr = `${h}:${m}`;
  const timeEl = document.getElementById('phoneTime');
  const lockEl = document.getElementById('lockTime');
  if (timeEl) timeEl.textContent = timeStr;
  if (lockEl) lockEl.textContent = timeStr;

  const lockDateEl = document.getElementById('lockDate');
  if (lockDateEl) {
    const opts = { weekday:'long', month:'long', day:'numeric' };
    lockDateEl.textContent = now.toLocaleDateString('en-US', opts);
  }
}
updateClock();
setInterval(updateClock, 15000);

/* ============================================================
   TYPEWRITER
   ============================================================ */
const roles = ['DevOps Engineer','Cloud Enthusiast','Hackathon Builder','CNCF Contributor','Problem Solver'];
let rIdx = 0, cIdx = 0, del = false;
const roleEl = document.getElementById('roleText');
function typeRole() {
  if (!roleEl) return;
  const cur = roles[rIdx];
  if (!del) {
    roleEl.textContent = cur.slice(0, ++cIdx);
    if (cIdx === cur.length) { del = true; setTimeout(typeRole, 2200); return; }
  } else {
    roleEl.textContent = cur.slice(0, --cIdx);
    if (cIdx === 0) { del = false; rIdx = (rIdx + 1) % roles.length; }
  }
  setTimeout(typeRole, del ? 55 : 85);
}
// Start after content area animates in
setTimeout(typeRole, 10500);

/* ============================================================
   SECTION NAVIGATION (content area)
   ============================================================ */
const navLinks  = document.querySelectorAll('.nav-link');
const sections  = document.querySelectorAll('.section');
const ctaBtns   = document.querySelectorAll('.cta-nav');
const sectionOrder = ['about','projects','skills','contact'];

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
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown')  showSection(sectionOrder[(i+1)%4]);
  if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')    showSection(sectionOrder[(i-1+4)%4]);
});

function reanimateBars() {
  document.querySelectorAll('.bar-fill').forEach((b,i) => {
    b.style.animation = 'none';
    b.offsetWidth;
    b.style.setProperty('--delay', `${i * 0.07}s`);
    b.style.animation = '';
  });
}

/* ============================================================
   APP OPEN / CLOSE (phone overlays)
   ============================================================ */
const APP_LINKS = {
  github:   'https://github.com/achansaipranay',
  linkedin: 'https://linkedin.com/in/achansaipranay',
  email:    null // handled by compose UI
};

function openApp(id) {
  const win = document.getElementById('app-' + id);
  if (win) win.classList.add('open');
}

function closeApp(id) {
  const win = document.getElementById('app-' + id);
  if (win) win.classList.remove('open');
}

/* Email compose send */
function sendEmail(e) {
  e.preventDefault();
  const subject = document.getElementById('emailSubject')?.value || 'Hello from your portfolio';
  const body    = document.getElementById('emailBody')?.value || '';
  const mailto  = `mailto:achansaipranay3@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailto, '_blank');
}

/* ============================================================
   TIC TAC TOE
   ============================================================ */
let board = Array(9).fill(null);
let scores = { X: 0, O: 0, Draw: 0 };
let gameOver = false;
let aiMode = 'easy'; // 'easy' | 'hard'
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
  const res = checkResult();
  if (res) { endGame(res); return; }
  // AI turn
  setTimeout(() => {
    const aiIdx = aiMode === 'hard' ? bestMove() : easyMove();
    if (aiIdx !== -1) {
      board[aiIdx] = 'O';
      renderBoard();
      const res2 = checkResult();
      if (res2) endGame(res2);
      else document.getElementById('tttStatus').textContent = "Your turn — X";
    }
  }, 300);
  document.getElementById('tttStatus').textContent = "CPU thinking…";
}

function easyMove() {
  const empty = board.map((v,i) => v ? null : i).filter(v => v !== null);
  if (!empty.length) return -1;
  return empty[Math.floor(Math.random() * empty.length)];
}

function bestMove() {
  let best = -Infinity, move = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      const score = minimax(board, false, -Infinity, Infinity);
      board[i] = null;
      if (score > best) { best = score; move = i; }
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
  for (const [a,c,d] of WIN_LINES) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  if (b.every(v => v)) return 'Draw';
  return null;
}

function getWinLine() {
  for (const line of WIN_LINES) {
    const [a,c,d] = line;
    if (board[a] && board[a] === board[c] && board[a] === board[d]) return line;
  }
  return null;
}

function renderBoard() {
  const cells = document.querySelectorAll('.ttt-cell');
  cells.forEach((cell, i) => {
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
    if (result === 'X') { scores.X++; statusEl.textContent = "You win! 🎉"; }
    else                 { scores.O++; statusEl.textContent = "CPU wins! 🤖"; }
  }
  document.getElementById('scoreX').textContent    = scores.X;
  document.getElementById('scoreO').textContent    = scores.O;
  document.getElementById('scoreDraw').textContent = scores.Draw;
}

function tttReset() {
  board = Array(9).fill(null);
  gameOver = false;
  renderBoard();
  document.getElementById('tttStatus').textContent = "Your turn — X";
}

/* Unlock phone on click */
function unlockPhone() {
  const lock = document.getElementById('lockScreen');
  if (lock) {
    lock.style.animation = 'lockSlideUp 0.4s ease forwards';
    lock.style.pointerEvents = 'none';
  }
}