/* script.js */
const boardEl   = document.getElementById("board");
const statusEl  = document.getElementById("status");
const restartBtn= document.getElementById("restartBtn");
const pvpBtn    = document.getElementById("pvpBtn");
const aiBtn     = document.getElementById("aiBtn");

const WIN_PATTERNS = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

let board, currentPlayer, gameActive, vsAI;

/* ---------- INITIALISE & RENDER ---------- */
function initGame() {
  board = Array(9).fill(null);
  currentPlayer = "X";
  gameActive = true;
  statusEl.textContent = `Player ${currentPlayer}'s turn`;
  renderBoard();
}

function renderBoard() {
  boardEl.innerHTML = "";
  board.forEach((cell, idx) => {
    const sq = document.createElement("div");
    sq.className = "square" + (cell ? " disabled" : "");
    sq.dataset.index = idx;
    sq.textContent = cell ?? "";
    sq.addEventListener("click", handleClick);
    boardEl.appendChild(sq);
  });
}

/* ---------- GAME LOGIC ---------- */
function handleClick(e) {
  const idx = +e.currentTarget.dataset.index;
  if (!gameActive || board[idx]) return;

  makeMove(idx, currentPlayer);

  const winPattern = checkWin(currentPlayer);
  if (winPattern) { finishGame(`${currentPlayer} wins!`, winPattern); return; }
  if (isDraw())   { finishGame("It's a draw!"); return; }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusEl.textContent = `Player ${currentPlayer}'s turn`;

  // AI turn
  if (gameActive && vsAI && currentPlayer === "O") aiMove();
}

function makeMove(idx, player) {
  board[idx] = player;
  renderBoard();
}

function checkWin(player) {
  return WIN_PATTERNS.find(pat => pat.every(i => board[i] === player)) || null;
}

function isDraw() { return board.every(Boolean); }

function finishGame(msg, winPattern = []) {
  gameActive = false;
  statusEl.textContent = msg;
  highlightWin(winPattern);
}

function highlightWin(pattern) {
  if (!pattern.length) return;
  [...boardEl.children].forEach((sq, i) => {
    if (pattern.includes(i)) sq.classList.add("win");
  });
}

/* ---------- AI (Minimax, perfect play) ---------- */
function aiMove() {
  const best = minimax(board.slice(), "O").index;
  makeMove(best, "O");

  const winPattern = checkWin("O");
  if (winPattern) { finishGame("O wins!", winPattern); return; }
  if (isDraw())   { finishGame("It's a draw!"); return; }

  currentPlayer = "X";
  statusEl.textContent = `Player ${currentPlayer}'s turn`;
}

function availableMoves(b) { return b.map((v,i)=>v?null:i).filter(v=>v!==null); }

function minimax(newBoard, player) {
  const avail = availableMoves(newBoard);

  if (checkTerminal(newBoard, "X")) return { score: -10 };
  if (checkTerminal(newBoard, "O")) return { score: 10 };
  if (!avail.length)                 return { score: 0 };

  const moves = [];

  for (let idx of avail) {
    const move = { index: idx };
    newBoard[idx] = player;
    const result = minimax(newBoard, player === "O" ? "X" : "O");
    move.score = result.score;
    newBoard[idx] = null;
    moves.push(move);
  }

  let bestMove, bestScore;
  if (player === "O") {
    bestScore = -Infinity;
    moves.forEach((m,i)=>{ if(m.score>bestScore){bestScore=m.score;bestMove=i;} });
  } else {
    bestScore =  Infinity;
    moves.forEach((m,i)=>{ if(m.score<bestScore){bestScore=m.score;bestMove=i;} });
  }
  return moves[bestMove];
}

function checkTerminal(b, p) { return WIN_PATTERNS.some(pat=>pat.every(i=>b[i]===p)); }

/* ---------- EVENT LISTENERS ---------- */
restartBtn.addEventListener("click", initGame);

pvpBtn.addEventListener("click", () => {
  vsAI = false;
  pvpBtn.classList.add("active");
  aiBtn.classList.remove("active");
  initGame();
});

aiBtn.addEventListener("click", () => {
  vsAI = true;
  aiBtn.classList.add("active");
  pvpBtn.classList.remove("active");
  initGame();
});

/* ---------- START FIRST GAME ---------- */
vsAI = false;
initGame();
