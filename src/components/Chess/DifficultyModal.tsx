import React, { useState } from 'react';
import type { AIDifficulty, PieceColor, TimeControl } from '../../types/chess';
import { CHESS_DIFFICULTIES, TIME_CONTROLS } from '../../logic/constants';
import { X, Play, Shuffle, Clock } from 'lucide-react';

interface DifficultyModalProps {
  isOpen: boolean;
  currentDifficulty: AIDifficulty;
  currentColor: PieceColor;
  currentTimeControlId: string;
  onClose: () => void;
  onStartGame: (difficulty: AIDifficulty, color: PieceColor, timeControlId: string) => void;
}

export const DifficultyModal: React.FC<DifficultyModalProps> = ({
  isOpen,
  currentDifficulty,
  currentColor,
  currentTimeControlId,
  onClose,
  onStartGame,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<AIDifficulty>(currentDifficulty);
  const [selectedColor, setSelectedColor] = useState<PieceColor | 'random'>(currentColor);
  const [selectedTimeControl, setSelectedTimeControl] = useState<string>(currentTimeControlId);

  if (!isOpen) return null;

  const handleStart = () => {
    let finalColor: PieceColor = currentColor;
    if (selectedColor === 'random') {
      finalColor = Math.random() < 0.5 ? 'w' : 'b';
    } else {
      finalColor = selectedColor;
    }
    onStartGame(selectedDifficulty, finalColor, selectedTimeControl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 md:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl p-4 md:p-6 shadow-2xl flex flex-col text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Select Chess Difficulty</h2>
            <p className="text-xs text-slate-400">Choose your opponent strength and match settings</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Difficulty Grid */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              AI Difficulty Level (8 Tiers)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {CHESS_DIFFICULTIES.map((diff) => {
                const isSelected = selectedDifficulty === diff.id;
                return (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff.id)}
                    className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-950/90 border-emerald-500 shadow-md shadow-emerald-950/50 ring-1 ring-emerald-500'
                        : 'bg-slate-800/60 border-slate-700/80 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`font-bold text-sm ${isSelected ? 'text-emerald-300' : 'text-slate-100'}`}>
                        {diff.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-900/80 text-slate-300 border border-slate-700">
                        ~{diff.elo} Elo
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-400 mb-0.5">
                      "{diff.tagline}"
                    </div>
                    <div className="text-[10px] text-slate-400 leading-tight">
                      {diff.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Play As
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setSelectedColor('w')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedColor === 'w'
                    ? 'bg-white text-slate-900 border-white shadow'
                    : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-white border border-slate-300 shrink-0" />
                <span>White</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedColor('b')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedColor === 'b'
                    ? 'bg-slate-950 text-white border-slate-500 shadow'
                    : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span className="w-3.5 h-3.5 rounded-full bg-slate-950 border border-slate-600 shrink-0" />
                <span>Black</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedColor('random')}
                className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  selectedColor === 'random'
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                    : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Shuffle size={14} />
                <span>Random</span>
              </button>
            </div>
          </div>

          {/* Time Control */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Clock size={14} />
              <span>Time Control</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
              {TIME_CONTROLS.map((tc: TimeControl) => {
                const isSelected = selectedTimeControl === tc.id;
                return (
                  <button
                    key={tc.id}
                    type="button"
                    onClick={() => setSelectedTimeControl(tc.id)}
                    className={`p-2 rounded-lg border text-xs font-medium text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {tc.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStart}
            className="flex-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Play size={16} />
            Start Match
          </button>
        </div>
      </div>
    </div>
  );
};
