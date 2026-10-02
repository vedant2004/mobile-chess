import React from 'react';
import type { GlobalSettings } from '../../types/hub';
import { X, Volume2, VolumeX, Sun, Moon, Trash2 } from 'lucide-react';

interface GlobalSettingsModalProps {
  isOpen: boolean;
  settings: GlobalSettings;
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<GlobalSettings>) => void;
  onResetStats: () => void;
}

export const GlobalSettingsModal: React.FC<GlobalSettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
  onResetStats,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-xl font-black tracking-tight">Hub Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Settings Body */}
        <div className="py-4 space-y-5">
          {/* Master Sound Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {settings.soundEnabled ? (
                <Volume2 className="text-emerald-400" size={20} />
              ) : (
                <VolumeX className="text-slate-500" size={20} />
              )}
              <div>
                <div className="text-sm font-bold">Sound Effects</div>
                <div className="text-[11px] text-slate-400">Synthesized game audio</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                settings.soundEnabled ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Master Volume Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Master Volume
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {Math.round(settings.masterVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.masterVolume}
              onChange={(e) => onUpdateSettings({ masterVolume: parseFloat(e.target.value) })}
              className="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer h-2"
            />
          </div>

          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {settings.theme === 'dark' ? (
                <Moon className="text-indigo-400" size={20} />
              ) : (
                <Sun className="text-amber-400" size={20} />
              )}
              <div>
                <div className="text-sm font-bold">Dark Gaming Mode</div>
                <div className="text-[11px] text-slate-400">Deep midnight aesthetic</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
              }
              className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                settings.theme === 'dark' ? 'bg-emerald-600' : 'bg-slate-700'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  settings.theme === 'dark' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Reset Stats */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onResetStats}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-800/60 text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 size={15} />
              Reset All Saved High Scores & Stats
            </button>
          </div>
        </div>

        {/* Done */}
        <div className="pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
