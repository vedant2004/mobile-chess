import React, { useState, useEffect, useRef, useCallback } from 'react';
import type {
  Balloon,
  BalloonType,
  BalloonDifficulty,
  BalloonMode,
  Particle,
  FloatingText,
  BalloonPopStats,
} from '../../types/balloon';
import { BALLOON_DIFFICULTIES, BALLOON_COLORS } from '../../logic/constants';
import { soundManager } from '../../logic/audio';
import {
  Home,
  RotateCcw,
  Pause,
  Play,
  Flame,
  Heart,
  Trophy,
} from 'lucide-react';

interface BalloonGameProps {
  onBackToHub: () => void;
}

const STATS_STORAGE_KEY = 'grandmaster_balloon_stats_v1';

export const BalloonGame: React.FC<BalloonGameProps> = ({ onBackToHub }) => {
  const [difficulty, setDifficulty] = useState<BalloonDifficulty>('normal');
  const [mode, setMode] = useState<BalloonMode>('classic');
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [timeLeft, setTimeLeft] = useState<number>(60); // Time Attack
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [frenzyActive, setFrenzyActive] = useState<boolean>(false);

  // Stats
  const [stats, setStats] = useState<BalloonPopStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      highScore: 0,
      classicBestScore: 0,
      timeAttackBestScore: 0,
      endlessBestScore: 0,
      totalPopped: 0,
      maxCombo: 1,
    };
  });

  // Canvas ref for particle explosions
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const balloonsRef = useRef<Balloon[]>([]);
  const lastSpawnTime = useRef<number>(Date.now());
  const lastPopTime = useRef<number>(0);
  const animFrameRef = useRef<number>(0);

  // Initialize game state on mode or difficulty change
  const startNewGame = useCallback(() => {
    const diffConfig = BALLOON_DIFFICULTIES[difficulty];
    setScore(0);
    setCombo(1);
    setLives(diffConfig.lives);
    setTimeLeft(60);
    setIsGameOver(false);
    setIsPaused(false);
    setFrenzyActive(false);

    balloonsRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    lastSpawnTime.current = Date.now();
  }, [difficulty]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Save High Scores
  const checkAndUpdateHighScore = useCallback(
    (finalScore: number) => {
      setStats((prev) => {
        const next: BalloonPopStats = {
          ...prev,
          highScore: Math.max(prev.highScore, finalScore),
          classicBestScore: mode === 'classic' ? Math.max(prev.classicBestScore, finalScore) : prev.classicBestScore,
          timeAttackBestScore: mode === 'time_attack' ? Math.max(prev.timeAttackBestScore, finalScore) : prev.timeAttackBestScore,
          endlessBestScore: mode === 'endless' ? Math.max(prev.endlessBestScore, finalScore) : prev.endlessBestScore,
          maxCombo: Math.max(prev.maxCombo, combo),
        };
        try {
          localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [mode, combo]
  );

  // End Game
  const triggerGameOver = useCallback(() => {
    setIsGameOver(true);
    soundManager.playGameOver();
    checkAndUpdateHighScore(score);
  }, [score, checkAndUpdateHighScore]);

  // Spawn Balloon helper
  const spawnBalloon = useCallback(() => {
    const diffConfig = BALLOON_DIFFICULTIES[difficulty];
    const rand = Math.random();

    let type: BalloonType = 'normal';
    let size = 34 + Math.random() * 12; // Radius
    let color = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    let points = 100;

    if (rand < diffConfig.bombChance) {
      type = 'bomb';
      size = 32;
      color = '#1e293b';
      points = -300;
    } else if (rand < diffConfig.bombChance + 0.08) {
      type = 'golden';
      size = 36;
      color = '#f59e0b';
      points = 500;
    } else if (rand < diffConfig.bombChance + 0.14) {
      type = 'rainbow';
      size = 36;
      color = '#ec4899';
      points = 300;
    } else if (rand < diffConfig.bombChance + 0.22) {
      type = 'tiny';
      size = 22;
      color = '#06b6d4';
      points = 350;
    }

    const speed = diffConfig.speedMin + Math.random() * (diffConfig.speedMax - diffConfig.speedMin);
    const x = 8 + Math.random() * 84; // 8% to 92%

    balloonsRef.current.push({
      id: Math.random().toString(36).substring(2, 9),
      x,
      y: 110, // Start slightly below screen
      speed,
      wobbleSpeed: 2 + Math.random() * 3,
      wobbleOffset: Math.random() * Math.PI * 2,
      wobbleAmp: 2 + Math.random() * 3,
      size,
      color,
      type,
      points,
      popped: false,
    });
  }, [difficulty]);

  // Trigger Particle Explosion
  const createExplosion = (xPx: number, yPx: number, color: string, count: number = 24) => {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 2 + Math.random() * 6;
      particlesRef.current.push({
        id: Math.random().toString(),
        x: xPx,
        y: yPx,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        color,
        radius: 2.5 + Math.random() * 3.5,
        alpha: 1,
        life: 0,
        maxLife: 28 + Math.random() * 15,
      });
    }
  };

  // Pop a Balloon
  const handlePop = (balloon: Balloon, clientX: number, clientY: number) => {
    if (balloon.popped || isGameOver || isPaused) return;

    balloon.popped = true;
    const now = Date.now();

    // Rect for particle coordinates
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const xPx = clientX - rect.left;
      const yPx = clientY - rect.top;
      createExplosion(xPx, yPx, balloon.color, balloon.type === 'golden' ? 36 : 22);

      // Combo management
      let currentCombo = combo;
      if (now - lastPopTime.current < 1200) {
        currentCombo = Math.min(10, combo + 1);
        setCombo(currentCombo);
        if (currentCombo >= 3) {
          soundManager.playComboChime(currentCombo);
        }
      } else {
        currentCombo = 1;
        setCombo(1);
      }
      lastPopTime.current = now;

      // Handle Balloon Type
      if (balloon.type === 'bomb') {
        soundManager.playBombExplosion();
        if (mode === 'classic') {
          setLives((l) => {
            const nextL = l - 1;
            if (nextL <= 0) triggerGameOver();
            return nextL;
          });
        }
        setScore((s) => Math.max(0, s - 300));
        floatingTextsRef.current.push({
          id: Math.random().toString(),
          x: xPx,
          y: yPx,
          text: '-300 BOMB!',
          color: '#ef4444',
          alpha: 1,
          vy: -1.5,
        });
        setCombo(1);
        return;
      }

      // Normal, Golden, Rainbow, Tiny
      soundManager.playBalloonPop(balloon.size, currentCombo);

      const multiplier = (frenzyActive ? 2 : 1) * currentCombo;
      const pts = balloon.points * multiplier;

      setScore((s) => s + pts);
      setStats((prev) => ({ ...prev, totalPopped: prev.totalPopped + 1 }));

      let text = `+${pts}`;
      if (currentCombo > 1) text += ` (${currentCombo}x)`;
      if (balloon.type === 'golden') {
        soundManager.playBonusChime();
        text += ' ★ BONUS!';
      } else if (balloon.type === 'rainbow') {
        setFrenzyActive(true);
        setTimeout(() => setFrenzyActive(false), 5000);
        text += ' 🌈 FRENZY 2X!';
      }

      floatingTextsRef.current.push({
        id: Math.random().toString(),
        x: xPx,
        y: yPx,
        text,
        color: balloon.type === 'golden' ? '#f59e0b' : balloon.type === 'rainbow' ? '#ec4899' : '#34d399',
        alpha: 1,
        vy: -2,
      });
    }
  };

  // Main 60fps Game Loop
  useEffect(() => {
    let lastTime = performance.now();

    const updateLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (!isPaused && !isGameOver) {
        // 1. Spawning
        const diffConfig = BALLOON_DIFFICULTIES[difficulty];
        const nowMs = Date.now();
        if (nowMs - lastSpawnTime.current > diffConfig.spawnIntervalMs) {
          spawnBalloon();
          lastSpawnTime.current = nowMs;
        }

        // 2. Update Balloons
        const canvas = canvasRef.current;
        const width = canvas ? canvas.width : 500;
        const height = canvas ? canvas.height : 700;

        balloonsRef.current = balloonsRef.current.filter((b) => {
          if (b.popped) return false;

          b.y -= b.speed * dt;
          b.wobbleOffset += b.wobbleSpeed * dt;

          // Check if missed reaching top
          if (b.y < -15) {
            if (mode === 'classic' && b.type !== 'bomb') {
              setLives((l) => {
                const nextL = l - 1;
                if (nextL <= 0) triggerGameOver();
                return nextL;
              });
              setCombo(1);
            }
            return false;
          }

          return true;
        });

        // 3. Render Canvas Particles & Balloons
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, width, height);

            // Draw Balloons
            balloonsRef.current.forEach((b) => {
              const xPos = (b.x / 100) * width + Math.sin(b.wobbleOffset) * b.wobbleAmp;
              const yPos = (b.y / 100) * height;

              ctx.save();
              ctx.translate(xPos, yPos);

              // Balloon Body (Oval)
              ctx.beginPath();
              ctx.fillStyle = b.color;
              ctx.ellipse(0, 0, b.size * 0.85, b.size, 0, 0, Math.PI * 2);
              ctx.fill();

              // Highlight shine
              ctx.beginPath();
              ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
              ctx.ellipse(-b.size * 0.3, -b.size * 0.35, b.size * 0.22, b.size * 0.35, -0.4, 0, Math.PI * 2);
              ctx.fill();

              // Knot & string
              ctx.beginPath();
              ctx.fillStyle = b.color;
              ctx.moveTo(-4, b.size);
              ctx.lineTo(4, b.size);
              ctx.lineTo(0, b.size + 6);
              ctx.closePath();
              ctx.fill();

              ctx.beginPath();
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
              ctx.lineWidth = 1.5;
              ctx.moveTo(0, b.size + 6);
              ctx.quadraticCurveTo(6, b.size + 16, 0, b.size + 24);
              ctx.stroke();

              // Special Icon Overlays
              if (b.type === 'bomb') {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 16px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('💣', 0, 0);
              } else if (b.type === 'golden') {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 14px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('★', 0, 0);
              } else if (b.type === 'rainbow') {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 14px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🌈', 0, 0);
              }

              ctx.restore();
            });

            // Update & Draw Particles
            particlesRef.current = particlesRef.current.filter((p) => {
              p.x += p.vx;
              p.y += p.vy;
              p.vy += 0.15; // Gravity
              p.life += 1;
              p.alpha = Math.max(0, 1 - p.life / p.maxLife);

              ctx.save();
              ctx.beginPath();
              ctx.fillStyle = p.color;
              ctx.globalAlpha = p.alpha;
              ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();

              return p.life < p.maxLife;
            });

            // Update & Draw Floating Score Texts
            floatingTextsRef.current = floatingTextsRef.current.filter((t) => {
              t.y += t.vy;
              t.alpha -= 0.025;

              ctx.save();
              ctx.font = 'bold 16px Outfit, sans-serif';
              ctx.fillStyle = t.color;
              ctx.globalAlpha = Math.max(0, t.alpha);
              ctx.textAlign = 'center';
              ctx.shadowColor = 'rgba(0,0,0,0.8)';
              ctx.shadowBlur = 6;
              ctx.fillText(t.text, t.x, t.y);
              ctx.restore();

              return t.alpha > 0;
            });
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [difficulty, isPaused, isGameOver, mode, spawnBalloon, triggerGameOver]);

  // Time Attack 1-second countdown
  useEffect(() => {
    if (mode !== 'time_attack' || isGameOver || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          triggerGameOver();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mode, isGameOver, isPaused, triggerGameOver]);

  // Canvas Click/Touch Handler
  const handleCanvasInteraction = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || isGameOver || isPaused) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Find balloon that was tapped (reverse search to hit topmost first)
    for (let i = balloonsRef.current.length - 1; i >= 0; i--) {
      const b = balloonsRef.current[i];
      if (b.popped) continue;

      const bx = (b.x / 100) * canvas.width + Math.sin(b.wobbleOffset) * b.wobbleAmp;
      const by = (b.y / 100) * canvas.height;

      const dist = Math.hypot(clickX - bx, clickY - by);
      if (dist <= b.size * 1.25) {
        handlePop(b, e.clientX, e.clientY);
        break;
      }
    }
  };

  // Resize canvas to match container
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-950 text-slate-100 select-none pb-4 relative overflow-hidden">
      {/* Header Bar */}
      <header className="w-full max-w-5xl mx-auto px-3 py-2.5 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToHub}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            title="Return to Game Hub"
          >
            <Home size={18} />
            <span className="hidden sm:inline text-xs font-bold">Hub</span>
          </button>

          <div>
            <h1 className="text-base md:text-lg font-black tracking-tight flex items-center gap-1.5 leading-none text-rose-400">
              🎈 Balloon Pop
            </h1>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              {mode.replace('_', ' ')} • {difficulty}
            </span>
          </div>
        </div>

        {/* HUD Elements */}
        <div className="flex items-center gap-2 md:gap-3 text-xs font-mono">
          {/* Score */}
          <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 shadow-sm">
            <span className="text-slate-400">Score:</span>
            <span className="font-extrabold text-amber-300 text-sm md:text-base">{score}</span>
          </div>

          {/* Combo Multiplier */}
          {combo > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black animate-pulse shadow-md">
              <Flame size={14} />
              <span>{combo}x</span>
            </div>
          )}

          {/* Mode-specific status: Lives or Timer */}
          {mode === 'classic' && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-rose-400">
              <Heart size={14} className="fill-rose-500 text-rose-500" />
              <span className="font-bold">{lives}</span>
            </div>
          )}

          {mode === 'time_attack' && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 border border-slate-700 text-cyan-300 font-bold">
              <span>{timeLeft}s</span>
            </div>
          )}

          {/* Pause */}
          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        </div>
      </header>

      {/* Mode & Difficulty Selector Bar */}
      <div className="w-full max-w-5xl mx-auto px-3 py-1.5 flex items-center justify-between gap-2 border-b border-slate-900 text-xs">
        {/* Modes */}
        <div className="flex items-center gap-1">
          {(['classic', 'time_attack', 'endless'] as BalloonMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                startNewGame();
              }}
              className={`px-2 py-0.5 rounded-lg capitalize font-semibold transition-all cursor-pointer ${
                mode === m ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Difficulties */}
        <div className="flex items-center gap-1">
          {(['easy', 'normal', 'hard', 'insane'] as BalloonDifficulty[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDifficulty(d);
                startNewGame();
              }}
              className={`px-2 py-0.5 rounded-lg capitalize font-semibold transition-all cursor-pointer ${
                difficulty === d ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Frenzy Banner Notification */}
      {frenzyActive && (
        <div className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 py-1 text-center font-black text-xs text-white tracking-widest uppercase animate-pulse shadow-md z-20">
          ✨ 2X FRENZY ACTIVE! ✨
        </div>
      )}

      {/* Main Interactive Canvas Arena */}
      <main className="flex-1 w-full max-w-4xl mx-auto relative touch-none select-none flex items-center justify-center p-2">
        <div className="w-full h-full min-h-[500px] md:min-h-[620px] rounded-3xl border-2 border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/40 relative overflow-hidden shadow-2xl">
          <canvas
            ref={canvasRef}
            onPointerDown={handleCanvasInteraction}
            className="w-full h-full block cursor-crosshair touch-none"
          />

          {/* Pause Overlay */}
          {isPaused && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
              <h2 className="text-2xl font-black text-white">Game Paused</h2>
              <button
                type="button"
                onClick={() => setIsPaused(false)}
                className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center gap-2 cursor-pointer"
              >
                <Play size={18} /> Resume
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Game Over Screen Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-500/60 rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/50 flex items-center justify-center mb-3">
              <Trophy size={36} className="animate-bounce" />
            </div>

            <h2 className="text-2xl font-black text-white">Game Over!</h2>
            <p className="text-xs text-slate-400 mb-4">Great effort popping balloons!</p>

            <div className="w-full grid grid-cols-2 gap-2 mb-4 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-400 block text-[10px]">FINAL SCORE</span>
                <span className="font-extrabold text-amber-300 text-base">{score}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-400 block text-[10px]">BEST COMBO</span>
                <span className="font-extrabold text-emerald-400 text-base">{combo}x</span>
              </div>
            </div>

            <div className="w-full p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80 mb-5 flex items-center justify-between text-xs">
              <span className="text-slate-400">High Score:</span>
              <span className="font-bold text-cyan-300">{Math.max(stats.highScore, score)}</span>
            </div>

            <div className="w-full space-y-2">
              <button
                type="button"
                onClick={startNewGame}
                className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <RotateCcw size={16} />
                Play Again
              </button>

              <button
                type="button"
                onClick={onBackToHub}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Return to Game Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
