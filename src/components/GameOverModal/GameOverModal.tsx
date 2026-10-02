import React from 'react';
import type { GameResult, PieceColor, GameMode } from '../../types/chess';
import { Trophy, RotateCcw, PlusCircle, Eye, ShieldAlert, Sparkles } from 'lucide-react';

interface GameOverModalProps {
  result: GameResult;
  gameMode: GameMode;
  playerColor: PieceColor;
  onRematch: () => void;
  onNewGame: () => void;
  onReviewBoard: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  result,
  gameMode,
  playerColor,
  onRematch,
  onNewGame,
  onReviewBoard,
}) => {
  const isDraw = result.winner === 'draw';
  const isWin = !isDraw && (gameMode === 'pvp' || result.winner === playerColor);
  const isLoss = !isDraw && !isWin;

  let title = 'Game Over';
  let badgeColor = 'bg-slate-800 text-slate-300';

  if (isDraw) {
    title = 'Draw!';
    badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-800';
  } else if (gameMode === 'pvp') {
    title = `${result.winner === 'w' ? 'White' : 'Black'} Won!`;
    badgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
  } else if (isWin) {
    title = 'Victory!';
    badgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
  } else if (isLoss) {
    title = 'Defeat';
    badgeColor = 'bg-rose-950/80 text-rose-300 border-rose-800';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl text-center flex flex-col items-center">
        {/* Header Icon */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl border ${
            isWin
              ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/50'
              : isDraw
              ? 'bg-amber-600/20 text-amber-400 border-amber-500/50'
              : 'bg-rose-600/20 text-rose-400 border-rose-500/50'
          }`}
        >
          {isWin ? (
            <Trophy size={36} className="animate-bounce" />
          ) : isDraw ? (
            <Sparkles size={34} />
          ) : (
            <ShieldAlert size={34} />
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">
          {title}
        </h2>

        {/* Reason Badge */}
        <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${badgeColor}`}>
          {result.message}
        </div>

        {/* Actions */}
        <div className="w-full mt-6 space-y-2.5">
          <button
            onClick={onRematch}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw size={18} />
            Rematch
          </button>

          <button
            onClick={onNewGame}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <PlusCircle size={18} />
            New Match Options
          </button>

          <button
            onClick={onReviewBoard}
            className="w-full py-2 px-4 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Eye size={15} />
            Review Board
          </button>
        </div>
      </div>
    </div>
  );
};
