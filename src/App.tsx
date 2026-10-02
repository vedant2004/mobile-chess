import { useState, useEffect } from 'react';
import type { ActiveView, GlobalSettings } from './types/hub';
import { GameHub } from './components/Hub/GameHub';
import { ChessGame } from './components/Chess/ChessGame';
import { SolitaireGame } from './components/Solitaire/SolitaireGame';
import { BalloonGame } from './components/BalloonPop/BalloonGame';
import { soundManager } from './logic/audio';
import './App.css';

const GLOBAL_SETTINGS_KEY = 'playhub_global_settings_v1';

export function App() {
  const [currentView, setCurrentView] = useState<ActiveView>('hub');

  // Global settings
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(() => {
    try {
      const saved = localStorage.getItem(GLOBAL_SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      soundEnabled: true,
      masterVolume: 0.8,
      theme: 'dark',
    };
  });

  // Sync sound manager
  useEffect(() => {
    soundManager.setEnabled(globalSettings.soundEnabled);
    soundManager.setVolume(globalSettings.masterVolume);
  }, [globalSettings.soundEnabled, globalSettings.masterVolume]);

  // Persist global settings
  useEffect(() => {
    try {
      localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(globalSettings));
    } catch {}
  }, [globalSettings]);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', globalSettings.theme);
    if (globalSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [globalSettings.theme]);

  const updateGlobalSettings = (newSettings: Partial<GlobalSettings>) => {
    setGlobalSettings((prev) => ({ ...prev, ...newSettings }));
  };

  return (
    <div className={`app-root min-h-screen bg-slate-950 text-slate-100 ${globalSettings.theme === 'dark' ? 'dark' : ''}`}>
      {currentView === 'hub' && (
        <GameHub
          onSelectGame={(game) => setCurrentView(game)}
          globalSettings={globalSettings}
          onUpdateSettings={updateGlobalSettings}
        />
      )}

      {currentView === 'chess' && (
        <ChessGame onBackToHub={() => setCurrentView('hub')} />
      )}

      {currentView === 'solitaire' && (
        <SolitaireGame onBackToHub={() => setCurrentView('hub')} />
      )}

      {currentView === 'balloon' && (
        <BalloonGame onBackToHub={() => setCurrentView('hub')} />
      )}
    </div>
  );
}

export default App;
