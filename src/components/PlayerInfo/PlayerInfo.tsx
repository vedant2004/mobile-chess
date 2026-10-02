import React from 'react';
import type { PieceColor, PieceType } from '../../types/chess';
import { ChessPiece } from '../pieces/PieceIcons';
import { Bot, User, Clock, Loader2 } from 'lucide-react';

interface PlayerInfoProps {
  color: PieceColor;
  name: string;
  isAI: boolean;
  aiDifficulty?: string;
  isCurrentTurn: boolean;
  isAIThinking?: boolean;
  timeRemainingMs: number;
  hasTimer: boolean;
  capturedPieces: PieceType[];
  materialAdvantage: number;
}

function formatTime(ms: number): string {
  if (ms <= 0) return '00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (ms < 10000) {
    const tenths = Math.floor((ms % 1000) / 100);
    return `${seconds}.${tenths}`;
  }

  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export const PlayerInfo: React.FC<PlayerInfoProps> = ({
  color,
  name,
  isAI,
  aiDifficulty,
  isCurrentTurn,
  isAIThinking,
  timeRemainingMs,
  hasTimer,
  capturedPieces,
  materialAdvantage,
}) => {
  const isWhite = color === 'w';
  const isLowTime = hasTimer && timeRemainingMs < 20000 && timeRemainingMs > 0;

  // Group captured pieces for tidy display
  const pieceOrder: PieceType[] = ['q', 'r', 'b', 'n', 'p'];
  const sortedCaptures = [...capturedPieces].sort(
    (a, b) => pieceOrder.indexOf(a) - pieceOrder.indexOf(b)
  );

  return (
    <div
      className={`w-full max-w-[460px] md:max-w-[540px] px-3.5 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between gap-3 ${
        isCurrentTurn
          ? 'bg-slate-800/90 dark:bg-slate-800/95 border-2 border-emerald-500/70 shadow-lg shadow-emerald-950/20'
          : 'bg-slate-800/50 dark:bg-slate-900/60 border border-slate-700/40'
      }`}
    >
      {/* Left: Avatar & Name & Captures */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Avatar */}
        <div
          className={`relative w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm ${
            isWhite ? 'bg-amber-100 text-slate-800' : 'bg-slate-950 text-slate-100 border border-slate-700'
          }`}
        >
          {isAI ? (
            <Bot size={20} className={isCurrentTurn && isAIThinking ? 'animate-pulse text-emerald-400' : ''} />
          ) : (
            <User size={20} />
          )}

          {/* Color pill indicator */}
          <span
            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
              isWhite ? 'bg-white' : 'bg-slate-900'
            }`}
          />
        </div>

        {/* Info & Captures */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-sm truncate text-slate-100">
              {name}
            </span>
            {isAI && aiDifficulty && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider bg-emerald-950/70 text-emerald-400 border border-emerald-800/60">
                {aiDifficulty}
              </span>
            )}
            {isAIThinking && (
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <Loader2 size={12} className="animate-spin" />
                Thinking...
              </span>
            )}
          </div>

          {/* Captured Pieces list & Material difference */}
          <div className="flex items-center gap-1 mt-0.5 flex-wrap min-h-[20px]">
            {sortedCaptures.map((p, idx) => (
              <div key={idx} className="w-4 h-4 shrink-0 -mr-1.5">
                {/* Captured piece is the opposite color of current player */}
                <ChessPiece type={p} color={isWhite ? 'b' : 'w'} size={16} />
              </div>
            ))}
            {materialAdvantage > 0 && (
              <span className="text-[11px] font-bold text-emerald-400 ml-2">
                +{materialAdvantage}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Digital Chess Clock */}
      {hasTimer ? (
        <div
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-sm md:text-base shrink-0 transition-colors ${
            isLowTime
              ? 'bg-rose-950/90 text-rose-300 border border-rose-600 animate-pulse'
              : isCurrentTurn
              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/70'
              : 'bg-slate-900/80 text-slate-400 border border-slate-800'
          }`}
        >
          <Clock size={14} className={isCurrentTurn ? 'text-emerald-400' : 'text-slate-500'} />
          <span>{formatTime(timeRemainingMs)}</span>
        </div>
      ) : (
        <div className="text-xs text-slate-500 font-medium px-2 py-1 bg-slate-900/60 rounded">
          Casual
        </div>
      )}
    </div>
  );
};
