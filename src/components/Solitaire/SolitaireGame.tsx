import React, { useState, useEffect, useCallback } from 'react';
import type { Card, SolitaireState, SolitaireStats } from '../../types/solitaire';
import {
  createNewSolitaireGame,
  drawFromStock,
  trySmartMove,
  canPlaceOnTableau,
  canPlaceOnFoundation,
  checkWin,
  canAutoComplete,
  stepAutoComplete,
} from '../../logic/solitaireLogic';
import { CardComponent } from './CardComponent';
import { soundManager } from '../../logic/audio';
import confetti from 'canvas-confetti';
import {
  Home,
  RotateCcw,
  Undo2,
  Trophy,
  Play,
  Zap,
} from 'lucide-react';

interface SolitaireGameProps {
  onBackToHub: () => void;
}

const STATS_STORAGE_KEY = 'grandmaster_solitaire_stats_v1';

export const SolitaireGame: React.FC<SolitaireGameProps> = ({ onBackToHub }) => {
  const [gameState, setGameState] = useState<SolitaireState>(() => createNewSolitaireGame(1));
  const [history, setHistory] = useState<SolitaireState[]>([]);
  const [selectedCard, setSelectedCard] = useState<{ card: Card; colIdx?: number; isWaste?: boolean } | null>(null);
  const [isAutoCompleting, setIsAutoCompleting] = useState(false);

  // Stats
  const [stats, setStats] = useState<SolitaireStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return { gamesPlayed: 0, gamesWon: 0, bestTime: 0, bestMoves: 0 };
  });

  // Timer interval
  useEffect(() => {
    if (gameState.isGameWon) return;

    const timer = setInterval(() => {
      setGameState((prev) => ({ ...prev, timer: prev.timer + 1 }));
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.isGameWon]);

  // Save history state for undo
  const pushHistory = useCallback((currentState: SolitaireState) => {
    setHistory((prev) => [...prev.slice(-15), JSON.parse(JSON.stringify(currentState))]);
  }, []);

  // Handle Win
  useEffect(() => {
    if (gameState.isGameWon) {
      soundManager.playSolitaireWin();
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {}

      setStats((prev) => {
        const next: SolitaireStats = {
          gamesPlayed: prev.gamesPlayed + 1,
          gamesWon: prev.gamesWon + 1,
          bestTime: prev.bestTime === 0 ? gameState.timer : Math.min(prev.bestTime, gameState.timer),
          bestMoves: prev.bestMoves === 0 ? gameState.moves : Math.min(prev.bestMoves, gameState.moves),
        };
        try {
          localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  }, [gameState.isGameWon, gameState.timer, gameState.moves]);

  // Stock click
  const handleStockClick = () => {
    pushHistory(gameState);
    soundManager.playCardFlip();
    setGameState((prev) => drawFromStock(prev));
    setSelectedCard(null);
  };

  // Card click (Smart tap-to-move)
  const handleCardClick = (card: Card, colIdx?: number, isWaste?: boolean) => {
    if (!card.isFaceUp) return;

    // Try smart move immediately
    const nextState = trySmartMove(gameState, card, colIdx);
    if (nextState) {
      pushHistory(gameState);
      soundManager.playCardMove();
      setGameState(nextState);
      setSelectedCard(null);
      return;
    }

    // Toggle selection
    if (selectedCard?.card.id === card.id) {
      setSelectedCard(null);
    } else {
      setSelectedCard({ card, colIdx, isWaste });
      soundManager.playButtonClick();
    }
  };

  // Click on destination column
  const handleTableauColumnClick = (targetColIdx: number) => {
    if (!selectedCard) return;

    const tableau = gameState.tableau.map((c) => [...c]);
    const foundations = gameState.foundations.map((f) => [...f]);
    let waste = [...gameState.waste];

    if (canPlaceOnTableau(selectedCard.card, tableau[targetColIdx])) {
      pushHistory(gameState);
      soundManager.playCardMove();

      if (selectedCard.colIdx !== undefined) {
        // Move stack
        const col = tableau[selectedCard.colIdx];
        const cardIdx = col.findIndex((c) => c.id === selectedCard.card.id);
        const moving = col.splice(cardIdx);

        if (col.length > 0) col[col.length - 1].isFaceUp = true;
        tableau[targetColIdx].push(...moving);
      } else if (selectedCard.isWaste) {
        waste = waste.filter((c) => c.id !== selectedCard.card.id);
        tableau[targetColIdx].push(selectedCard.card);
      }

      setGameState((prev) => ({
        ...prev,
        tableau: tableau as any,
        foundations: foundations as any,
        waste,
        moves: prev.moves + 1,
        score: prev.score + 5,
      }));
      setSelectedCard(null);
    }
  };

  // Click on Foundation pile
  const handleFoundationClick = (fIdx: number) => {
    if (!selectedCard) return;

    const foundations = gameState.foundations.map((f) => [...f]);
    const tableau = gameState.tableau.map((c) => [...c]);
    let waste = [...gameState.waste];

    if (canPlaceOnFoundation(selectedCard.card, foundations[fIdx])) {
      pushHistory(gameState);
      soundManager.playFoundationDrop();

      if (selectedCard.colIdx !== undefined) {
        const col = tableau[selectedCard.colIdx];
        if (col[col.length - 1].id === selectedCard.card.id) {
          col.pop();
          if (col.length > 0) col[col.length - 1].isFaceUp = true;
          foundations[fIdx].push(selectedCard.card);
        } else {
          return; // Can only place single card on foundation
        }
      } else if (selectedCard.isWaste) {
        waste = waste.filter((c) => c.id !== selectedCard.card.id);
        foundations[fIdx].push(selectedCard.card);
      }

      const won = checkWin({ ...gameState, foundations: foundations as any });
      setGameState((prev) => ({
        ...prev,
        tableau: tableau as any,
        foundations: foundations as any,
        waste,
        moves: prev.moves + 1,
        score: prev.score + 10,
        isGameWon: won,
      }));
      setSelectedCard(null);
    }
  };

  // Undo Move
  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setGameState(prev);
    setSelectedCard(null);
    soundManager.playCardMove();
  };

  // New Game
  const handleNewGame = (drawCount: 1 | 3 = gameState.drawCount) => {
    setGameState(createNewSolitaireGame(drawCount));
    setHistory([]);
    setSelectedCard(null);
    setIsAutoCompleting(false);
    soundManager.playButtonClick();
  };

  // Auto-complete runner
  const handleAutoComplete = () => {
    setIsAutoCompleting(true);
  };

  useEffect(() => {
    if (!isAutoCompleting) return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        const next = stepAutoComplete(prev);
        if (!next || next.isGameWon) {
          setIsAutoCompleting(false);
          clearInterval(timer);
          return next || prev;
        }
        soundManager.playFoundationDrop();
        return next;
      });
    }, 120);

    return () => clearInterval(timer);
  }, [isAutoCompleting]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const eligibleForAutoComplete = canAutoComplete(gameState) && !gameState.isGameWon && !isAutoCompleting;

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-950 text-slate-100 select-none pb-6">
      {/* Top Header Bar */}
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
            <h1 className="text-base md:text-lg font-black tracking-tight flex items-center gap-1.5 leading-none text-emerald-400">
              ♠ Klondike Solitaire
            </h1>
            <span className="text-[10px] text-slate-400 font-semibold">
              Draw {gameState.drawCount} • {stats.gamesWon} {stats.gamesWon === 1 ? 'win' : 'wins'}
            </span>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center gap-2 md:gap-3 text-xs font-mono">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400">Score:</span>
            <span className="font-bold text-emerald-400">{gameState.score}</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400">Moves:</span>
            <span className="font-bold">{gameState.moves}</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700">
            <span className="text-slate-400">Time:</span>
            <span className="font-bold text-cyan-300">{formatTimer(gameState.timer)}</span>
          </div>
        </div>
      </header>

      {/* Sub-bar Controls */}
      <div className="w-full max-w-5xl mx-auto px-3 py-2 flex items-center justify-between gap-2 border-b border-slate-900">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleNewGame(1)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              gameState.drawCount === 1
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-slate-800/60 border-slate-700 text-slate-300'
            }`}
          >
            Draw 1
          </button>
          <button
            type="button"
            onClick={() => handleNewGame(3)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              gameState.drawCount === 3
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-slate-800/60 border-slate-700 text-slate-300'
            }`}
          >
            Draw 3
          </button>
        </div>

        <div className="flex items-center gap-2">
          {eligibleForAutoComplete && (
            <button
              type="button"
              onClick={handleAutoComplete}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 font-extrabold text-xs flex items-center gap-1 shadow-lg shadow-emerald-950/40 animate-pulse cursor-pointer"
            >
              <Zap size={14} />
              Auto Complete!
            </button>
          )}

          <button
            type="button"
            disabled={history.length === 0}
            onClick={handleUndo}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 transition-colors flex items-center gap-1 text-xs cursor-pointer"
            title="Undo"
          >
            <Undo2 size={16} />
            <span className="hidden sm:inline">Undo</span>
          </button>

          <button
            type="button"
            onClick={() => handleNewGame()}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1 text-xs cursor-pointer"
            title="New Game"
          >
            <RotateCcw size={16} />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>
      </div>

      {/* Main Board Arena */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-2 sm:px-4 py-3 flex flex-col gap-4">
        {/* Top Deck: Stock + Waste | 4 Foundations */}
        <div className="w-full flex items-center justify-between gap-2">
          {/* Left: Stock & Waste */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Stock Pile */}
            <div
              onClick={handleStockClick}
              className="w-11 sm:w-14 md:w-16 h-16 sm:h-20 md:h-24 rounded-lg md:rounded-xl border-2 border-dashed border-slate-700 flex items-center justify-center cursor-pointer relative shadow"
            >
              {gameState.stock.length > 0 ? (
                <CardComponent card={gameState.stock[gameState.stock.length - 1]} />
              ) : (
                <div className="text-slate-600 font-bold text-xs flex flex-col items-center">
                  <RotateCcw size={18} />
                  <span className="text-[9px]">Reset</span>
                </div>
              )}
              {gameState.stock.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1 rounded-full text-[9px] font-mono font-bold bg-slate-900 border border-slate-700 text-slate-300">
                  {gameState.stock.length}
                </span>
              )}
            </div>

            {/* Waste Pile */}
            <div className="w-11 sm:w-14 md:w-16 h-16 sm:h-20 md:h-24 rounded-lg md:rounded-xl border-2 border-slate-800 flex items-center justify-center relative">
              {gameState.waste.length > 0 ? (
                <CardComponent
                  card={gameState.waste[gameState.waste.length - 1]}
                  isSelected={selectedCard?.card.id === gameState.waste[gameState.waste.length - 1].id}
                  onClick={() => handleCardClick(gameState.waste[gameState.waste.length - 1], undefined, true)}
                />
              ) : (
                <span className="text-slate-700 text-xs">Empty</span>
              )}
            </div>
          </div>

          {/* Right: 4 Foundation Piles (♠, ♥, ♦, ♣) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {(['♠', '♥', '♦', '♣'] as const).map((ghostSuit, fIdx) => {
              const pile = gameState.foundations[fIdx];
              const topCard = pile.length > 0 ? pile[pile.length - 1] : null;

              return (
                <div
                  key={fIdx}
                  onClick={() => handleFoundationClick(fIdx)}
                  className="w-11 sm:w-14 md:w-16 h-16 sm:h-20 md:h-24 rounded-lg md:rounded-xl border-2 border-dashed border-emerald-900/60 bg-emerald-950/20 flex items-center justify-center relative cursor-pointer shadow transition-colors hover:border-emerald-500/60"
                >
                  {topCard ? (
                    <CardComponent card={topCard} />
                  ) : (
                    <span className="text-emerald-500/30 text-lg sm:text-2xl font-bold select-none">
                      {ghostSuit}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 7 Tableau Columns */}
        <div className="w-full grid grid-cols-7 gap-1 sm:gap-2 pt-2 min-h-[360px] md:min-h-[460px]">
          {gameState.tableau.map((col, colIdx) => {
            return (
              <div
                key={colIdx}
                onClick={() => col.length === 0 && handleTableauColumnClick(colIdx)}
                className={`flex flex-col items-center min-h-[140px] rounded-lg border border-transparent ${
                  col.length === 0 ? 'border-dashed border-slate-800/80 bg-slate-900/30' : ''
                }`}
              >
                {col.map((card, cardIdx) => {
                  const isSelected = selectedCard?.card.id === card.id;

                  // Stacking offset: small offset for face down, larger offset for face up
                  const topOffset = cardIdx === 0 ? 0 : card.isFaceUp ? 22 : 12;

                  return (
                    <div
                      key={card.id}
                      style={{
                        marginTop: cardIdx === 0 ? '0px' : `-${80 - topOffset}px`,
                        zIndex: cardIdx + 1,
                      }}
                      className="w-full flex justify-center"
                    >
                      <CardComponent
                        card={card}
                        isSelected={isSelected}
                        onClick={() => handleCardClick(card, colIdx)}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </main>

      {/* Win Modal */}
      {gameState.isGameWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-emerald-500/60 rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/50 flex items-center justify-center mb-3">
              <Trophy size={36} className="animate-bounce" />
            </div>

            <h2 className="text-2xl font-black text-white">Victory!</h2>
            <p className="text-xs text-emerald-400 font-semibold mb-4">You solved Klondike Solitaire!</p>

            <div className="w-full grid grid-cols-2 gap-2 mb-5 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-400 block text-[10px]">TIME</span>
                <span className="font-bold text-cyan-300 text-sm">{formatTimer(gameState.timer)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                <span className="text-slate-400 block text-[10px]">MOVES</span>
                <span className="font-bold text-emerald-400 text-sm">{gameState.moves}</span>
              </div>
            </div>

            <div className="w-full space-y-2">
              <button
                type="button"
                onClick={() => handleNewGame(gameState.drawCount)}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play size={16} />
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
