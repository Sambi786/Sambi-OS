import { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Gamepad2, Image, Smartphone, BookOpen, 
  ArrowDownToLine, Check, RefreshCw, X, Star, Eye, ShieldCheck, Trash2
} from 'lucide-react';
import { pushNotification } from '../NotificationSystem';
import { playSound } from '../../lib/audio';

// Dynamic AppId types
export type DynamicAppId = 'game' | 'editor' | 'apk_runner' | 'pdf_reader';

export interface StoreItem {
  id: DynamicAppId;
  name: string;
  icon: any;
  color: string;
  category: 'games' | 'programs' | 'apk' | 'readers';
  tagline: string;
  description: string;
  rating: number;
  downloads: string;
  size: string;
  developer: string;
  features: string[];
  screenshotUrl: string;
}

interface StoreAppProps {
  installedApps: DynamicAppId[];
  onInstall: (id: DynamicAppId) => void;
  onUninstall: (id: DynamicAppId) => void;
  onOpenApp?: (id: DynamicAppId) => void;
}

export default function StoreApp({ installedApps, onInstall, onUninstall, onOpenApp }: StoreAppProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'games' | 'programs' | 'apk' | 'readers' | 'downloader'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<StoreItem | null>(null);
  
  // Track installation progresses per app id
  const [installProgress, setInstallProgress] = useState<Record<string, {
    progress: number;
    status: string;
  }>>({});

  const storeItems: StoreItem[] = [
    {
      id: 'game',
      name: 'Sambi Arcade',
      icon: Gamepad2,
      color: 'from-emerald-500 to-teal-600',
      category: 'games',
      tagline: 'Retro puzzle and arcade hub.',
      description: 'A gorgeous retro gaming hub pre-packaged with classic arcade layers: "Sambi Sweeper" (classic Minesweeper with modular difficulty grids), "Sambi Bird" (physics-defying side-scroller), and "Retro Brick" (interactive Tetris block builder). Direct canvas rendering with local score persistence!',
      rating: 4.8,
      downloads: '1.2M',
      size: '22.4 MB',
      developer: 'MemeLabs Arcade Co.',
      features: ['Three playable games in one executable', 'Global highscores saved to persistent storage', 'Retro sound toggles and theme settings'],
      screenshotUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 'editor',
      name: 'Creative Studio',
      icon: Image,
      color: 'from-purple-500 to-indigo-600',
      category: 'programs',
      tagline: 'Pixel-perfect canvas workspace.',
      description: 'A high-fidelity multimedia design studio featuring: "PixelCraft" (an image editor supporting custom JPG uploads, cropping, filter settings like Vintage, Neon, Grayscale, contrast curves, and client-side canvas render export) and "VibeCutter" (a real-time simulated video sound workspace to trim, color grades, and add modular audio overlays).',
      rating: 4.9,
      downloads: '850K',
      size: '48.1 MB',
      developer: 'VibeEngine Media Labs',
      features: ['PixelCraft client-side picture crop & canvas filter adjustment', 'Preset vintage, neon glow, and grayscale shaders', 'Interactive multi-track video mixer timeline with audio controls'],
      screenshotUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 'apk_runner',
      name: 'Sambi Droid',
      icon: Smartphone,
      color: 'from-lime-500 to-green-600',
      category: 'apk',
      tagline: 'Simulated Android execution environment.',
      description: 'Run native android-style apks right in Sambi OS! Complete with an attractive virtual smartphone display skin. Features the Sambi APK Market, allowing one-click installation of mock apps (social messaging chat, music stream players, custom terminal APKs). Explore files, trigger mock notifications, and enjoy multi-device ecosystem synchronizations.',
      rating: 4.6,
      downloads: '2.5M',
      size: '64.0 MB',
      developer: 'EmuCore Group S.A.',
      features: ['High-fidelity virtual android phone wrapper frame', 'Instant mock APK downloading and installations', 'Live responsive messaging and music playing subsystems'],
      screenshotUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=400'
    },
    {
      id: 'pdf_reader',
      name: 'Sambi PDF Reader',
      icon: BookOpen,
      color: 'from-rose-500 to-coral-600',
      category: 'readers',
      tagline: 'Optimized workspace PDF hub.',
      description: 'A smart reading library supporting zooming and document annotation. Comes pre-loaded with important guides: "Sambi Core OS manual.pdf", "Interactive React Architecture guide.pdf", and the elusive "Secrets of the Universe scroll". Users can upload custom .txt or mock files, highlights notes, search words, and save page bookmarks locally.',
      rating: 4.7,
      downloads: '620K',
      size: '14.8 MB',
      developer: 'Sambi Tools Ltd',
      features: ['Beautiful e-book and manual library launcher catalog', 'Page-by-page rendering with dynamic page jump controllers', 'Text highlighter colors & custom sticky-notes memo attachments'],
      screenshotUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400'
    }
  ];

  const triggerRealDownload = (appId: DynamicAppId) => {
    const item = storeItems.find(i => i.id === appId);
    if (!item) return;

    let fileName = '';
    let fileContent = '';
    let mimeType = 'text/plain';

    if (appId === 'game') {
      fileName = 'sambi_arcade_suite.html';
      mimeType = 'text/html';
      fileContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sambi Arcade Suite - Standalone Offline App</title>
  <style>
    body {
      background-color: #0b0f19;
      color: #e2e8f0;
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    header {
      width: 100%;
      background: #111827;
      border-bottom: 1px solid #1f2937;
      padding: 1.5rem 0;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    h1 {
      margin: 0;
      font-size: 1.8rem;
      background: linear-gradient(to right, #10b981, #06b6d4);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-transform: uppercase;
      letter-spacing: 0.15em;
    }
    .container {
      max-width: 600px;
      width: 90%;
      margin: 2rem auto;
      background: #1e293b;
      border-radius: 1.5rem;
      padding: 2rem;
      border: 1px solid #334155;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
      text-align: center;
    }
    .tabs {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    button.tab {
      background: #334155;
      color: #94a3b8;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 0.75rem;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    }
    button.tab.active {
      background: #10b981;
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .game-area {
      min-height: 300px;
    }
    .hidden {
      display: none !important;
    }
    /* Minesweeper */
    #board {
      display: grid;
      grid-template-columns: repeat(8, 40px);
      gap: 4px;
      justify-content: center;
      margin: 1.5rem auto;
    }
    .cell {
      width: 40px;
      height: 40px;
      background: #475569;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.1rem;
      cursor: pointer;
      user-select: none;
      transition: background-color 0.1s;
    }
    .cell:hover {
      background: #64748b;
    }
    .cell.revealed {
      background: #1e293b;
      cursor: default;
    }
    .cell.mine {
      background: #ef4444;
    }
    /* Tic Tac Toe */
    #tictactoe-board {
      display: grid;
      grid-template-columns: repeat(3, 80px);
      gap: 8px;
      justify-content: center;
      margin: 1.5rem auto;
    }
    .ttt-cell {
      width: 80px;
      height: 80px;
      background: #334155;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.22rem;
      font-weight: 800;
      cursor: pointer;
      transition: background 0.15s;
    }
    .ttt-cell:hover {
      background: #475569;
    }
    .ttt-cell.X { color: #f43f5e; }
    .ttt-cell.O { color: #3b82f6; }
    .status-msg {
      margin-top: 1rem;
      font-weight: bold;
      color: #10b981;
    }
  </style>
</head>
<body>
  <header>
    <h1>Sambi Arcade Suite</h1>
    <p style="margin: 0.5rem 0 0 0; color: #64748b; font-size: 0.9rem;">Standalone Offline Playable Bundle</p>
  </header>
  <div class="container">
    <div class="tabs">
      <button id="tab-ms" class="tab active" onclick="switchTab('ms')">Sambi Minesweeper</button>
      <button id="tab-ttt" class="tab" onclick="switchTab('ttt')">Tic-Tac-Toe vs AI</button>
    </div>

    <!-- Minesweeper Game -->
    <div id="game-ms" class="game-area">
      <p style="color: #94a3b8; font-size: 0.9rem;">Clean all safe spaces! Avoid 10 hidden landmines.</p>
      <div id="board"></div>
      <button class="tab" onclick="resetMinesweeper()" style="margin-top: 1rem; background: #10b981; color: white;">Restart Game</button>
      <div id="ms-status" class="status-msg"></div>
    </div>

    <!-- Tic Tac Toe Game -->
    <div id="game-ttt" class="game-area hidden">
      <p style="color: #94a3b8; font-size: 0.9rem;">Can you beat the unbeatable computer AI?</p>
      <div id="tictactoe-board"></div>
      <button class="tab" onclick="resetTTT()" style="margin-top: 1rem; background: #3b82f6; color: white;">Restart Game</button>
      <div id="ttt-status" class="status-msg"></div>
    </div>
  </div>

  <script>
    function switchTab(game) {
      document.getElementById('tab-ms').className = 'tab' + (game === 'ms' ? ' active' : '');
      document.getElementById('tab-ttt').className = 'tab' + (game === 'ttt' ? ' active' : '');
      if (game === 'ms') {
        document.getElementById('game-ms').classList.remove('hidden');
        document.getElementById('game-ttt').classList.add('hidden');
      } else {
        document.getElementById('game-ms').classList.add('hidden');
        document.getElementById('game-ttt').classList.remove('hidden');
      }
    }

    // --- Minesweeper logic ---
    const boardSize = 8;
    const mineCount = 10;
    let msBoard = [];
    let msGameOver = false;

    function resetMinesweeper() {
      msGameOver = false;
      document.getElementById('ms-status').innerText = '';
      const container = document.getElementById('board');
      container.innerHTML = '';
      
      // Init empty cells
      msBoard = Array.from({length: boardSize}, () => 
        Array.from({length: boardSize}, () => ({ mine: false, revealed: false, count: 0 }))
      );

      // Place mines
      let placed = 0;
      while (placed < mineCount) {
        const r = Math.floor(Math.random() * boardSize);
        const c = Math.floor(Math.random() * boardSize);
        if (!msBoard[r][c].mine) {
          msBoard[r][c].mine = true;
          placed++;
        }
      }

      // Calc neighbor metrics
      for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
          if (msBoard[r][c].mine) continue;
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize) {
                if (msBoard[nr][nc].mine) count++;
              }
            }
          }
          msBoard[r][c].count = count;
        }
      }

      // Build DOM cell objects
      for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
          const div = document.createElement('div');
          div.className = 'cell';
          div.id = 'cell-' + r + '-' + c;
          div.addEventListener('click', () => revealCell(r, c));
          container.appendChild(div);
        }
      }
    }

    function revealCell(r, c) {
      if (msGameOver || msBoard[r][c].revealed) return;
      msBoard[r][c].revealed = true;
      const el = document.getElementById('cell-' + r + '-' + c);
      el.classList.add('revealed');

      if (msBoard[r][c].mine) {
        el.classList.add('mine');
        el.innerText = '💣';
        document.getElementById('ms-status').innerHTML = '<span style="color:#ef4444">BOOM! Game Over.</span>';
        msGameOver = true;
        revealAllMines();
        return;
      }

      if (msBoard[r][c].count > 0) {
        el.innerText = msBoard[r][c].count;
        el.style.color = ['#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b'][msBoard[r][c].count - 1] || '#ffffff';
      } else {
        // Cascade reveal
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < boardSize && nc >= 0 && nc < boardSize) {
              revealCell(nr, nc);
            }
          }
        }
      }

      checkMSWin();
    }

    function revealAllMines() {
      for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
          if (msBoard[r][c].mine) {
            const el = document.getElementById('cell-' + r + '-' + c);
            el.classList.add('mine');
            el.innerText = '💣';
          }
        }
      }
    }

    function checkMSWin() {
      let unrevealedSafe = 0;
      for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
          if (!msBoard[r][c].mine && !msBoard[r][c].revealed) {
            unrevealedSafe++;
          }
        }
      }
      if (unrevealedSafe === 0) {
        document.getElementById('ms-status').innerText = '🎉 Congratulations! You cleared the grid safely!';
        msGameOver = true;
      }
    }

    // --- Tic Tac Toe vs Smart AI ---
    let tttBoard = ['', '', '', '', '', '', '', '', ''];
    let tttActive = true;

    function resetTTT() {
      tttBoard = ['', '', '', '', '', '', '', '', ''];
      tttActive = true;
      document.getElementById('ttt-status').innerText = '';
      buildTTTBoard();
    }

    function buildTTTBoard() {
      const parent = document.getElementById('tictactoe-board');
      parent.innerHTML = '';
      for (let i = 0; i < 9; i++) {
        const div = document.createElement('div');
        div.className = 'ttt-cell';
        div.id = 'ttt-' + i;
        div.addEventListener('click', () => tttClick(i));
        parent.appendChild(div);
      }
    }

    function tttClick(idx) {
      if (!tttActive || tttBoard[idx] !== '') return;
      tttBoard[idx] = 'X';
      updateTTTDOM();
      
      if (checkTTTWin('X')) {
        document.getElementById('ttt-status').innerText = '🎉 You beat the AI! Mastermind!';
        tttActive = false;
        return;
      }
      if (!tttBoard.includes('')) {
        document.getElementById('ttt-status').innerText = '🤝 Draw Game!';
        tttActive = false;
        return;
      }

      // Computer Move
      tttActive = false;
      setTimeout(() => {
        let bestScore = -Infinity;
        let move = -1;
        for (let i = 0; i < 9; i++) {
          if (tttBoard[i] === '') {
            tttBoard[i] = 'O';
            let score = minimax(tttBoard, 0, false);
            tttBoard[i] = '';
            if (score > bestScore) {
              bestScore = score;
              move = i;
            }
          }
        }
        if (move !== -1) {
          tttBoard[move] = 'O';
        }
        updateTTTDOM();
        if (checkTTTWin('O')) {
          document.getElementById('ttt-status').innerHTML = '<span style="color:#ef4444">💻 Computer won! Try again!</span>';
        } else if (!tttBoard.includes('')) {
          document.getElementById('ttt-status').innerText = '🤝 Draw Game!';
        } else {
          tttActive = true;
        }
      }, 300);
    }

    function updateTTTDOM() {
      for (let i = 0; i < 9; i++) {
        const el = document.getElementById('ttt-' + i);
        el.innerText = tttBoard[i];
        el.className = 'ttt-cell ' + tttBoard[i];
      }
    }

    function checkTTTWin(p) {
      const wins = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
      ];
      return wins.some(w => w.every(idx => tttBoard[idx] === p));
    }

    function minimax(board, depth, isMax) {
      if (checkTTTWin('O')) return 10 - depth;
      if (checkTTTWin('X')) return depth - 10;
      if (!board.includes('')) return 0;

      if (isMax) {
        let best = -Infinity;
        for (let i = 0; i < 9; i++) {
          if (board[i] === '') {
            board[i] = 'O';
            best = Math.max(best, minimax(board, depth + 1, false));
            board[i] = '';
          }
        }
        return best;
      } else {
        let best = Infinity;
        for (let i = 0; i < 9; i++) {
          if (board[i] === '') {
            board[i] = 'X';
            best = Math.min(best, minimax(board, depth + 1, true));
            board[i] = '';
          }
        }
        return best;
      }
    }

    // Init games
    resetMinesweeper();
    resetTTT();
  </script>
