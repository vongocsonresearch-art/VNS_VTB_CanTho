import React, { useEffect, useRef, useState } from 'react';
import { 
  Trophy, 
  RotateCcw, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Play, 
  ArrowLeft,
  Fuel,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import contentData from '../data/contentData.json';

// Global window typing for callbacks
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

interface GameSectionProps {
  onBackToMainMenu?: () => void;
}

export const GameSection: React.FC<GameSectionProps> = ({ onBackToMainMenu }) => {
  const { game } = contentData;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Game states: 'idle' | 'playing' | 'won' | 'lost'
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('vietinbank_game_highscore') || '0', 10);
  });
  const [latestVoucher, setLatestVoucher] = useState<{ code: string; date: string } | null>(() => {
    const saved = localStorage.getItem('vietinbank_latest_voucher');
    return saved ? JSON.parse(saved) : null;
  });
  const [currentVoucher, setCurrentVoucher] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Constants
  const WIN_SCORE = game.winScore || 20;
  const VOUCHER_TEXT = game.voucherReward || "Voucher 2 lít xăng";
  const BRAND_NAME = game.brandName || "VietinBank";

  // References to keep game loop in sync without stale closures
  const stateRef = useRef({
    gameState: 'idle' as 'idle' | 'playing' | 'won' | 'lost',
    score: 0,
    birdY: 200,
    birdVelocity: 0,
    pipes: [] as { x: number; topHeight: number; bottomY: number; passed: boolean }[],
    frameCount: 0,
    animId: 0,
    soundEnabled: false,
    hasWon: false,
  });

  stateRef.current.soundEnabled = soundEnabled;

  // Sound synthesizer using Web Audio API (no external CDN)
  const playSound = (type: 'jump' | 'point' | 'win' | 'hit') => {
    if (!stateRef.current.soundEnabled) return;
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'jump') {
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'point') {
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'win') {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          noteOsc.frequency.setValueAtTime(freq, now + idx * 0.12);
          noteGain.gain.setValueAtTime(0.2, now + idx * 0.12);
          noteGain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.15);
          noteOsc.start(now + idx * 0.12);
          noteOsc.stop(now + idx * 0.12 + 0.15);
        });
      }
    } catch {
      // AudioContext unavailable or blocked
    }
  };

  const generateVoucherCode = (): string => {
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    return `${game.voucherPrefix || 'VB-'}${randomDigits}`;
  };

  const copyVoucherCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Jump handler
  const flap = () => {
    if (stateRef.current.gameState !== 'playing') return;
    stateRef.current.birdVelocity = -5.8;
    playSound('jump');
  };

  const winGame = () => {
    if (stateRef.current.hasWon) return;
    stateRef.current.hasWon = true;
    stateRef.current.gameState = 'won';
    setGameState('won');

    const newCode = generateVoucherCode();
    setCurrentVoucher(newCode);

    const voucherObj = {
      code: newCode,
      date: new Date().toLocaleString('vi-VN'),
    };
    setLatestVoucher(voucherObj);
    localStorage.setItem('vietinbank_latest_voucher', JSON.stringify(voucherObj));

    setHighScore(20);
    localStorage.setItem('vietinbank_game_highscore', '20');

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#005596', '#ed1c24', '#ffc107', '#22c55e']
    });

    playSound('win');

    if (window.onFlappyVoucherWin) {
      window.onFlappyVoucherWin({
        score: 20,
        voucherCode: newCode,
        reward: VOUCHER_TEXT,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const endGame = (finalScore: number) => {
    stateRef.current.gameState = 'lost';
    setGameState('lost');
    playSound('hit');

    if (finalScore > highScore) {
      setHighScore(finalScore);
      localStorage.setItem('vietinbank_game_highscore', finalScore.toString());
    }

    if (window.onFlappyVoucherLose) {
      window.onFlappyVoucherLose({
        score: finalScore,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const resetGame = () => {
    stateRef.current.gameState = 'playing';
    stateRef.current.score = 0;
    stateRef.current.birdY = 180;
    stateRef.current.birdVelocity = 0;
    stateRef.current.pipes = [];
    stateRef.current.frameCount = 0;
    stateRef.current.hasWon = false;

    setScore(0);
    setGameState('playing');
    setCurrentVoucher('');
  };

  const startGame = () => {
    resetGame();
  };

  // Main canvas game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;

    const GRAVITY = 0.28;
    const PIPE_SPEED = 2.1;
    const PIPE_WIDTH = 58;
    const PIPE_GAP = 165;
    const BIRD_WIDTH = 38;
    const BIRD_HEIGHT = 28;
    const BIRD_X = 60;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Sky Background gradient
      const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
      skyGradient.addColorStop(0, '#e0f2fe');
      skyGradient.addColorStop(0.7, '#f0f9ff');
      skyGradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, height);

      // Distant clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(80, 70, 30, 0, Math.PI * 2);
      ctx.arc(115, 60, 40, 0, Math.PI * 2);
      ctx.arc(150, 70, 30, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(280, 110, 25, 0, Math.PI * 2);
      ctx.arc(310, 100, 35, 0, Math.PI * 2);
      ctx.arc(340, 110, 25, 0, Math.PI * 2);
      ctx.fill();

      // Ground bar
      const groundHeight = 35;
      const groundY = height - groundHeight;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, groundY, width, groundHeight);
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(0, groundY, width, 4);

      if (stateRef.current.gameState === 'playing') {
        stateRef.current.frameCount++;

        stateRef.current.birdVelocity += GRAVITY;
        stateRef.current.birdY += stateRef.current.birdVelocity;

        if (stateRef.current.frameCount % 115 === 0) {
          const minPipe = 50;
          const maxPipe = height - groundHeight - PIPE_GAP - minPipe;
          const topHeight = Math.floor(minPipe + Math.random() * (maxPipe - minPipe));
          const bottomY = topHeight + PIPE_GAP;

          stateRef.current.pipes.push({
            x: width,
            topHeight,
            bottomY,
            passed: false,
          });
        }

        for (let i = stateRef.current.pipes.length - 1; i >= 0; i--) {
          const pipe = stateRef.current.pipes[i];
          pipe.x -= PIPE_SPEED;

          if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X) {
            pipe.passed = true;
            stateRef.current.score += 1;
            const newScore = stateRef.current.score;
            setScore(newScore);
            playSound('point');

            if (newScore >= WIN_SCORE) {
              winGame();
              return;
            }
          }

          const birdBox = {
            left: BIRD_X + 4,
            right: BIRD_X + BIRD_WIDTH - 4,
            top: stateRef.current.birdY + 4,
            bottom: stateRef.current.birdY + BIRD_HEIGHT - 4,
          };

          const hitTopPipe =
            birdBox.right > pipe.x &&
            birdBox.left < pipe.x + PIPE_WIDTH &&
            birdBox.top < pipe.topHeight;

          const hitBottomPipe =
            birdBox.right > pipe.x &&
            birdBox.left < pipe.x + PIPE_WIDTH &&
            birdBox.bottom > pipe.bottomY;

          if (hitTopPipe || hitBottomPipe) {
            endGame(stateRef.current.score);
            return;
          }

          if (pipe.x + PIPE_WIDTH < -10) {
            stateRef.current.pipes.splice(i, 1);
          }
        }

        if (stateRef.current.birdY + BIRD_HEIGHT >= groundY) {
          stateRef.current.birdY = groundY - BIRD_HEIGHT;
          endGame(stateRef.current.score);
          return;
        }
        if (stateRef.current.birdY < 0) {
          stateRef.current.birdY = 0;
          stateRef.current.birdVelocity = 0;
        }
      }

      // Draw Pipes
      stateRef.current.pipes.forEach((pipe) => {
        const topGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
        topGrad.addColorStop(0, '#0284c7');
        topGrad.addColorStop(0.5, '#38bdf8');
        topGrad.addColorStop(1, '#0369a1');
        ctx.fillStyle = topGrad;
        ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
        ctx.fillStyle = '#005596';
        ctx.fillRect(pipe.x - 3, pipe.topHeight - 16, PIPE_WIDTH + 6, 16);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(pipe.x - 3, pipe.topHeight - 3, PIPE_WIDTH + 6, 3);

        const botGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + PIPE_WIDTH, 0);
        botGrad.addColorStop(0, '#0284c7');
        botGrad.addColorStop(0.5, '#38bdf8');
        botGrad.addColorStop(1, '#0369a1');
        ctx.fillStyle = botGrad;
        ctx.fillRect(pipe.x, pipe.bottomY, PIPE_WIDTH, groundY - pipe.bottomY);
        ctx.fillStyle = '#005596';
        ctx.fillRect(pipe.x - 3, pipe.bottomY, PIPE_WIDTH + 6, 16);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(pipe.x - 3, pipe.bottomY, PIPE_WIDTH + 6, 3);
      });

      // Draw Flying VietinBank Credit Card character!
      ctx.save();
      const currentY = stateRef.current.birdY;
      const angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, (stateRef.current.birdVelocity * 0.08)));
      ctx.translate(BIRD_X + BIRD_WIDTH / 2, currentY + BIRD_HEIGHT / 2);
      ctx.rotate(angle);

      const cardGrad = ctx.createLinearGradient(-BIRD_WIDTH / 2, -BIRD_HEIGHT / 2, BIRD_WIDTH / 2, BIRD_HEIGHT / 2);
      cardGrad.addColorStop(0, '#005596');
      cardGrad.addColorStop(1, '#003366');
      ctx.fillStyle = cardGrad;
      
      const r = 5;
      const x = -BIRD_WIDTH / 2;
      const y = -BIRD_HEIGHT / 2;
      const w = BIRD_WIDTH;
      const h = BIRD_HEIGHT;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();

      // Red curved swoop
      ctx.fillStyle = '#ed1c24';
      ctx.beginPath();
      ctx.arc(x + w * 0.7, y + h * 0.8, 8, 0, Math.PI * 2);
      ctx.fill();

      // Gold EMV Chip
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x + 5, y + 7, 7, 6);
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x + 5, y + 7, 7, 6);

      // Wing flapping
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      const wingFlap = Math.sin(stateRef.current.frameCount * 0.3) * 4;
      ctx.ellipse(x + 12, y + h + wingFlap, 6, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      if (stateRef.current.gameState === 'idle') {
        stateRef.current.frameCount++;
        stateRef.current.birdY = 180 + Math.sin(stateRef.current.frameCount * 0.05) * 8;
      }

      stateRef.current.animId = requestAnimationFrame(render);
    };

    stateRef.current.animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(stateRef.current.animId);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (stateRef.current.gameState === 'playing') {
          flap();
        } else if (stateRef.current.gameState === 'idle' || stateRef.current.gameState === 'lost') {
          startGame();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getEncouragement = (s: number) => {
    if (s <= game.milestones.level1.max) return game.milestones.level1.text;
    if (s <= game.milestones.level2.max) return game.milestones.level2.text;
    if (s <= game.milestones.level3.max) return game.milestones.level3.text;
    if (s <= game.milestones.level4.max) return game.milestones.level4.text;
    return game.milestones.level5.text;
  };

  return (
    <div id="flappy-voucher-game" className="py-8 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Cấu phần 3: Mini Game Nhận Quà Tại Quầy
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          {game.title}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base font-medium">
          {game.subtitle}
        </p>
      </div>

      <div className="relative bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden max-w-lg mx-auto">
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold tracking-wider text-blue-300 uppercase">
              {BRAND_NAME} Flight
            </span>
            <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-400">
              <Trophy className="w-3.5 h-3.5" />
              <span>Kỷ lục: {highScore}/20</span>
            </div>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>

        <div className="bg-slate-100 px-5 py-2.5 border-b border-slate-200 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">
              Điểm số: <strong className="text-base text-[#005596]">{score}</strong> / {WIN_SCORE}
            </span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              {getEncouragement(score)}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-linear-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-200"
              style={{ width: `${Math.min(100, (score / WIN_SCORE) * 100)}%` }}
            />
          </div>
        </div>

        <div 
          className="relative w-full aspect-4/3 sm:aspect-16/11 bg-sky-100 cursor-pointer overflow-hidden touch-none"
          onClick={flap}
        >
          <canvas
            ref={canvasRef}
            width={400}
            height={320}
            className="w-full h-full block"
          />

          {gameState === 'idle' && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-[#005596] to-sky-400 flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <Fuel className="w-8 h-8 text-white" />
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white">Thử thách {WIN_SCORE} chướng ngại vật</h3>
                <p className="text-xs text-blue-200 mt-1 max-w-xs">
                  {game.instruction}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startGame();
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-xl transition-all cursor-pointer transform hover:scale-105"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Bắt đầu chơi</span>
              </button>
            </div>
          )}

          {gameState === 'lost' && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                <Trophy className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  {game.loseMessage.replace('{score}', score.toString())}
                </h3>
                <p className="text-xs text-slate-300">
                  {game.loseEncourage}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={resetGame}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#005596] hover:bg-blue-600 text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Chơi lại</span>
                </button>
                {onBackToMainMenu && (
                  <button
                    onClick={onBackToMainMenu}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Về màn hình chính</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {gameState === 'won' && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white space-y-4 animate-in zoom-in-95 duration-200 overflow-y-auto">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                <Fuel className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  🎉 {game.winMessage} 🎉
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold text-white">
                  {game.winDetail}
                </h3>
              </div>

              <div className="bg-linear-to-r from-amber-500/20 via-yellow-500/30 to-amber-500/20 border-2 border-amber-400 rounded-2xl p-4 w-full max-w-xs space-y-1">
                <p className="text-[11px] text-amber-200 font-medium">MÃ NHẬN QUÀ CỦA BẠN</p>
                <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-widest font-mono">
                  {currentVoucher}
                </div>
                <p className="text-[11px] text-slate-300">
                  Phần quà: <strong>{VOUCHER_TEXT}</strong>
                </p>
              </div>

              <p className="text-xs text-slate-300 max-w-xs">
                {game.voucherNotice}
              </p>

              <div className="flex items-center gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => copyVoucherCode(currentVoucher)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-all cursor-pointer"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Đã sao chép!' : 'Sao chép mã'}</span>
                </button>

                <button
                  onClick={resetGame}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Chơi lại</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-slate-50 px-4 py-2.5 text-center text-xs text-slate-500 border-t border-slate-200 flex items-center justify-center gap-2">
          <span>💡 <strong>Mẹo:</strong> Nhấn nhẹ màn hình hoặc phím Space liên tục để bay ổn định.</span>
        </div>
      </div>

      {latestVoucher && (
        <div className="max-w-lg mx-auto bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#005596] text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-600 font-medium">Mã voucher nhận gần nhất:</p>
              <p className="text-base font-extrabold text-[#005596] font-mono tracking-wider">
                {latestVoucher.code}
              </p>
              <p className="text-[11px] text-slate-500">{latestVoucher.date} • {VOUCHER_TEXT}</p>
            </div>
          </div>

          <button
            onClick={() => copyVoucherCode(latestVoucher.code)}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[#005596] border border-blue-200 rounded-lg text-xs font-bold cursor-pointer transition-colors"
          >
            Sao chép
          </button>
        </div>
      )}
    </div>
  );
};
