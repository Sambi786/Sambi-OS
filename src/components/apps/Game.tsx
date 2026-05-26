import { useState, useEffect, useRef } from 'react';
import { Gamepad2, Play, RotateCcw, ShieldAlert, Award, ArrowLeft, Heart, Grid, Flag } from 'lucide-react';
import { playSound } from '../../lib/audio';

export default function GameApp() {
  const [activeGame, setActiveGame] = useState<'menu' | 'bird' | 'sweeper' | 'tetris'>('menu');

  return (
    <div className="h-full w-full bg-[#050608] text-white flex flex-col font-sans overflow-hidden">
      {/* Top Banner */}
      <header className="h-16 px-6 border-b border-white/5 bg-[#090b10] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gamepad2 className="text-emerald-500 animate-pulse" size={20} />
          <div>
            <h1 className="text-xs font-black uppercase tracking-[0.2em]">Sambi Retro Arcade</h1>
            <p className="text-[9px] text-[#4d5267] font-bold uppercase tracking-widest">Local High Performance System</p>
          </div>
        </div>
        {activeGame !== 'menu' && (
          <button 
            onClick={() => { playSound('click'); setActiveGame('menu'); }}
            className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <ArrowLeft size={12} /> Exit Game
          </button>
        )}
      </header>

      {/* Main active zone */}
      <div className="flex-1 overflow-hidden relative">
        {activeGame === 'menu' && (
          <div className="h-full w-full overflow-y-auto p-8 flex items-center justify-center no-scrollbar">
            <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sambi Bird Card */}
              <div className="bg-[#090b10] border border-white/5 hover:border-emerald-500/20 hover:scale-102 rounded-[32px] p-6 flex flex-col justify-between group transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <Heart size={22} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight mb-1">Sambi Bird</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">Navigate the skies! Jump between dynamic, physics-based obstacle nodes. Infinite side-scrolling high scores.</p>
                  </div>
                </div>
                <button 
                  onClick={() => { playSound('click'); setActiveGame('bird'); }}
                  className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Play size={12} fill="currentColor" /> Boot Game
                </button>
              </div>

              {/* Sambi Sweeper Card */}
              <div className="bg-[#090b10] border border-white/5 hover:border-emerald-500/20 hover:scale-102 rounded-[32px] p-6 flex flex-col justify-between group transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <Grid size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight mb-1">Sambi Sweeper</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">Classic minefield clearance. Toggle flags, count nearby nodes, select grid modes, avoid critical core breaches.</p>
                  </div>
                </div>
                <button 
                  onClick={() => { playSound('click'); setActiveGame('sweeper'); }}
                  className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Play size={12} fill="currentColor" /> Boot Game
                </button>
              </div>

              {/* Retro Brick (Tetris) */}
              <div className="bg-[#090b10] border border-white/5 hover:border-emerald-500/20 hover:scale-102 rounded-[32px] p-6 flex flex-col justify-between group transition-all duration-300">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#00f2fe]/10 flex items-center justify-center text-[#00f2fe] group-hover:scale-110 transition-transform">
                    <Gamepad2 size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black tracking-tight mb-1">Retro Brick</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">Interactive retro block architecture. Rotate layouts, sweep lines, trigger multipliers, speedup systems.</p>
                  </div>
                </div>
                <button 
                  onClick={() => { playSound('click'); setActiveGame('tetris'); }}
                  className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Play size={12} fill="currentColor" /> Boot Game
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Game 1: Sambi Bird */}
        {activeGame === 'bird' && <SambiBird />}

        {/* Game 2: Sambi Sweeper */}
        {activeGame === 'sweeper' && <SambiSweeper />}

        {/* Game 3: Retro Brick */}
        {activeGame === 'tetris' && <RetroBrick />}
      </div>
    </div>
  );
}

