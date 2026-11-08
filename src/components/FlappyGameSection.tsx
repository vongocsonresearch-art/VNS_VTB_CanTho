import React, { useRef, useEffect, useState, useCallback } from 'react';
import contentData from '../data/contentData.json';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  RotateCcw, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Flame, 
  Home, 
  Play, 
  Info,
  Gift
} from 'lucide-react';

// ==========================================
// CONFIGURATION CONSTANTS (per PDF 6 specs)
// ==========================================
const WIN_SCORE = 20;
const GRAVITY = 0.38;
const JUMP_FORCE = -6.8;
const PIPE_SPEED = 2.4;
const PIPE_GAP = 160; // Generous gap for casual counter players (15-30% win rate target)
const PIPE_WIDTH = 64;
const PIPE_SPAWN_INTERVAL = 110; // frames
const VOUCHER_TEXT = "Voucher 2 lít xăng";
const BRAND_NAME = "VietinBank";
const GAME_TITLE = "Chờ vui – Chơi hay – Nhận quà liền tay";

// Global Window Callback Types
declare global {
  interface Window {
    onFlappyVoucherWin?: (data: {
      score: number;
      voucherCode: string;
      reward: string;
      timestamp: string;
    }) => void;
    onFlappyVoucherLose?: (data: {
      score: number;
      timestamp: string;
    }) => void;
  }
}

interface FlappyGameSectionProps {
  onBackToHome?: () => void;
}

