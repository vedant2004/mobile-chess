import React from 'react';
import type { AppSettings } from '../../types/chess';
import { Settings, Volume2, VolumeX, Sun, Moon, Plus } from 'lucide-react';

interface NavbarProps {
  settings: AppSettings;
  onOpenSettings: () => void;
  onNewGame: () => void;
  onToggleSound: () => void;
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onOpenSettings,
  onNewGame,
  onToggleSound,
  onToggleTheme,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
      {/* Brand */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-emerald-950/40">
          ♞
        </div>
        <div>
          <h1 className="font-extrabold text-base md:text-lg tracking-tight text-white flex items-center gap-1.5 leading-none">
            Chess Master
          </h1>
          <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
            {settings.gameMode === 'ai' ? `Vs AI • ${settings.aiDifficulty}` : 'Pass & Play'}
          </span>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1.5 md:gap-2">
        <button
          type="button"
          onClick={onToggleSound}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          title={settings.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          aria-label="Toggle Sound"
        >
          {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          title={settings.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          aria-label="Toggle Theme"
        >
          {settings.theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          title="Game Settings"
          aria-label="Open Settings"
        >
          <Settings size={18} />
        </button>

        <button
          type="button"
          onClick={onNewGame}
          className="ml-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs md:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-950/30 transition-all active:scale-95 cursor-pointer"
        >
          <Plus size={16} />
          <span>New Game</span>
        </button>
      </div>
    </header>
  );
};