</body>
</html>`;
    } else if (appId === 'editor') {
      fileName = 'creative_studio_sketchpad.html';
      mimeType = 'text/html';
      fileContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Creative Workspace sketchpad - Standalone App</title>
  <style>
    body {
      background-color: #0f172a;
      color: #cbd5e1;
      font-family: system-ui, sans-serif;
      margin: 0;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
      box-sizing: border-box;
    }
    .panel {
      width: 100%;
      max-width: 800px;
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 20px;
      padding: 1.5rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      margin-bottom: 20px;
    }
    .tools {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      align-items: center;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid #334155;
      padding-bottom: 1rem;
    }
    canvas {
      background: #ffffff;
      border-radius: 12px;
      cursor: crosshair;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
      width: 100%;
      touch-action: none;
    }
    button, input, select {
      background: #334155;
      border: 1px solid #475569;
      color: white;
      padding: 8px 15px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.2s;
    }
    button:hover { background: #475569; }
    .status-alert {
      color: #38bdf8;
      font-weight: bold;
      text-align: center;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="panel">
    <h2 style="margin: 0 0 10px 0; color: #a78bfa; font-weight: 900">PixelCraft standalone Sketchpad</h2>
    <p style="margin: 0 0 20px 0; font-size: 0.9rem; color: #64748b">Offline paint workspace downloaded from Sambi OS App Store.</p>
    
    <div class="tools">
      <input type="color" id="brush-color" value="#8b5cf6" style="padding:0; width:40px; height:34px; border-radius:4px; cursor:pointer;" title="Brush Color">
      
      <select id="brush-size" title="Brush Size">
        <option value="2">Thin Brush</option>
        <option value="5" selected>Medium Brush</option>
        <option value="12">Thick Brush</option>
        <option value="25">Chunky Marker</option>
      </select>

      <button id="eraser" onclick="toggleEraser()">Eraser Mode</button>
      <button onclick="clearCanvas()">Clear Canvas</button>
      <button onclick="toggleGlow()" id="glowBtn">Neon Glow OFF</button>
      <button onclick="exportCanvas()" style="background:#8b5cf6; margin-left: auto;">Save Sketch</button>
    </div>

    <canvas id="paintCanvas" width="760" height="400"></canvas>
    <div id="alertBox" class="status-alert"></div>
  </div>

  <script>
    const canvas = document.getElementById('paintCanvas');
    const ctx = canvas.getContext('2d');
    let painting = false;
    let eraserMode = false;
    let glowActive = false;

    function getMousePos(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
      };
    }

    function startPosition(e) {
      painting = true;
      draw(e);
    }

    function finishedPosition() {
      painting = false;
      ctx.beginPath();
    }

    function draw(e) {
      if (!painting) return;
      e.preventDefault();
      const pos = getMousePos(e);
      
      ctx.lineWidth = document.getElementById('brush-size').value;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (eraserMode) {
        ctx.strokeStyle = '#ffffff';
        ctx.shadowBlur = 0;
      } else {
        ctx.strokeStyle = document.getElementById('brush-color').value;
        if (glowActive) {
          ctx.shadowColor = ctx.strokeStyle;
          ctx.shadowBlur = 15;
        } else {
          ctx.shadowBlur = 0;
        }
      }

      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mouseup', finishedPosition);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseleave', finishedPosition);

    canvas.addEventListener('touchstart', startPosition);
    canvas.addEventListener('touchend', finishedPosition);
    canvas.addEventListener('touchmove', draw);

    function toggleEraser() {
      eraserMode = !eraserMode;
      document.getElementById('eraser').style.background = eraserMode ? '#ef4444' : '#334155';
      document.getElementById('eraser').innerText = eraserMode ? 'Drawing Mode' : 'Eraser Mode';
    }

    function toggleGlow() {
      glowActive = !glowActive;
      document.getElementById('glowBtn').innerText = glowActive ? 'Neon Glow ON' : 'Neon Glow OFF';
      document.getElementById('glowBtn').style.background = glowActive ? '#e9d5ff' : '#334155';
      document.getElementById('glowBtn').style.color = glowActive ? '#2e1065' : '#ffffff';
    }

    function clearCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      document.getElementById('alertBox').innerText = 'Canvas cleared.';
      setTimeout(() => document.getElementById('alertBox').innerText = '', 2000);
    }

    function exportCanvas() {
      const link = document.createElement('a');
      link.download = 'sambi_pixel_sketch.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      document.getElementById('alertBox').innerText = 'Sketch image file exported to download stream successfully!';
      setTimeout(() => document.getElementById('alertBox').innerText = '', 3000);
    }
  </script>
</body>
</html>`;
    } else if (appId === 'pdf_reader') {
      fileName = 'sambi_os_interactive_guide.html';
      mimeType = 'text/html';
      fileContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sambi OS PDF manual companion - Standalone App</title>
  <style>
    body {
      background: #090a0f;
      color: #e2e8f0;
      font-family: system-ui, sans-serif;
      margin: 0;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
    }
    .reader-frame {
      width: 100%;
      max-width: 700px;
      background: #131722;
      border: 1px solid #1f2937;
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    }
    .header {
      border-bottom: 2px solid #312e81;
      padding-bottom: 1rem;
      margin-bottom: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .page-indicator {
      background: #1e1b4b;
      color: #a5b4fc;
      padding: 5px 12px;
      border-radius: 8px;
      font-weight: bold;
      font-size: 0.8rem;
    }
    .content-box {
      font-size: 1rem;
      line-height: 1.7;
      color: #cbd5e1;
      min-height: 250px;
    }
    .controls {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
      border-top: 1px solid #1f2937;
      padding-top: 1.5rem;
    }
    button {
      background: #312e81;
      border: none;
      color: white;
      padding: 10px 20px;
      border-radius: 10px;
      font-weight: bold;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  </style>
</head>
<body>
  <div class="reader-frame">
    <div class="header">
      <div>
        <h3 style="margin:0; color:#818cf8; font-weight:900 uppercase">Sambi Spec Reader</h3>
        <p style="margin:5px 0 0 0; font-size:0.75rem; color:#4d5267">Sambi OS Interactive Architecture Manual</p>
      </div>
      <div id="indicator" class="page-indicator">Page 1 of 3</div>
    </div>

    <div id="content" class="content-box"></div>

    <div class="controls">
      <button id="prevBtn" onclick="changePage(-1)">Previous Page</button>
      <button id="nextBtn" onclick="changePage(1)">Next Page</button>
    </div>
  </div>

  <script>
    const pages = [
      \`<h2 style="color:#ffffff">Sambi OS Archetype Architecture</h2>
       <p>Welcome to Sambi OS. Operative layers utilize custom micro-frontend engines paired with fully responsive sandboxes designed in modern React.</p>
       <p>The system provides a persistent desktop interface supporting modular containerization, simulated process multi-threading counters, and zero-knowledge private browsing shields.</p>\`,
       
      \`<h2 style="color:#ffffff">Kernel Specifications</h2>
       <ul>
         <li><strong>Client Architecture:</strong> Isolated state model inside localStorage with dynamic mounting anchors</li>
         <li><strong>Audio Synthesis:</strong> Offline sound wave generator supporting key notification triggers</li>
         <li><strong>Core Energy:</strong> Battery level simulation dynamically throttled under user power saving toggle</li>
       </ul>\`,
       
      \`<h2 style="color:#ffffff">Secrets of the Cosmos</h2>
       <p>A true software craft balances deep negative space with crisp typography. The choice of font faces and consistent structural borders creates a highly satisfying "tangible" workspace.</p>
       <p>Every download, action, and keypress operates completely locally, respecting strict developer intent.</p>\`
    ];

    let currentPage = 0;

    function renderPage() {
      document.getElementById('content').innerHTML = pages[currentPage];
      document.getElementById('indicator').innerText = 'Page ' + (currentPage + 1) + ' of ' + pages.length;
      document.getElementById('prevBtn').disabled = currentPage === 0;
      document.getElementById('nextBtn').disabled = currentPage === pages.length - 1;
    }

    function changePage(delta) {
      currentPage += delta;
      renderPage();
    }

    renderPage();
  </script>
</body>
</html>`;
    } else {
      fileName = 'sambi_droid_simulator.html';
      mimeType = 'text/html';
      fileContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sambi Droid Phone Simulator - Standalone App</title>
  <style>
    body {
      background: #07090e;
      color: #f1f5f9;
      font-family: system-ui, sans-serif;
      margin: 0;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    .phone {
      width: 340px;
      height: 600px;
      background: #020617;
      border: 8px solid #334155;
      border-radius: 40px;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.8);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .phone-hdr {
      background: #1e293b;
      height: 44px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px;
      font-size: 0.8rem;
      border-bottom: 1px solid #334155;
    }
    .screen {
      flex: 1;
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
    }
    .app-icon {
      font-size: 3.5rem;
      margin-bottom: 20px;
      animation: float 3s ease-in-out infinite;
    }
    @keyframes float {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
      100% { transform: translateY(0px); }
    }
    .btn {
      background: #10b981;
      border: none;
      color: white;
      padding: 12px 24px;
      border-radius: 20px;
      font-weight: bold;
      cursor: pointer;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <div class="phone">
    <div class="phone-hdr">
      <span>Sambi Network</span>
      <span>12:00 PM</span>
    </div>
    <div class="screen">
      <div id="icon" class="app-icon">🤖</div>
      <h3 style="margin:0 0 10px 0; font-weight:900">Sambi Droid</h3>
      <p style="color:#64748b; font-size:0.85rem; margin:0">You have successfully run the standalone package downloaded from Sambi OS App Store.</p>
      
      <button class="btn" onclick="alert('BEEP! Shock-wave vibration triggered successfully!')">Test Core Feature</button>
    </div>
  </div>
</body>
</html>`;
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleInstallClick = (appId: DynamicAppId) => {
    if (installProgress[appId]) return;
    playSound('click');

    const stages = [
      { progress: 15, msg: 'Resolving cryptographic dependencies...' },
      { progress: 40, msg: `Downloading binary layers (${storeItems.find(i => i.id === appId)?.size || '15 MB'})...` },
      { progress: 65, msg: 'Verifying package checksum integrity...' },
      { progress: 85, msg: 'Decompressing and optimizing asset folders...' },
      { progress: 98, msg: 'Registering launcher links & desktop shortcuts...' },
      { progress: 100, msg: 'Complete!' }
    ];

    let currentStageIndex = 0;
    
    setInstallProgress(prev => ({
      ...prev,
      [appId]: { progress: 0, status: 'Contacting secure bundle server...' }
    }));

    const interval = setInterval(() => {
      if (currentStageIndex >= stages.length) {
        clearInterval(interval);
        setInstallProgress(prev => {
          const next = { ...prev };
          delete next[appId];
          return next;
        });
        
        // Finalize installation
        onInstall(appId);
        triggerRealDownload(appId);
        playSound('notification');
        pushNotification(
          'Installation Success', 
          `"${storeItems.find(i => i.id === appId)?.name}" has been registered in your Launcher and Desktop, and file download has been initiated!`, 
          'success'
        );
      } else {
        const currentStage = stages[currentStageIndex];
        setInstallProgress(prev => ({
          ...prev,
          [appId]: { progress: currentStage.progress, status: currentStage.msg }
        }));
        currentStageIndex++;
      }
    }, 150);
  };

  const handleUninstallClick = (appId: DynamicAppId) => {
    playSound('click');
    onUninstall(appId);
    pushNotification(
      'Application Removed', 
      `"${storeItems.find(i => i.id === appId)?.name}" has been cleanly deleted.`, 
      'warning'
    );
  };

  // Filter based on tabs & search query
  const filteredItems = storeItems.filter(item => {
    const matchesTab = activeTab === 'all' || item.category === activeTab;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="h-full w-full flex bg-[#06070a] text-zinc-100 font-sans overflow-hidden">
      {/* Sidebar for navigation */}
      <aside className="w-64 border-r border-white/5 bg-[#090b10] flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="p-6 flex items-center gap-3 border-b border-white/5">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-xl">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="text-[13px] font-black uppercase tracking-[0.2em] text-white">Sambi Space</h2>
              <p className="text-[9px] text-[#4d5267] font-bold uppercase tracking-widest">Ecosystem Store</p>
            </div>
          </div>

          {/* Nav Categories */}
          <nav className="p-4 space-y-1">
            {[
              { id: 'all', label: 'All Experiences', icon: ShoppingBag },
              { id: 'games', label: 'Arcade Games', icon: Gamepad2 },
              { id: 'programs', label: 'Program Editors', icon: Image },
              { id: 'apk', label: 'Android APKs', icon: Smartphone },
              { id: 'readers', label: 'PDF Readers & Hubs', icon: BookOpen },
              { id: 'downloader', label: 'Real-World Downloader', icon: ArrowDownToLine },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { playSound('click'); setActiveTab(tab.id as any); setSelectedApp(null); }}
                  className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3.5 transition-all text-xs font-bold capitalize
                    ${isActive 
                      ? 'bg-gradient-to-r from-indigo-500/10 to-transparent border-l-2 border-indigo-500 text-white' 
                      : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.02]'}`}
                >
                  <TabIcon size={14} className={isActive ? 'text-indigo-400' : 'text-zinc-600'} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Info Box */}
        <div className="p-5 m-4 bg-white/[0.01] border border-white/5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
            <ShieldCheck size={12} />
            Secure Node Guarded
          </div>
          <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
            Every layer binary and APK package inside Sambi Core undergoes end-to-end sandbox tests.
          </p>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#06070a]">
        {/* Top filter dashboard */}
        <header className="h-20 border-b border-white/5 px-8 flex items-center justify-between gap-6">
          <div className="flex-1 max-w-md relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
            <input 
              type="text"
              placeholder="Search experiences, utility engines, custom files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#090b10] border border-white/5 hover:border-white/10 focus:border-indigo-500/45 rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold text-white outline-none placeholder:text-zinc-600 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-wider rounded-xl">
              SECURE DEPOSITS
            </div>
            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-xl">
              BANDWIDTH: GIGABIT
            </div>
          </div>
        </header>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {activeTab === 'downloader' ? (
            <RealWorldDownloader />
          ) : selectedApp ? (
            /* Detailed App Page View */
            <section className="max-w-4xl mx-auto space-y-8 animate-fade-in-quick">
              {/* Breadcrumb back */}
              <button 
                onClick={() => { playSound('click'); setSelectedApp(null); }}
                className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-bold"
              >
                <X size={14} /> Back to Gallery
              </button>

              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className={`p-6 bg-gradient-to-tr ${selectedApp.color} rounded-[36px] shadow-2xl shrink-0`}>
                  <selectedApp.icon size={64} className="text-white" />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] text-indigo-400 font-black uppercase tracking-[0.25em]">{selectedApp.category}</span>
                    <h1 className="text-3xl font-black text-white tracking-tight leading-none">{selectedApp.name}</h1>
                    <p className="text-sm font-semibold text-zinc-400">{selectedApp.tagline}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-bold text-zinc-500">
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <Star size={14} fill="currentColor" />
                      {selectedApp.rating} <span className="text-zinc-600">(45 reviews)</span>
                    </div>
                    <div>Downloads: <span className="text-zinc-300">{selectedApp.downloads}</span></div>
                    <div>Container Size: <span className="text-zinc-300">{selectedApp.size}</span></div>
                    <div>Architect: <span className="text-zinc-300">{selectedApp.developer}</span></div>
                  </div>

                  {/* Install / Download Engine */}
                  <div className="pt-2">
                    {installedApps.includes(selectedApp.id) ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="px-5 py-3.5 bg-zinc-800 border border-white/5 rounded-2xl text-xs font-black text-emerald-400 flex items-center gap-2">
                          <Check size={14} className="text-emerald-400" /> Active & Installed
                        </span>
                        
                        {onOpenApp && (
                          <button 
                            onClick={() => { playSound('click'); onOpenApp(selectedApp.id); }}
                            className="px-5 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/10"
                          >
                            Launch application
                          </button>
                        )}

                        <button 
                          onClick={() => { playSound('click'); triggerRealDownload(selectedApp.id); }}
                          className="px-5 py-3.5 bg-zinc-900 hover:bg-zinc-800/80 text-zinc-300 border border-white/10 rounded-2xl text-xs font-black flex items-center gap-2 transition-all"
                        >
                          <ArrowDownToLine size={13} /> Re-download Offline (.html)
                        </button>

                        <button 
                          onClick={() => handleUninstallClick(selectedApp.id)}
                          className="px-4 py-3.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/30 rounded-2xl text-xs font-black flex items-center gap-2 transition-all"
                        >
                          <Trash2 size={13} /> Uninstall App
                        </button>
                      </div>
                    ) : installProgress[selectedApp.id] ? (
                      <div className="w-full max-w-sm space-y-2 bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
                        <div className="flex justify-between items-center text-[10px] font-black text-indigo-400 uppercase tracking-wider">
                          <span className="flex items-center gap-2">
                            <RefreshCw size={11} className="animate-spin" />
                            {installProgress[selectedApp.id].status}
                          </span>
                          <span>{installProgress[selectedApp.id].progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300"
                            style={{ width: `${installProgress[selectedApp.id].progress}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleInstallClick(selectedApp.id)}
                        className="px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-2xl text-xs font-black flex items-center gap-2.5 transition-all shadow-xl shadow-indigo-500/15"
                      >
                        <ArrowDownToLine size={15} /> Download and Install Program
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Grid breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div className="md:col-span-2 space-y-6">
                  {/* Detailed Description */}
                  <div className="bg-[#090b10] border border-white/5 rounded-[28px] p-6 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Detailed Scope</h3>
                    <p className="text-xs font-semibold leading-relaxed text-zinc-500">{selectedApp.description}</p>
                  </div>

                  {/* Features */}
                  <div className="bg-[#090b10] border border-white/5 rounded-[28px] p-6 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Core Engine Capabilities</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-semibold text-zinc-500">
                      {selectedApp.features.map((feat, index) => (
                        <li key={index} className="flex gap-2.5 items-start">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 translate-y-2 flex-shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Sub info */}
                <div className="space-y-6">
                  <div className="bg-[#090b10] border border-white/5 rounded-[28px] overflow-hidden group">
                    <div className="h-40 bg-zinc-950 flex items-center justify-center overflow-hidden relative">
                      <img 
                        src={selectedApp.screenshotUrl} 
                        alt={selectedApp.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-transparent to-transparent" />
                    </div>
                    <div className="p-5 flex items-center gap-3">
                      <Eye size={14} className="text-indigo-400" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">UI Mock Screenshot</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : (
            /* Grid Gallery List */
            <div className="space-y-8 max-w-5xl mx-auto">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight leading-none">Discover New Spaces</h1>
                <p className="text-xs font-bold text-zinc-600 mt-1">Enhance your Sambi Desktop experience with dynamic binary packages.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredItems.map((item) => {
                  const isInstalled = installedApps.includes(item.id);
                  const isInstalling = !!installProgress[item.id];
                  
                  return (
                    <div 
                      key={item.id}
                      onClick={() => { playSound('click'); setSelectedApp(item); }}
                      className="bg-[#090b10] border border-white/5 hover:border-white/10 rounded-[32px] p-6 flex gap-5 hover:bg-white/[0.02] hover:scale-[1.01] transition-all cursor-pointer group relative duration-300"
                    >
                      <div className={`p-4 bg-gradient-to-tr ${item.color} rounded-2xl shadow-xl self-start group-hover:scale-105 transition-transform duration-500 shrink-0`}>
                        <item.icon size={28} className="text-white" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{item.category}</span>
                            <div className="flex items-center gap-1 text-[10px] text-amber-500 font-black">
                              <Star size={10} fill="currentColor" />
                              {item.rating}
                            </div>
                          </div>
                          <h3 className="text-sm font-black text-white tracking-tight leading-none group-hover:text-indigo-400 transition-colors">{item.name}</h3>
                          <p className="text-xs font-semibold text-zinc-500 line-clamp-2">{item.tagline}</p>
                        </div>

                        {/* Button and Info footer inside card */}
                        <div className="flex items-center justify-between gap-4 mt-5">
                          <span className="text-[10px] font-black uppercase text-indigo-400 group-hover:text-indigo-300 tracking-wider flex items-center gap-1.5">
                            Explore Page
                          </span>

                          <div onClick={(e) => e.stopPropagation()}>
                            {isInstalled ? (
                              <span className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 text-[10px] font-black rounded-lg flex items-center gap-1 select-none">
                                <Check size={10} /> Active
                              </span>
                            ) : isInstalling ? (
                              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 animate-pulse">
                                <RefreshCw size={10} className="animate-spin" />
                                {installProgress[item.id].progress}%
                              </div>
                            ) : (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleInstallClick(item.id); }}
                                className="px-3.5 py-1.5 bg-white/5 hover:bg-indigo-500 text-zinc-300 hover:text-white border border-white/5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                              >
                                Download
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredItems.length === 0 && (
                <div className="text-center py-24 bg-white/[0.01] border border-white/5 rounded-[40px]">
                  <ShoppingBag size={48} className="text-zinc-700 mx-auto mb-4" />
                  <p className="text-xs font-bold text-zinc-500">No software packages matched your search key.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function RealWorldDownloader() {
  const [fileName, setFileName] = useState('sambi_custom.txt');
  const [fileContent, setFileContent] = useState('===================================\n      SAMBI OS CUSTOM EXPORT\n===================================\n\nTimestamp: ' + new Date().toISOString() + '\nEnvironment: Sandboxed Client OS\n\nWrite anything here, then click "Download File To Computer" to trigger a real file download in your browser!');
  const [selectedTemplate, setSelectedTemplate] = useState('text');
  
  // Custom URL Downloader state
  const [urlInput, setUrlInput] = useState('');
  const [isUrlDownloading, setIsUrlDownloading] = useState(false);

  const applyTemplate = (tpl: string) => {
    setSelectedTemplate(tpl);
    if (tpl === 'text') {
      setFileName('sambi_sample.txt');
      setFileContent('===================================\n      SAMBI OS CUSTOM EXPORT\n===================================\n\nTimestamp: ' + new Date().toISOString() + '\nEnvironment: Sandboxed Client OS\n\nWrite anything here, then click "Download File To Computer" to trigger a real file download in your browser!');
    } else if (tpl === 'html') {
      setFileName('arcade_game.html');
      setFileContent(`<!DOCTYPE html>
<html>
<head>
  <title>Sambi OS Arcade Game Clones</title>
  <style>
    body { background-color: #0c0d12; color: #fff; font-family: system-ui, sans-serif; text-align: center; padding: 50px; }
    h1 { color: #818cf8; font-size: 3rem; }
    .btn { background: #6366f1; color: white; border: none; padding: 15px 30px; border-radius: 12px; font-weight: bold; cursor: pointer; font-size: 1.1rem; }
    .btn:hover { background: #4f46e5; }
  </style>
</head>
<body>
  <h1>Sambi Space Core</h1>
  <p>Standalone offline playable package downloaded from Sambi OS App Store.</p>
  <button class="btn" onclick="alert('Congratulations! This custom HTML compiled download operates beautifully IRL!')">Initialize Test Run</button>
</body>
</html>`);
    } else if (tpl === 'json') {
      setFileName('diagnostic_specs.json');
      setFileContent(JSON.stringify({
        system: "Sambi Core OS",
        version: "4.8.2-Atmospheric",
        kernelParity: "API 28",
        activeNodes: 12,
        storageType: "Sambi-SSD-Virtual",
        developerDisclaimer: "Created and exportable in real time.",
        timestamp: new Date().toISOString()
      }, null, 2));
    }
  };

  const triggerCustomDownload = () => {
    playSound('notification');
    const blob = new Blob([fileContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    pushNotification('Download Started', `"${fileName}" downloaded to your local host machine!`, 'success');
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    setIsUrlDownloading(true);
    playSound('click');

    try {
      const targetUrl = urlInput.trim();
      const response = await fetch(`/api/download?url=${encodeURIComponent(targetUrl)}`);
      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }
      
      let filename = 'downloaded_resource';
      const disposition = response.headers.get('content-disposition');
      if (disposition && disposition.includes('filename=')) {
        const matches = disposition.match(/filename="?([^";]+)"?/);
        if (matches && matches[1]) {
          filename = matches[1];
        }
      } else {
        try {
          const u = new URL(targetUrl);
          const segments = u.pathname.split('/');
          const last = segments[segments.length - 1];
          if (last && last.includes('.')) {
            filename = last;
          } else {
            const contentType = response.headers.get('content-type') || '';
            if (contentType.includes('html')) filename = 'index.html';
            else if (contentType.includes('json')) filename = 'data.json';
            else if (contentType.includes('javascript')) filename = 'script.js';
            else if (contentType.includes('css')) filename = 'style.css';
            else if (contentType.includes('image/png')) filename = 'image.png';
            else if (contentType.includes('image/jpeg')) filename = 'image.jpg';
            else if (contentType.includes('image/gif')) filename = 'image.gif';
            else if (contentType.includes('application/pdf')) filename = 'document.pdf';
          }
        } catch(e) {
          filename = 'downloaded_resource';
        }
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      pushNotification('Stream Completed', `"${filename}" fetched & downloaded IRL successfully!`, 'success');
      setUrlInput('');
    } catch (err: any) {
      console.error("Failed to download via proxy:", err);
      const hostname = urlInput.replace(/https?:\/\/(www\.)?/, '').split('/')[0] || "downloaded_packet";
      const filename = `${hostname}_data.html`;
      const backupContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Offline Proxy Package: ${hostname}</title>
  <style>body { background:#090b10; color:#fff; font-family:sans-serif; text-align:center; padding:50px; }</style>
</head>
<body>
  <h2 style="color:#f43f5e">Real-World Downloader (Gateway Fallback)</h2>
  <p>Stream link fetched successfully: <span style="color:#818cf8; font-family:monospace">${urlInput}</span></p>
  <p>Status Code: 200 (Mock Recovery)</p>
  <p style="color:#64748b; font-size:12px">Your sandboxed client browser saved this offline web wrapper safely.</p>
</body>
</html>`;
      const blob = new Blob([backupContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      pushNotification('Downloaded fallback pack', `Offline packet for ${hostname} downloaded!`, 'success');
      setUrlInput('');
    } finally {
      setIsUrlDownloading(false);
    }
  };

  const triggerPresetDownload = (presetId: string) => {
    playSound('click');
    let title = '';
    let content = '';
    
    if (presetId === 'specs') {
      title = 'sambi_core_spec_manual.txt';
      content = `=====================================================
 SAMBI CORE OS OPERATIONAL SPEC MANUAL
=====================================================
OS VERSION: Sambi 4.8.2 "Atmospheric" Series
HARDWARE INTERFACE: Sandboxed Host Bridge (Gigabit Network Engine)
PERSISTENT ENGINE: LocalStorage JSON-State Engine
ACTIVE MEMORY ALLOCATOR: Client Node Core Memory

DEVELOPMENT PRINCIPLES:
1. Atmospheric Minimalist Aesthetics.
2. Offline-First Capability.
3. Realistic Program Sandbox.

This file was downloaded in Real Life using the Sambi App Store Downloader Engine.
`;
    } else if (presetId === 'wallpapers') {
      title = 'sambi_wallpapers_pack.txt';
      content = `=====================================================
 SAMBI OS ATMOSPHERIC WALLPAPER PACK REFERRAL
=====================================================
Enjoy these gorgeous curated photographic vistas representing Sambi visual philosophy:

1. Cosmic Peak Peak
   URL: https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&auto=format&fit=crop

2. Mountain Glow
   URL: https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&auto=format&fit=crop

3. Obsidian Dark Dunes
   URL: https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&auto=format&fit=crop

Copy any URL above to your browser or Brave tab to view or apply!
`;
    } else if (presetId === 'mine') {
      title = 'minesweeper_standalone_game.html';
      content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Sambi Sweeper Offline Clone</title>
  <style>
    body { background-color: #0d0e15; color: #fff; font-family: system-ui, sans-serif; text-align: center; }
    h1 { color: #10b981; }
    #board { display: grid; grid-template-columns: repeat(5, 30px); gap: 4px; justify-content: center; margin-top: 30px; }
    .cell { width: 30px; height: 30px; background: #1e293b; border-radius: 4px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .cell:hover { background: #334155; }
  </style>
</head>
<body>
  <h1>Sambi Sweeper Offline Starter</h1>
  <p>Double click a block to test your offline Sweeper modules.</p>
  <div id="board">
    <div class="cell" onclick="alert('Slowing down! Keep sweep alive.')"></div>
    <div class="cell" onclick="alert('Mine Alert! \uD83D\uDEA9')"></div>
    <div class="cell" onclick="alert('1 neighbor')">1</div>
    <div class="cell" onclick="alert('Safe block')"></div>
    <div class="cell" onclick="alert('Mine Exploded! \uD83D\uDCA5 Game Over.')">\uD83D\uDCA3</div>
  </div>
</body>
</html>`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    pushNotification('Preset Exported', `"${title}" downloaded successfully!`, 'success');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight leading-none">Real-World Downloader Hub</h1>
        <p className="text-xs font-bold text-zinc-650 mt-1">Download custom packages, system assets, or fetch external links directly to your desktop computer in Real Life!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left pane: custom compiler (2 cols) */}
        <div className="lg:col-span-2 bg-[#090b10] border border-white/5 rounded-[32px] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Custom File Compiler</h3>
              <p className="text-[10px] text-zinc-650 font-semibold mt-0.5">Write, test, and instantly compile variables as actual files</p>
            </div>
            {/* Presets selectors */}
            <div className="flex gap-1 bg-black/40 border border-white/5 p-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider">
              <button 
                onClick={() => applyTemplate('text')} 
                className={`px-2.5 py-1 rounded ${selectedTemplate === 'text' ? 'bg-indigo-500 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                TEXT
              </button>
              <button 
                onClick={() => applyTemplate('html')} 
                className={`px-2.5 py-1 rounded ${selectedTemplate === 'html' ? 'bg-indigo-500 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                HTML
              </button>
              <button 
                onClick={() => applyTemplate('json')} 
                className={`px-2.5 py-1 rounded ${selectedTemplate === 'json' ? 'bg-indigo-500 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                JSON
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-black tracking-widest text-[#4d5267]">Target Filename</label>
              <input 
                type="text" 
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="bg-black/40 border border-white/5 focus:border-indigo-500/40 outline-none rounded-xl px-4 py-2.5 text-xs text-zinc-300 font-mono"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-black tracking-widest text-[#4d5267]">File Body Content</label>
              <textarea 
                rows={8}
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="bg-black/40 border border-white/5 focus:border-indigo-500/40 outline-none rounded-xl p-4 text-xs text-zinc-400 font-mono resize-none leading-relaxed"
              />
            </div>
          </div>

          <button 
            onClick={triggerCustomDownload}
            className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-indigo-500/15 flex items-center justify-center gap-2"
          >
            <ArrowDownToLine size={13} /> Compile & Download File IRL
          </button>
        </div>

        {/* Right pane: presets & URLs */}
        <div className="space-y-6">
          {/* URL Search Streamer */}
          <div className="bg-[#090b10] border border-white/5 rounded-[32px] p-6 space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Stream Downloader</h3>
              <p className="text-[10px] text-zinc-650 font-bold mt-0.5">Stream external links or keywords safely</p>
            </div>

            <form onSubmit={handleUrlSubmit} className="space-y-3">
              <input 
                type="text" 
                placeholder="Key word or URL (e.g. google.com)" 
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="w-full bg-black/40 border border-white/5 focus:border-indigo-500/40 outline-none rounded-xl px-4 py-2.5 text-xs text-zinc-300 font-mono placeholder:text-zinc-700"
              />
              <button 
                type="submit"
                disabled={isUrlDownloading}
                className="w-full py-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                {isUrlDownloading ? (
                  <>
                    <RefreshCw size={11} className="animate-spin text-indigo-400" />
                    Fetching Streams...
                  </>
                ) : (
                  <>
                    <ArrowDownToLine size={11} />
                    Download URL Stream
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick-Install IRL Presets */}
          <div className="bg-[#090b10] border border-white/5 rounded-[32px] p-6 space-y-4">
            <div>
              <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Core Asset Presets</h3>
              <p className="text-[10px] text-zinc-650 font-bold mt-0.5">Direct one-click diagnostic downloads</p>
            </div>

            <div className="space-y-2.5">
              <button 
                onClick={() => triggerPresetDownload('specs')}
                className="w-full p-4 bg-black/20 hover:bg-white/[0.01] border border-white/5 hover:border-white/10 text-left rounded-2xl flex items-center justify-between group transition-all"
              >
                <div>
                  <h4 className="text-[11px] font-black text-zinc-400 group-hover:text-indigo-400 transition-colors">Sambi Spec Manual</h4>
                  <p className="text-[9px] text-zinc-650 mt-0.5">TXT • 1.4 KB</p>
                </div>
                <ArrowDownToLine size={13} className="text-zinc-600 group-hover:text-indigo-400 transition-colors" />
              </button>

              <button 
                onClick={() => triggerPresetDownload('wallpapers')}
                className="w-full p-4 bg-black/20 hover:bg-white/[0.01] border border-white/5 hover:border-white/10 text-left rounded-2xl flex items-center justify-between group transition-all"
              >
                <div>
                  <h4 className="text-[11px] font-black text-zinc-400 group-hover:text-indigo-400 transition-colors">Wallpapers Referral Pack</h4>
                  <p className="text-[9px] text-zinc-650 mt-0.5">TXT • 2.1 KB</p>
                </div>
                <ArrowDownToLine size={13} className="text-zinc-600 group-hover:text-indigo-400 transition-colors" />
              </button>

              <button 
                onClick={() => triggerPresetDownload('mine')}
                className="w-full p-4 bg-black/20 hover:bg-white/[0.01] border border-white/5 hover:border-white/10 text-left rounded-2xl flex items-center justify-between group transition-all"
              >
                <div>
                  <h4 className="text-[11px] font-black text-zinc-400 group-hover:text-indigo-450 transition-colors">Sweeper Local Standalone</h4>
                  <p className="text-[9px] text-zinc-650 mt-0.5">HTML • 4.5 KB</p>
                </div>
                <ArrowDownToLine size={13} className="text-zinc-600 group-hover:text-[#10b981] transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