export const FlappyGameSection: React.FC<FlappyGameSectionProps> = ({ onBackToHome }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // React State for UI Overlays
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'win'>('start');
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('vb_flappy_high_score') || '0', 10);
  });
  const [latestVoucher, setLatestVoucher] = useState<string | null>(() => {
    return localStorage.getItem('vb_flappy_latest_voucher') || null;
  });
  const [currentVoucher, setCurrentVoucher] = useState<string>('');
  const [copiedVoucher, setCopiedVoucher] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<boolean>(false);

  // Audio Context synthesizer for pure browser sound without external files
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback((freq: number, type: OscillatorType, duration: number) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio not supported or blocked
    }
  }, [soundEnabled]);

  // Game internal mutable state (for 60fps canvas loop without React re-render lag)
  const engineRef = useRef({
    animationFrameId: 0,
    birdY: 200,
    birdVelocity: 0,
    birdRadius: 18,
    birdRotation: 0,
    pipes: [] as { x: number; topHeight: number; passed: boolean }[],
    frameCount: 0,
    score: 0,
    isWon: false,
    isGameOver: false,
    particles: [] as { x: number; y: number; vx: number; vy: number; color: string; life: number }[]
  });

  // Generate Voucher code: VB-XXXXXX (6 random digits)
  const generateVoucherCode = useCallback((): string => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `VB-${randomDigits}`;
  }, []);

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedVoucher(true);
    setTimeout(() => setCopiedVoucher(false), 2000);
  };

  // Motivational message calculation per PDF 6 specs
  const getMotivationalText = (score: number) => {
    if (score < 5) return "Khởi động nhẹ nhàng!";
    if (score <= 9) return "Tốt lắm, tiếp tục nào!";
    if (score <= 14) return "Một nửa chặng đường rồi!";
    if (score <= 19) return "Sắp nhận quà rồi!";
    return "Xuất sắc!";
  };

  // Jump handler
  const jump = useCallback(() => {
    if (engineRef.current.isGameOver || engineRef.current.isWon) return;
    engineRef.current.birdVelocity = JUMP_FORCE;
    playBeep(480, 'sine', 0.1);
  }, [playBeep]);

  // Trigger win
  const winGame = useCallback(() => {
    engineRef.current.isWon = true;
    const voucher = generateVoucherCode();
    setCurrentVoucher(voucher);
    setGameState('win');

    // Persist to localStorage
    localStorage.setItem('vb_flappy_latest_voucher', voucher);
    setLatestVoucher(voucher);

    // Confetti effect
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    playBeep(659, 'triangle', 0.3);
    setTimeout(() => playBeep(880, 'triangle', 0.4), 150);

    // Call window callback if defined per PDF 6
    if (typeof window.onFlappyVoucherWin === 'function') {
      window.onFlappyVoucherWin({
        score: WIN_SCORE,
        voucherCode: voucher,
        reward: VOUCHER_TEXT,
        timestamp: new Date().toISOString()
      });
    }
  }, [generateVoucherCode, playBeep]);

  // Trigger game over
  const endGame = useCallback((score: number) => {
    engineRef.current.isGameOver = true;
    setGameState('gameover');
    setScreenShake(true);
    setTimeout(() => setScreenShake(false), 300);

    playBeep(180, 'sawtooth', 0.25);

    // Update high score
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('vb_flappy_high_score', score.toString());
    }

    // Call window callback if defined per PDF 6
    if (typeof window.onFlappyVoucherLose === 'function') {
      window.onFlappyVoucherLose({
        score: score,
        timestamp: new Date().toISOString()
      });
    }
  }, [highScore, playBeep]);

  // Reset & Start
  const resetGame = useCallback(() => {
    const canvas = canvasRef.current;
    const initialY = canvas ? canvas.height / 2 : 200;

    engineRef.current = {
      animationFrameId: 0,
      birdY: initialY,
      birdVelocity: 0,
      birdRadius: 18,
      birdRotation: 0,
      pipes: [],
      frameCount: 0,
      score: 0,
      isWon: false,
      isGameOver: false,
      particles: []
    };
    setCurrentScore(0);
    setGameState('playing');
  }, []);

  const startGame = () => {
    resetGame();
  };

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    if (gameState !== 'playing') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const gameLoop = () => {
      if (!isRunning) return;

      const engine = engineRef.current;
      const width = canvas.width;
      const height = canvas.height;

      engine.frameCount++;

      // 1. Update Bird
      engine.birdVelocity += GRAVITY;
      engine.birdY += engine.birdVelocity;
      engine.birdRotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (engine.birdVelocity * 4 * Math.PI) / 180));

      // Floor & Ceiling Collision
      if (engine.birdY + engine.birdRadius >= height - 20) {
        endGame(engine.score);
        return;
      }
      if (engine.birdY - engine.birdRadius <= 0) {
        engine.birdY = engine.birdRadius;
        engine.birdVelocity = 0;
      }

      // 2. Spawn Pipes
      if (engine.frameCount % PIPE_SPAWN_INTERVAL === 0 && !engine.isWon) {
        const minTop = 60;
        const maxTop = height - PIPE_GAP - 80;
        const topHeight = Math.floor(Math.random() * (maxTop - minTop)) + minTop;
        engine.pipes.push({
          x: width + 20,
          topHeight: topHeight,
          passed: false
        });
      }

      // 3. Update Pipes & Check Collision
      const birdX = 90;
      for (let i = engine.pipes.length - 1; i >= 0; i--) {
        const pipe = engine.pipes[i];
        pipe.x -= PIPE_SPEED;

        // Collision Check: Circle vs Box
        const inPipeX = birdX + engine.birdRadius > pipe.x && birdX - engine.birdRadius < pipe.x + PIPE_WIDTH;
        const hitTopPipe = inPipeX && engine.birdY - engine.birdRadius < pipe.topHeight;
        const hitBottomPipe = inPipeX && engine.birdY + engine.birdRadius > pipe.topHeight + PIPE_GAP;

        if (hitTopPipe || hitBottomPipe) {
          endGame(engine.score);
          return;
        }

        // Score Check
        if (!pipe.passed && pipe.x + PIPE_WIDTH < birdX) {
          pipe.passed = true;
          engine.score += 1;
          setCurrentScore(engine.score);
          playBeep(523, 'sine', 0.08);

          // Spawn celebration sparkles at pipe exit
          for (let p = 0; p < 6; p++) {
            engine.particles.push({
              x: birdX,
              y: engine.birdY,
              vx: (Math.random() - 0.5) * 3,
              vy: (Math.random() - 0.5) * 3,
              color: '#00A3E0',
              life: 20
            });
          }

          // Check Win Condition (WIN_SCORE = 20)
          if (engine.score >= WIN_SCORE) {
            winGame();
            return;
          }
        }

        // Remove off-screen pipes
        if (pipe.x + PIPE_WIDTH < -20) {
          engine.pipes.splice(i, 1);
        }
      }

      // 4. Update Particles
      for (let i = engine.particles.length - 1; i >= 0; i--) {
        const p = engine.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) {
          engine.particles.splice(i, 1);
        }
      }

      // ==========================================
      // DRAWING
      // ==========================================
      ctx.clearRect(0, 0, width, height);

      // Background Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#EBF4FF');
      skyGrad.addColorStop(0.6, '#DBEAFE');
      skyGrad.addColorStop(1, '#BFDBFE');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Gentle cloud layers in background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.arc(80, 70, 35, 0, Math.PI * 2);
      ctx.arc(120, 60, 45, 0, Math.PI * 2);
      ctx.arc(160, 70, 35, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(width - 100, 110, 40, 0, Math.PI * 2);
      ctx.arc(width - 60, 95, 50, 0, Math.PI * 2);
      ctx.fill();

      // Draw Pipes (VietinBank Navy & Cyan Pillars)
      for (const pipe of engine.pipes) {
        // Top Pipe
        const topGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
        topGrad.addColorStop(0, '#002850');
        topGrad.addColorStop(0.4, '#005596');
        topGrad.addColorStop(1, '#001A35');
        ctx.fillStyle = topGrad;
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);

        // Pipe Lip Top
        ctx.fillStyle = '#0072CE';
        ctx.fillRect(pipe.x - 3, pipe.topHeight - 16, PIPE_WIDTH + 6, 16);
        ctx.strokeStyle = '#002850';
        ctx.lineWidth = 2;
        ctx.strokeRect(pipe.x - 3, pipe.topHeight - 16, PIPE_WIDTH + 6, 16);

        // Bottom Pipe
        const botY = pipe.topHeight + PIPE_GAP;
        const botHeight = height - botY;
        ctx.fillStyle = topGrad;
        ctx.fillRect(pipe.x, botY, PIPE_WIDTH, botHeight);

        // Pipe Lip Bottom
        ctx.fillStyle = '#0072CE';
        ctx.fillRect(pipe.x - 3, botY, PIPE_WIDTH + 6, 16);
        ctx.strokeRect(pipe.x - 3, botY, PIPE_WIDTH + 6, 16);
      }

      // Draw Particles
      for (const p of engine.particles) {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Mascot / VietinBank Bird Character
      ctx.save();
      ctx.translate(birdX, engine.birdY);
      ctx.rotate(engine.birdRotation);

      // Bird Body (VietinBank signature styled circular mascot)
      const birdGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, engine.birdRadius);
      birdGrad.addColorStop(0, '#00A3E0');
      birdGrad.addColorStop(0.7, '#005596');
      birdGrad.addColorStop(1, '#003B70');
      ctx.fillStyle = birdGrad;
      ctx.beginPath();
      ctx.arc(0, 0, engine.birdRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Wing
      ctx.fillStyle = '#ED1C24';
      ctx.beginPath();
      const wingFlap = Math.sin(engine.frameCount * 0.35) * 4;
      ctx.ellipse(-6, 2 + wingFlap, 9, 6, -0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Big Eye
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(8, -6, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(10, -6, 3, 0, Math.PI * 2);
      ctx.fill();

      // Beak (Golden)
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(13, -1);
      ctx.lineTo(24, 2);
      ctx.lineTo(13, 6);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Ground (Counter surface)
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, height - 16, width, 16);
      ctx.fillStyle = '#0072CE';
      ctx.fillRect(0, height - 16, width, 3);

      engine.animationFrameId = requestAnimationFrame(gameLoop);
    };

    engineRef.current.animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      cancelAnimationFrame(engineRef.current.animationFrameId);
    };
  }, [gameState, endGame, winGame, playBeep]);

  // Canvas resize handler to keep crisp aspect ratio
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const targetWidth = Math.min(rect.width, 580);
      const targetHeight = Math.min(window.innerHeight - 300, 520);
      canvasRef.current.width = targetWidth;
      canvasRef.current.height = Math.max(380, targetHeight);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard space bar control
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'playing') {
          jump();
        } else if (gameState === 'start') {
          startGame();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, jump]);

  return (
    <div id="flappy-voucher-game" className="w-full max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6 select-none">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#0072CE] text-xs font-semibold">
          <Gift className="w-3.5 h-3.5" />
          <span>Game Mini Tương Tác Quầy Giao Dịch</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {GAME_TITLE}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Vui chơi giải trí trong lúc chờ phục vụ tại quầy. Vượt qua 20 chướng ngại vật để nhận ngay <strong>Voucher 2 lít xăng</strong> miễn phí!
        </p>
      </div>

      {/* Main Game Frame Container */}
      <div 
        ref={containerRef}
        className={`relative mx-auto max-w-[580px] rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800 bg-slate-900 ${
          screenShake ? 'animate-bounce' : ''
        }`}
        style={{ minHeight: '420px' }}
      >
        {/* Game HUD Bar (Score & Progress) */}
        {gameState === 'playing' && (
          <div className="absolute top-0 left-0 right-0 z-20 p-3 sm:p-4 bg-gradient-to-b from-black/60 to-transparent flex flex-col gap-2">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-wider text-amber-300 drop-shadow-md">
                  Điểm: {currentScore}/{WIN_SCORE}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-xs">
                  {getMotivationalText(currentScore)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSoundEnabled(prev => !prev)}
                  className="p-1.5 rounded-lg bg-black/40 text-white hover:bg-black/60 transition-colors cursor-pointer"
                  title="Bật/Tắt âm thanh"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </div>

            {/* Progress Bar 0 to 20 */}
            <div className="w-full h-2.5 rounded-full bg-white/25 overflow-hidden backdrop-blur-xs">
              <div 
                className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (currentScore / WIN_SCORE) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Canvas Screen */}
        <canvas
          ref={canvasRef}
          onClick={gameState === 'playing' ? jump : undefined}
          onTouchStart={(e) => {
            e.preventDefault();
            if (gameState === 'playing') jump();
          }}
          className="w-full block cursor-pointer touch-none"
        />

        {/* OVERLAY: START SCREEN */}
        {gameState === 'start' && (
          <div className="absolute inset-0 z-30 bg-gradient-to-b from-blue-950/85 via-slate-900/90 to-blue-900/95 flex flex-col items-center justify-center p-6 text-center text-white space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#003B70] via-[#0072CE] to-cyan-400 flex items-center justify-center shadow-lg border-2 border-white/20 animate-pulse">
              <Trophy className="w-8 h-8 text-amber-300" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl sm:text-2xl font-black tracking-wide text-white">
                {GAME_TITLE}
              </h3>
              <p className="text-xs sm:text-sm text-cyan-200 font-medium">
                Vượt qua 20 thử thách để nhận voucher 2 lít xăng
              </p>
            </div>

            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-base font-extrabold shadow-lg hover:shadow-xl hover:scale-103 active:scale-97 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Bắt đầu chơi</span>
            </button>

            <div className="text-xs text-slate-300 flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Chạm màn hình hoặc nhấn phím Space để bay</span>
            </div>

            {/* Display High Score & Latest Voucher if exists */}
            {(highScore > 0 || latestVoucher) && (
              <div className="flex items-center gap-4 text-[11px] text-slate-300 pt-2 border-t border-white/10">
                {highScore > 0 && (
                  <span>Kỷ lục cao nhất: <strong className="text-amber-300">{highScore}/20</strong></span>
                )}
                {latestVoucher && (
                  <span>Mã quà gần nhất: <strong className="text-emerald-300 font-mono">{latestVoucher}</strong></span>
                )}
              </div>
            )}
          </div>
        )}

        {/* OVERLAY: GAME OVER SCREEN */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 z-30 bg-black/85 flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-600/30 border border-rose-500/50 flex items-center justify-center text-rose-400 text-2xl font-black">
              ✕
            </div>

            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Rất tiếc, bạn đã vượt qua {currentScore}/20 thử thách
              </h3>
              <p className="text-xs text-slate-300">
                Chỉ còn một chút nữa thôi, hãy thử lại nhé!
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={resetGame}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0072CE] to-cyan-500 hover:brightness-110 text-white text-xs sm:text-sm font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chơi lại</span>
              </button>

              <button
                onClick={() => {
                  setGameState('start');
                  if (onBackToHome) onBackToHome();
                }}
                className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Home className="w-4 h-4" />
                <span>Về màn hình chính</span>
              </button>
            </div>
          </div>
        )}

        {/* OVERLAY: WIN SCREEN (per PDF 6 specs) */}
        {gameState === 'win' && (
          <div className="absolute inset-0 z-30 bg-gradient-to-b from-blue-950/95 to-slate-900/95 flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-900 flex items-center justify-center shadow-xl animate-bounce">
              <Trophy className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-amber-300">
                Chúc mừng!
              </h3>
              <p className="text-xs sm:text-sm text-slate-100 max-w-sm">
                Bạn đã vượt qua 20 thử thách và đủ điều kiện nhận <strong>voucher 2 lít xăng</strong>.
              </p>
            </div>

            {/* Voucher Card */}
            <div className="w-full max-w-xs bg-white text-slate-900 p-4 rounded-2xl shadow-xl border-2 border-amber-400/80 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                MÃ NHẬN QUÀ CỦA BẠN
              </span>
              <div className="font-mono text-2xl font-black text-[#003B70] tracking-widest bg-blue-50 py-1.5 px-3 rounded-xl border border-blue-200">
                {currentVoucher}
              </div>
              <p className="text-[11px] text-slate-600 font-medium leading-tight">
                Vui lòng chụp màn hình hoặc đưa mã này cho nhân viên để nhận quà.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                onClick={() => copyVoucherCode(currentVoucher)}
                className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                {copiedVoucher ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-800" />
                    <span>Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao chép mã</span>
                  </>
                )}
              </button>

              <button
                onClick={resetGame}
                className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chơi lại</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Rules & Notes card */}
      <div className="max-w-[580px] mx-auto bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs text-slate-600 space-y-2">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Info className="w-4 h-4 text-[#0072CE]" />
          <span>Thể lệ quà tặng tại quầy VietinBank</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-slate-600 leading-relaxed pl-1">
          <li>Mỗi khách hàng đạt mốc 20 điểm nhận ngay 01 mã voucher điện tử 2 lít xăng.</li>
          <li>Quý khách xuất trình mã voucher tại quầy cho giao dịch viên để nhận phiếu quà tặng trực tiếp.</li>
          <li>Chương trình áp dụng cho khách hàng đến thực hiện giao dịch tại các chi nhánh/phòng giao dịch VietinBank.</li>
        </ul>
      </div>
    </div>
  );
};
