import React from 'react';
import type { AppSettings, GameMode, AIDifficulty, PieceColor, BoardTheme } from '../../types/chess';
import { TIME_CONTROLS, BOARD_THEMES } from '../../logic/constants';
import { X, Bot, Users, Volume2, VolumeX, Sun, Moon, Check } from 'lucide-react';

interface SettingsModalProps {
  settings: AppSettings;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (newSettings: Partial<AppSettings>) => void;
  onApplyAndRestart: (newSettings: Partial<AppSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  isOpen,
  onClose,
  onUpdate,
  onApplyAndRestart,
}) => {
  if (!isOpen) return null;

  const handleGameModeChange = (mode: GameMode) => {
    onApplyAndRestart({ gameMode: mode });
  };

  const handleDifficultyChange = (diff: AIDifficulty) => {
    onUpdate({ aiDifficulty: diff });
  };

  const handleColorChange = (col: PieceColor) => {
    onApplyAndRestart({ playerColor: col });
  };

  const handleTimeControlChange = (tcId: string) => {
    onApplyAndRestart({ timeControlId: tcId });
  };

  const handleBoardThemeChange = (thm: BoardTheme) => {
    onUpdate({ boardTheme: thm });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl p-5 md:p-6 shadow-2xl flex flex-col text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <h2 className="text-xl font-bold tracking-tight">Game Settings</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
          {/* Game Mode */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Game Mode
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleGameModeChange('ai')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                  settings.gameMode === 'ai'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Bot size={20} />
                <div className="text-left">
                  <div className="text-sm font-bold leading-tight">Vs AI</div>
                  <div className="text-[11px] opacity-70">Single player</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleGameModeChange('pvp')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                  settings.gameMode === 'pvp'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm'
                    : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <Users size={20} />
                <div className="text-left">
                  <div className="text-sm font-bold leading-tight">Pass & Play</div>
                  <div className="text-[11px] opacity-70">Local 2-Player</div>
                </div>
              </button>
            </div>
          </div>

          {/* AI Difficulty (only in AI mode) */}
          {settings.gameMode === 'ai' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                AI Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => handleDifficultyChange(level)}
                    className={`py-2 px-3 rounded-xl border capitalize font-semibold text-xs transition-all cursor-pointer ${
                      settings.aiDifficulty === level
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                        : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Player Color (in AI mode) */}
          {settings.gameMode === 'ai' && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Play As
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleColorChange('w')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border font-semibold text-xs transition-all cursor-pointer ${
                    settings.playerColor === 'w'
                      ? 'bg-white text-slate-900 border-white shadow'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white border border-slate-300" />
                  White (Moves First)
                </button>

                <button
                  type="button"
                  onClick={() => handleColorChange('b')}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border font-semibold text-xs transition-all cursor-pointer ${
                    settings.playerColor === 'b'
                      ? 'bg-slate-950 text-white border-slate-500 shadow'
                      : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-slate-950 border border-slate-600" />
                  Black
                </button>
              </div>
            </div>
          )}

          {/* Time Control */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Time Control
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TIME_CONTROLS.map((tc) => (
                <button
                  key={tc.id}
                  type="button"
                  onClick={() => handleTimeControlChange(tc.id)}
                  className={`p-2 rounded-lg border text-xs font-medium text-left transition-all cursor-pointer ${
                    settings.timeControlId === tc.id
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {tc.name}
                </button>
              ))}
            </div>
          </div>

          {/* Board Theme */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Board Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(BOARD_THEMES) as BoardTheme[]).map((themeKey) => {
                const item = BOARD_THEMES[themeKey];
                const isSelected = settings.boardTheme === themeKey;
                return (
                  <button
                    key={themeKey}
                    type="button"
                    onClick={() => handleBoardThemeChange(themeKey)}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-slate-800 text-emerald-300'
                        : 'border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="w-5 h-5 rounded overflow-hidden grid grid-cols-2 grid-rows-2 shrink-0 border border-black/30">
                      <div style={{ backgroundColor: item.lightSquare }} />
                      <div style={{ backgroundColor: item.darkSquare }} />
                      <div style={{ backgroundColor: item.darkSquare }} />
                      <div style={{ backgroundColor: item.lightSquare }} />
                    </div>
                    <span className="truncate">{item.name}</span>
                    {isSelected && <Check size={14} className="ml-auto text-emerald-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            {/* Sound */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                <span>Sound Effects</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdate({ soundEnabled: !settings.soundEnabled })}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  settings.soundEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Coordinates */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Show Coordinates</span>
              <button
                type="button"
                onClick={() => onUpdate({ showCoordinates: !settings.showCoordinates })}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  settings.showCoordinates ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.showCoordinates ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Dark / Light App Theme */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                {settings.theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                <span>Dark Theme</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdate({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  settings.theme === 'dark' ? 'bg-emerald-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    settings.theme === 'dark' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-sm text-white shadow transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