/* ================== GAME 1: SAMBI BIRD ================== */
function SambiBird() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('sambi_bird_hs') || '0', 10));
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [birdY, setBirdY] = useState(200);
  const birdVelocity = useRef(0);
  const pipes = useRef<{ x: number; topHeight: number; bottomHeight: number; passed: boolean }[]>([]);
  const requestRef = useRef<number | null>(null);
  
  const GRAVITY = 0.4;
  const JUMP_FORCE = -7.5;
  const PIPE_SPEED = 3.5;
  const PIPE_SPAWN_RATE = 100; // frames
  const PIPE_GAP = 130;
  
  const startGame = () => {
    playSound('click');
    setScore(0);
    setBirdY(200);
    birdVelocity.current = 0;
    pipes.current = [];
    setGameOver(false);
    setIsPlaying(true);
  };

  const jump = () => {
    if (!isPlaying) {
      if (!gameOver) startGame();
      return;
    }
    playSound('click');
    birdVelocity.current = JUMP_FORCE;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver]);

  // Main game loop
  useEffect(() => {
    if (!isPlaying) return;
    let frameCount = 0;

    const loop = () => {
      frameCount++;
      
      // Update bird position
      birdVelocity.current += GRAVITY;
      setBirdY(prev => {
        const next = prev + birdVelocity.current;
        // Boundaries
        if (next < 0) return 0;
        if (next > 450) {
          // Bottom collision
          triggerGameOver();
          return 450;
        }
        return next;
      });

      // Spawn pipes
      if (frameCount % PIPE_SPAWN_RATE === 0) {
        const maxLimit = 220;
        const minLimit = 50;
        const topHeight = Math.floor(Math.random() * (maxLimit - minLimit)) + minLimit;
        const bottomHeight = 450 - topHeight - PIPE_GAP;

        pipes.current.push({
          x: 600,
          topHeight,
          bottomHeight,
          passed: false
        });
      }

      // Update pipes
      pipes.current = pipes.current.map(p => ({
        ...p,
        x: p.x - PIPE_SPEED
      })).filter(p => p.x > -80); // clear off-screen

      // Check collisions & scoring
      const birdBox = { x: 100, y: birdY, size: 28 };
      pipes.current.forEach(p => {
        // Score point if passed
        if (p.x < 100 && !p.passed) {
          p.passed = true;
          setScore(s => {
            const next = s + 1;
            if (next > highScore) {
              setHighScore(next);
              localStorage.setItem('sambi_bird_hs', next.toString());
            }
            return next;
          });
          // Dispatch a vibration event
          window.dispatchEvent(new CustomEvent('sambi_vibrate'));
        }

        // Collision check
        if (p.x < (birdBox.x + birdBox.size) && (p.x + 60) > birdBox.x) {
          if (birdBox.y < p.topHeight || (birdBox.y + birdBox.size) > (450 - p.bottomHeight)) {
            triggerGameOver();
          }
        }
      });

      requestRef.current = requestAnimationFrame(loop);
    };

    const triggerGameOver = () => {
      playSound('notification');
      setIsPlaying(false);
      setGameOver(true);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, birdY, highScore]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-4 bg-[#08090d]">
      <div className="w-full max-w-xl bg-[#090b10] border border-white/5 rounded-[36px] overflow-hidden p-6 flex flex-col items-center gap-4">
        <div className="w-full flex justify-between items-center text-xs font-black uppercase tracking-widest text-[#4d5267]">
          <span className="flex items-center gap-2">🏆 Highscore: <span className="text-amber-400">{highScore}</span></span>
          <span className="text-xl font-bold text-white">Score: <span className="text-indigo-400">{score}</span></span>
        </div>

        {/* Live Container Screen */}
        <div 
          ref={containerRef}
          onClick={jump}
          className="relative h-[450px] w-full bg-[#050508] border border-white/5 rounded-2xl overflow-hidden cursor-pointer"
        >
          {/* Bird */}
          <div 
            className="absolute left-[100px] w-7 h-7 bg-amber-400 border border-amber-600 rounded-full flex items-center justify-center shadow-lg pointer-events-none transition-all duration-75"
            style={{ top: `${birdY}px` }}
          >
            <span className="text-[10px] font-black select-none text-black">🐦</span>
          </div>

          {/* Pipes */}
          {pipes.current.map((pipe, index) => (
            <div key={index} className="absolute inset-y-0 pointer-events-none" style={{ left: `${pipe.x}px`, width: '60px' }}>
              {/* Top pipe */}
              <div 
                className="absolute top-0 w-full bg-gradient-to-b from-emerald-500 to-emerald-700 border-2 border-emerald-900 rounded-b-xl shadow-lg"
                style={{ height: `${pipe.topHeight}px` }}
              />
              {/* Bottom pipe */}
              <div 
                className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-500 to-emerald-700 border-2 border-emerald-900 rounded-t-xl shadow-lg"
                style={{ height: `${pipe.bottomHeight}px` }}
              />
            </div>
          ))}

          {/* Grid background visual */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

          {/* Overlay state templates */}
          {!isPlaying && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-6">
              {gameOver ? (
                <div className="space-y-4 animate-scale-up">
                  <div className="w-12 h-12 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-rose-500 uppercase tracking-wider">Node Collision</h4>
                    <p className="text-xs text-zinc-500 mt-1">Sambi Flight was terminated. Final score: {score}</p>
                  </div>
                  <button 
                    onClick={startGame}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                  >
                    Reboot Flight
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center justify-center mx-auto animate-bounce">
                    <Award size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white uppercase tracking-wider">Let's Flap!</h4>
                    <p className="text-xs text-zinc-500 mt-1">Tap SPACE or click the screen to flap wings and bypass critical structures.</p>
                  </div>
                  <button 
                    onClick={startGame}
                    className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                  >
                    Initiate Flight
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================== GAME 2: SAMBI SWEEPER ================== */
interface Cell {
  x: number;
  y: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

function SambiSweeper() {
  const [boardSize, setBoardSize] = useState<{ r: number, c: number, m: number }>({ r: 9, c: 9, m: 10 });
  const [board, setBoard] = useState<Cell[][]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [flagMode, setFlagMode] = useState(false);
  const [minesRemaining, setMinesRemaining] = useState(10);
  
  const generateBoard = (rows: number, cols: number, mines: number) => {
    // Empty cell creation
    let grid: Cell[][] = [];
    for (let r = 0; r < rows; r++) {
      let row: Cell[] = [];
      for (let c = 0; c < cols; c++) {
        row.push({
          x: r,
          y: c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0
        });
      }
      grid.push(row);
    }

    // Spawn mines
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);
      if (!grid[r][c].isMine) {
        grid[r][c].isMine = true;
        minesPlaced++;
      }
    }

    // Neighbors calculation
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!grid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (r + dr >= 0 && r + dr < rows && c + dc >= 0 && c + dc < cols) {
                if (grid[r + dr][c + dc].isMine) count++;
              }
            }
          }
          grid[r][c].neighborMines = count;
        }
      }
    }

    setBoard(grid);
    setMinesRemaining(mines);
    setGameOver(false);
    setGameWon(false);
    setGameStarted(true);
  };

  useEffect(() => {
    generateBoard(boardSize.r, boardSize.c, boardSize.m);
  }, [boardSize]);

  const handleCellClick = (r: number, c: number) => {
    if (gameOver || gameWon) return;
    playSound('click');

    const cell = board[r][c];
    if (cell.isRevealed) return;

    if (flagMode) {
      handleCellRightClick(r, c);
      return;
    }

    if (cell.isFlagged) return;

    if (cell.isMine) {
      // Reveal all mines and gameOver
      playSound('notification');
      setGameOver(true);
      const nextBoard = board.map(row => row.map(cell => cell.isMine ? { ...cell, isRevealed: true } : cell));
      setBoard(nextBoard);
      window.dispatchEvent(new CustomEvent('sambi_vibrate'));
      return;
    }

    let nextBoard = [...board.map(row => [...row])];
    revealCell(nextBoard, r, c);
    setBoard(nextBoard);
    checkWinCondition(nextBoard);
  };

  const handleCellRightClick = (r: number, c: number) => {
    if (gameOver || gameWon) return;
    playSound('click');

    const cell = board[r][c];
    if (cell.isRevealed) return;

    const nextBoard = board.map(row => row.map(cl => {
      if (cl.x === r && cl.y === c) {
        const nextFlag = !cl.isFlagged;
        setMinesRemaining(m => m + (nextFlag ? -1 : 1));
        return { ...cl, isFlagged: nextFlag };
      }
      return cl;
    }));

    setBoard(nextBoard);
    checkWinCondition(nextBoard);
  };

  const revealCell = (grid: Cell[][], r: number, c: number) => {
    if (r < 0 || r >= boardSize.r || c < 0 || c >= boardSize.c) return;
    const cell = grid[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    grid[r][c].isRevealed = true;

    // Cascade zero cells
    if (cell.neighborMines === 0 && !cell.isMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          revealCell(grid, r + dr, c + dc);
        }
      }
    }
  };

  const checkWinCondition = (grid: Cell[][]) => {
    let unrevealedSafeCells = 0;
    grid.forEach(row => row.forEach(cell => {
      if (!cell.isMine && !cell.isRevealed) unrevealedSafeCells++;
    }));

    if (unrevealedSafeCells === 0) {
      playSound('notification');
      setGameWon(true);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-4 bg-[#08090d]">
      <div className="w-full max-w-sm bg-[#090b10] border border-white/5 rounded-[36px] overflow-hidden p-6 flex flex-col items-center gap-4">
        {/* Controls */}
        <div className="w-full flex justify-between items-center text-xs font-black uppercase tracking-widest text-[#4d5267]">
          <span>Mines: <span className="text-white">{minesRemaining}</span></span>
          <div className="flex bg-[#050508] border border-white/5 rounded-xl p-0.5">
            <button 
              onClick={() => { playSound('click'); setBoardSize({ r: 9, c: 9, m: 10 }); }}
              className={`px-3 py-1.5 rounded-lg transition-all ${boardSize.r === 9 ? 'bg-indigo-500 text-white' : 'hover:bg-white/5'}`}
            >
              Easy
            </button>
            <button 
              onClick={() => { playSound('click'); setBoardSize({ r: 14, c: 14, m: 30 }); }}
              className={`px-3 py-1.5 rounded-lg transition-all ${boardSize.r === 14 ? 'bg-indigo-500 text-white' : 'hover:bg-white/5'}`}
            >
              Hard
            </button>
          </div>
        </div>

        {/* Board */}
        <div className="bg-[#050510] border border-white/5 p-4 rounded-xl shadow-inner select-none flex justify-center items-center overflow-auto w-full">
          <div 
            className="grid gap-1.5 mx-auto"
            style={{ gridTemplateColumns: `repeat(${boardSize.c}, minmax(0, 1fr))` }}
          >
            {board.map((row, rIdx) => 
              row.map((cell, cIdx) => (
                <button
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => handleCellClick(rIdx, cIdx)}
                  onContextMenu={(e) => { e.preventDefault(); handleCellRightClick(rIdx, cIdx); }}
                  className={`w-7 h-7 rounded-sm flex items-center justify-center font-black text-xs transition-all border
                    ${cell.isRevealed 
                      ? cell.isMine 
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400' 
                        : 'bg-white/5 border-white/[0.02] text-zinc-300' 
                      : 'bg-zinc-800 border-zinc-700 hover:bg-zinc-700 active:scale-95 text-zinc-500'}`}
                >
                  {cell.isRevealed ? (
                    cell.isMine ? '💣' : cell.neighborMines > 0 ? cell.neighborMines : ''
                  ) : cell.isFlagged ? (
                    '🚩'
                  ) : ''}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="w-full flex justify-between gap-3">
          <button
            onClick={() => { playSound('click'); setFlagMode(!flagMode); }}
            className={`flex-1 py-3 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2
              ${flagMode 
                ? 'bg-indigo-500 border-indigo-500 text-white' 
                : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'}`}
          >
            <Flag size={14} className={flagMode ? 'text-white' : 'text-zinc-500'} />
            {flagMode ? 'Flag Mode: ON' : 'Flag Mode: OFF'}
          </button>
          
          <button
            onClick={() => { playSound('click'); generateBoard(boardSize.r, boardSize.c, boardSize.m); }}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all text-zinc-400 hover:text-white"
          >
            <RotateCcw size={14} />
          </button>
        </div>

        {/* Game State Overlay Templates */}
        {(gameOver || gameWon) && (
          <div className="animate-scale-up space-y-2 bg-[#050508] border border-white/5 p-4 rounded-xl w-full text-center">
            {gameOver ? (
              <>
                <div className="text-rose-500 text-sm font-black uppercase tracking-wider">💥 Core BREACHED!</div>
                <div className="text-[11px] text-zinc-400">Triggered raw mine coordinates. Try again.</div>
              </>
            ) : (
              <>
                <div className="text-emerald-400 text-sm font-black uppercase tracking-wider">🏆 Node Secured!</div>
                <div className="text-[11px] text-zinc-400">Successfully flagged and bypassed standard mines.</div>
              </>
            )}
            <button
              onClick={() => { playSound('click'); generateBoard(boardSize.r, boardSize.c, boardSize.m); }}
              className="mt-2 w-full py-2 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-lg text-xs font-bold transition-all text-white"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================== GAME 3: RETRO BRICK (TETRIS) ================== */
const TETROMINOES = {
  I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  O: [[2, 2], [2, 2]],
  T: [[0, 3, 0], [3, 3, 3], [0, 0, 0]],
  S: [[0, 4, 4], [4, 4, 0], [0, 0, 0]],
  Z: [[5, 5, 0], [0, 5, 5], [0, 0, 0]],
  J: [[6, 0, 0], [6, 6, 6], [0, 0, 0]],
  L: [[0, 0, 7], [7, 7, 7], [0, 0, 0]],
};

const SHAPES = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as const;

function RetroBrick() {
  const [grid, setGrid] = useState<number[][]>(() => Array.from({ length: 20 }, () => Array(10).fill(0)));
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  const currentBlock = useRef<number[][]>([[0]]);
  const currentPos = useRef({ x: 0, y: 0 });
  const blockType = useRef<string>('I');
  const timer = useRef<any>(null);

  const spawnBlock = () => {
    const type = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const matrix = TETROMINOES[type];
    blockType.current = type;
    currentBlock.current = matrix;
    currentPos.current = {
      x: Math.floor((10 - matrix[0].length) / 2),
      y: 0
    };

    // Game Over if spawns inside block
    if (checkCollision(matrix, currentPos.current.x, currentPos.current.y)) {
      setGameOver(true);
      setIsPlaying(false);
      playSound('notification');
    }
  };

  const checkCollision = (matrix: number[][], nx: number, ny: number, customGrid = grid) => {
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] !== 0) {
          const gx = nx + c;
          const gy = ny + r;

          if (gx < 0 || gx >= 10 || gy >= 20) return true;
          if (gy >= 0 && customGrid[gy][gx] !== 0) return true;
        }
      }
    }
    return false;
  };

  const drop = () => {
    if (gameOver || !isPlaying) return;

    if (!checkCollision(currentBlock.current, currentPos.current.x, currentPos.current.y + 1)) {
      currentPos.current.y++;
      forceUpdate();
    } else {
      mergeToGrid();
    }
  };

  const mergeToGrid = () => {
    const nextGrid = grid.map(row => [...row]);
    
    for (let r = 0; r < currentBlock.current.length; r++) {
      for (let c = 0; c < currentBlock.current[r].length; c++) {
        if (currentBlock.current[r][c] !== 0) {
          const gy = currentPos.current.y + r;
          const gx = currentPos.current.x + c;
          if (gy >= 0 && gy < 20 && gx >= 0 && gx < 10) {
            nextGrid[gy][gx] = currentBlock.current[r][c];
          }
        }
      }
    }

    // Clear full lines
    let clearedLines = 0;
    const filteredGrid = nextGrid.filter(row => {
      const isFull = row.every(val => val !== 0);
      if (isFull) clearedLines++;
      return !isFull;
    });

    while (filteredGrid.length < 20) {
      filteredGrid.unshift(Array(10).fill(0));
    }

    if (clearedLines > 0) {
      playSound('notification');
      setLines(l => l + clearedLines);
      setScore(s => s + [0, 40, 100, 300, 1200][clearedLines] || 1200);
      window.dispatchEvent(new CustomEvent('sambi_vibrate'));
    }

    setGrid(filteredGrid);
    spawnBlock();
  };

  const moveLeft = () => {
    if (!checkCollision(currentBlock.current, currentPos.current.x - 1, currentPos.current.y)) {
      currentPos.current.x--;
      playSound('click');
      forceUpdate();
    }
  };

  const moveRight = () => {
    if (!checkCollision(currentBlock.current, currentPos.current.x + 1, currentPos.current.y)) {
      currentPos.current.x++;
      playSound('click');
      forceUpdate();
    }
  };

  const rotate = () => {
    playSound('click');
    const matrix = currentBlock.current;
    const size = matrix.length;
    let nextMatrix = Array.from({ length: size }, () => Array(size).fill(0));

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        nextMatrix[c][size - 1 - r] = matrix[r][c];
      }
    }

    if (!checkCollision(nextMatrix, currentPos.current.x, currentPos.current.y)) {
      currentBlock.current = nextMatrix;
      forceUpdate();
    }
  };

  const [_, setDummy] = useState(0);
  const forceUpdate = () => setDummy(d => d + 1);

  const startGame = () => {
    setGrid(Array.from({ length: 20 }, () => Array(10).fill(0)));
    setScore(0);
    setLines(0);
    setGameOver(false);
    setIsPlaying(true);
    playSound('click');
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (!isPlaying) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); moveLeft(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); moveRight(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); rotate(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); drop(); }
    };

    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, [isPlaying, grid]);

  // Handle spawn cycle game speed ticks
  useEffect(() => {
    if (isPlaying) {
      spawnBlock();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying || gameOver) {
      if (timer.current) clearInterval(timer.current);
      return;
    }

    timer.current = setInterval(drop, 800);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [isPlaying, gameOver, grid]);

  // Construct renderable composite grid combining block pos with fixed state
  const renderGrid = grid.map((row, r) => {
    const renderRow = [...row];
    for (let br = 0; br < currentBlock.current.length; br++) {
      for (let bc = 0; bc < currentBlock.current[br].length; bc++) {
        if (currentBlock.current[br][bc] !== 0) {
          const gy = currentPos.current.y + br;
          const gx = currentPos.current.x + bc;
          if (gy === r && gx >= 0 && gx < 10) {
            renderRow[gx] = currentBlock.current[br][bc];
          }
        }
      }
    }
    return renderRow;
  });

  const blockColors = [
    'bg-[#050508]', // empty
    'bg-sky-500 border-sky-400',
    'bg-yellow-500 border-yellow-400',
    'bg-purple-500 border-purple-400',
    'bg-emerald-500 border-emerald-400',
    'bg-rose-500 border-rose-400',
    'bg-blue-500 border-blue-400',
    'bg-orange-500 border-orange-400'
  ];

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-4 bg-[#08090d]">
      <div className="w-full max-w-sm bg-[#090b10] border border-white/5 rounded-[36px] overflow-hidden p-6 flex flex-col items-center gap-4">
        {/* Statistics bar */}
        <div className="w-full flex justify-between items-center text-xs font-black uppercase tracking-widest text-[#4d5267]">
          <span>Lines: <span className="text-indigo-400">{lines}</span></span>
          <span className="text-sm font-bold text-white">Score: <span className="text-[#00f2fe]">{score}</span></span>
        </div>

        {/* Tetris Window Grid */}
        <div className="bg-[#050510] border border-white/5 p-4 rounded-xl shadow-inner select-none flex justify-center items-center w-full">
          <div className="grid grid-cols-10 gap-0.5 border border-white/10 p-1 bg-black/40 rounded-lg">
            {renderGrid.map((row, r) => 
              row.map((cell, c) => (
                <div
                  key={`${r}-${c}`}
                  className={`w-4 h-4 rounded-sm border-[0.5px] border-black/40 ${blockColors[cell]}`}
                />
              ))
            )}
          </div>
        </div>

        {/* Keyboard helpers and actions */}
        <div className="w-full space-y-3">
          <div className="grid grid-cols-4 gap-2">
            <button onClick={moveLeft} className="py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all border border-white/5 flex items-center justify-center">◀ Left</button>
            <button onClick={rotate} className="py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all border border-white/5 flex items-center justify-center">▲ Rotate</button>
            <button onClick={drop} className="py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all border border-white/5 flex items-center justify-center">▼ Soft</button>
            <button onClick={moveRight} className="py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all border border-white/5 flex items-center justify-center">▶ Right</button>
          </div>

          <button
            onClick={startGame}
            className="w-full py-3 bg-[#00f2fe] hover:bg-[#00d7e2] text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {isPlaying ? 'Reboot System Grid' : 'Boot Power Blocks'}
          </button>
        </div>

        {/* GameOver Overlay State */}
        {gameOver && (
          <div className="animate-scale-up space-y-2 bg-[#050508] border border-white/5 p-4 rounded-xl w-full text-center">
            <div className="text-rose-500 text-sm font-black uppercase tracking-wider">💥 Memory Overflow!</div>
            <div className="text-[11px] text-zinc-400 font-bold">Stack height topped out. High scores persisted.</div>
            <button
              onClick={startGame}
              className="mt-2 w-full py-2 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-lg text-xs font-bold transition-all text-white"
            >
              Restart Simulation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
