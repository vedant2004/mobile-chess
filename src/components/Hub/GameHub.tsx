import React, { useState } from 'react';
import type { ActiveView, GlobalSettings } from '../../types/hub';
import { GlobalSettingsModal } from './GlobalSettingsModal';
import { soundManager } from '../../logic/audio';
import {
  Gamepad2,
  Settings,
  Volume2,
  VolumeX,
  Play,
  Sparkles,
  Flame,
  ChevronRight,
} from 'lucide-react';

interface GameHubProps {
  onSelectGame: (game: ActiveView) => void;
  globalSettings: GlobalSettings;
  onUpdateSettings: (newSettings: Partial<GlobalSettings>) => void;
}

export const GameHub: React.FC<GameHubProps> = ({
  onSelectGame,
  globalSettings,
  onUpdateSettings,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleLaunch = (game: ActiveView) => {
    soundManager.playButtonClick();
    onSelectGame(game);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to reset all game statistics and high scores?')) {
      localStorage.clear();
      soundManager.playButtonClick();
      alert('All game data has been reset.');
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-950 text-slate-100 select-none pb-12 relative overflow-x-hidden">
      {/* Ambient background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Hub Header */}
      <header className="w-full max-w-5xl mx-auto px-4 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/40">
            <Gamepad2 size={22} />
          </div>
          <div>
            <h1 className="font-black text-lg md:text-xl tracking-tight leading-none bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              GAME HUB
            </h1>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
              Mobile Arcade Collection
            </span>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onUpdateSettings({ soundEnabled: !globalSettings.soundEnabled })}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title={globalSettings.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {globalSettings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Hub Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Hub Body */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 md:py-10 flex flex-col items-center">
        {/* Title Banner */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3 shadow-sm">
            <Sparkles size={14} /> 3 Complete Mobile Games
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2">
            Select Your Game
          </h2>
          <p className="text-sm md:text-base text-slate-400 max-w-md mx-auto">
            Production-quality, touch-optimized gaming for mobile and desktop. Choose a game below to begin.
          </p>
        </div>

        {/* 3 Game Cards Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {/* CARD 1: CHESS */}
          <div className="group relative rounded-3xl p-5 md:p-6 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-emerald-900/40 hover:border-emerald-500/70 shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />

            <div>
              {/* Badge & Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-3xl shadow-lg shadow-emerald-950/50 group-hover:scale-110 transition-transform">
                  ♞
                </div>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  8 AI Levels
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl font-black text-white tracking-tight mb-2 flex items-center gap-1.5">
                Chess Master
              </h3>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed mb-4">
                Full legal FIDE chess rules, Stockfish & Minimax engines from Beginner to LEGEND mode, clocks, and pass & play.
              </p>

              {/* Feature Chips */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                  Stockfish AI
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                  Chess Clocks
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                  Move History
                </span>
              </div>
            </div>

            {/* Launch Button */}
            <button
              type="button"
              onClick={() => handleLaunch('chess')}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 group-hover:shadow-emerald-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Play size={18} className="fill-white" />
              <span>PLAY CHESS</span>
              <ChevronRight size={16} className="ml-auto opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* CARD 2: SOLITAIRE */}
          <div className="group relative rounded-3xl p-5 md:p-6 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-indigo-900/40 hover:border-indigo-500/70 shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />

            <div>
              {/* Badge & Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-3xl shadow-lg shadow-indigo-950/50 group-hover:scale-110 transition-transform text-rose-500 font-serif">
                  ♥
                </div>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/60">
                  Draw 1 & 3
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl font-black text-white tracking-tight mb-2 flex items-center gap-1.5">
                Klondike Solitaire
              </h3>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed mb-4">
                Classic 52-card patience with smart tap-to-move, drag-and-drop, full undo history, and auto-complete victory finish.
              </p>

              {/* Feature Chips */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                  Smart Tap Moves
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                  Auto Complete
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                  Card Cascades
                </span>
              </div>
            </div>

            {/* Launch Button */}
            <button
              type="button"
              onClick={() => handleLaunch('solitaire')}
              className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-indigo-950/50 flex items-center justify-center gap-2 group-hover:shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Play size={18} className="fill-white" />
              <span>PLAY SOLITAIRE</span>
              <ChevronRight size={16} className="ml-auto opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* CARD 3: BALLOON POP */}
          <div className="group relative rounded-3xl p-5 md:p-6 bg-gradient-to-b from-slate-900/90 to-slate-950 border border-rose-900/40 hover:border-rose-500/70 shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />

            <div>
              {/* Badge & Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-3xl shadow-lg shadow-rose-950/50 group-hover:scale-110 transition-transform">
                  🎈
                </div>
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-800/60 flex items-center gap-1">
                  <Flame size={12} /> Combos
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl font-black text-white tracking-tight mb-2 flex items-center gap-1.5">
                Balloon Pop
              </h3>
              <p className="text-xs md:text-sm text-slate-400 leading-relaxed mb-4">
                Fast-paced mobile reflex arcade with dynamic combos, golden bonus targets, skull bombs, and rainbow 2x frenzy mode.
              </p>

              {/* Feature Chips */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                  3 Modes & 4 Diffs
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                  Particle Pops
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-medium">
                  High Scores
                </span>
              </div>
            </div>

            {/* Launch Button */}
            <button
              type="button"
              onClick={() => handleLaunch('balloon')}
              className="w-full py-3.5 px-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 group-hover:shadow-rose-600/30 transition-all active:scale-95 cursor-pointer"
            >
              <Play size={18} className="fill-white" />
              <span>PLAY BALLOON POP</span>
              <ChevronRight size={16} className="ml-auto opacity-70 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </main>

      {/* Global Settings Modal */}
      <GlobalSettingsModal
        isOpen={isSettingsOpen}
        settings={globalSettings}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={onUpdateSettings}
        onResetStats={handleResetData}
      />
    </div>
  );
};
