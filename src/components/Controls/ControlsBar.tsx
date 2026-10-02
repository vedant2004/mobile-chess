import React, { useState } from 'react';
import { RotateCcw, Undo2, ArrowUpDown, Flag, ScrollText } from 'lucide-react';

interface ControlsBarProps {
  canUndo: boolean;
  onUndo: () => void;
  onRestart: () => void;
  onFlipBoard: () => void;
  onResign: () => void;
  onToggleHistory?: () => void;
  showHistory?: boolean;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  canUndo,
  onUndo,
  onRestart,
  onFlipBoard,
  onResign,
  onToggleHistory,
  showHistory,
}) => {
  const [showResignConfirm, setShowResignConfirm] = useState(false);

  const handleResignClick = () => {
    if (showResignConfirm) {
      onResign();
      setShowResignConfirm(false);
    } else {
      setShowResignConfirm(true);
      setTimeout(() => setShowResignConfirm(false), 4000);
    }
  };

  return (
    <div className="w-full max-w-[460px] md:max-w-[540px] flex items-center justify-between gap-1.5 md:gap-2 px-2 py-2 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg">
      {/* Undo */}
      <button
        type="button"
        disabled={!canUndo}
        onClick={onUndo}
        className="flex-1 py-2 px-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-35 disabled:pointer-events-none text-slate-200 font-medium text-xs flex flex-col md:flex-row items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
        title="Undo Move"
      >
        <Undo2 size={16} />
        <span>Undo</span>
      </button>

      {/* Restart */}
      <button
        type="button"
        onClick={onRestart}
        className="flex-1 py-2 px-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-medium text-xs flex flex-col md:flex-row items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
        title="Restart Current Game"
      >
        <RotateCcw size={16} />
        <span>Restart</span>
      </button>

      {/* Flip Board */}
      <button
        type="button"
        onClick={onFlipBoard}
        className="flex-1 py-2 px-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-medium text-xs flex flex-col md:flex-row items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer"
        title="Flip Board View"
      >
        <ArrowUpDown size={16} />
        <span>Flip</span>
      </button>

      {/* Resign */}
      <button
        type="button"
        onClick={handleResignClick}
        className={`flex-1 py-2 px-1.5 rounded-xl font-medium text-xs flex flex-col md:flex-row items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
          showResignConfirm
            ? 'bg-rose-600 text-white animate-pulse'
            : 'bg-slate-800/80 hover:bg-rose-950/40 text-rose-300 border border-transparent hover:border-rose-800/50'
        }`}
        title={showResignConfirm ? 'Click again to confirm resignation' : 'Resign Game'}
      >
        <Flag size={16} />
        <span>{showResignConfirm ? 'Confirm?' : 'Resign'}</span>
      </button>

      {/* Mobile Move History Toggle */}
      {onToggleHistory && (
        <button
          type="button"
          onClick={onToggleHistory}
          className={`md:hidden flex-1 py-2 px-1.5 rounded-xl font-medium text-xs flex flex-col items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer ${
            showHistory
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800/80 text-slate-200 hover:bg-slate-700'
          }`}
          title="Toggle Move History"
        >
          <ScrollText size={16} />
          <span>Moves</span>
        </button>
      )}
    </div>
  );
};
