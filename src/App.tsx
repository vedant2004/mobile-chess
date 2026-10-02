import { useState, useEffect } from 'react';
import { useChessGame } from './hooks/useChessGame';
import { Navbar } from './components/Navbar/Navbar';
import { Chessboard } from './components/Chessboard/Chessboard';
import { PlayerInfo } from './components/PlayerInfo/PlayerInfo';
import { ControlsBar } from './components/Controls/ControlsBar';
import { MoveHistory } from './components/MoveHistory/MoveHistory';
import { PromotionModal } from './components/PromotionModal/PromotionModal';
import { GameOverModal } from './components/GameOverModal/GameOverModal';
import { SettingsModal } from './components/SettingsModal/SettingsModal';
import { TIME_CONTROLS } from './logic/constants';
import './App.css';

export function App() {
  const {
    fen,
    turn,
    selectedSquare,
    legalMoves,
    lastMove,
    checkSquare,
    isGameOver,
    gameResult,
    moveHistory,
    historyIndex,
    isAIThinking,
    pendingPromotion,
    clocks,
    settings,
    capturedPieces,
    materialAdvantage,
    handleSquareClick,
    handlePieceDrop,
    handlePromotionSelect,
    cancelPromotion,
    undoMove,
    restartGame,
    startNewGame,
    resignGame,
    navigateHistory,
    updateSettings,
  } = useChessGame();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(true);
  const [boardFlipped, setBoardFlipped] = useState(false);
  const [showMobileHistory, setShowMobileHistory] = useState(false);

  // Sync board flip with player color in AI mode or autoFlip
  useEffect(() => {
    if (settings.gameMode === 'ai') {
      setBoardFlipped(settings.playerColor === 'b');
    }
  }, [settings.gameMode, settings.playerColor]);

  // When game finishes, show modal
  useEffect(() => {
    if (isGameOver && gameResult) {
      setShowGameOverModal(true);
    }
  }, [isGameOver, gameResult]);

  // Sync HTML theme class/attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Names and AI flags
  const tcConfig = TIME_CONTROLS.find((tc) => tc.id === settings.timeControlId) || TIME_CONTROLS[0];
  const hasTimer = tcConfig.minutes > 0;

  // Determine top and bottom players based on boardFlipped
  // If not flipped: Top is Black ('b'), Bottom is White ('w')
  // If flipped: Top is White ('w'), Bottom is Black ('b')
  const topColor = boardFlipped ? 'w' : 'b';
  const bottomColor = boardFlipped ? 'b' : 'w';

  const isTopAI = settings.gameMode === 'ai' && settings.playerColor !== topColor;
  const isBottomAI = settings.gameMode === 'ai' && settings.playerColor !== bottomColor;

  const topName = isTopAI
    ? `Grandmaster AI (${settings.aiDifficulty})`
    : settings.gameMode === 'pvp'
    ? topColor === 'w'
      ? 'White (Player 1)'
      : 'Black (Player 2)'
    : 'You';

  const bottomName = isBottomAI
    ? `Grandmaster AI (${settings.aiDifficulty})`
    : settings.gameMode === 'pvp'
    ? bottomColor === 'w'
      ? 'White (Player 1)'
      : 'Black (Player 2)'
    : 'You';

  return (
    <div className={`chess-app min-h-screen flex flex-col ${settings.theme === 'dark' ? 'dark' : ''}`}>
      {/* Top Navigation */}
      <Navbar
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewGame={() => setIsSettingsOpen(true)}
        onToggleSound={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
        onToggleTheme={() =>
          updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
        }
      />

      {/* Main Game Arena */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-2 md:px-6 py-2 md:py-6 flex flex-col items-center justify-center">
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 lg:gap-8">
          {/* Left Column: Game Board & Players */}
          <div className="w-full max-w-[460px] md:max-w-[540px] flex flex-col items-center gap-2">
            {/* Top Player Info */}
            <PlayerInfo
              color={topColor}
              name={topName}
              isAI={isTopAI}
              aiDifficulty={settings.aiDifficulty}
              isCurrentTurn={turn === topColor && !isGameOver}
              isAIThinking={isTopAI && isAIThinking}
              timeRemainingMs={clocks[topColor]}
              hasTimer={hasTimer}
              capturedPieces={capturedPieces[topColor]}
              materialAdvantage={materialAdvantage[topColor]}
            />

            {/* Chessboard */}
            <div className="w-full flex justify-center py-1">
              <Chessboard
                fen={fen}
                isFlipped={boardFlipped}
                selectedSquare={selectedSquare}
                legalMoves={legalMoves}
                lastMove={lastMove}
                checkSquare={checkSquare}
                boardTheme={settings.boardTheme}
                showCoordinates={settings.showCoordinates}
                turn={turn}
                onSquareClick={handleSquareClick}
                onDrop={handlePieceDrop}
              />
            </div>

            {/* Bottom Player Info */}
            <PlayerInfo
              color={bottomColor}
              name={bottomName}
              isAI={isBottomAI}
              aiDifficulty={settings.aiDifficulty}
              isCurrentTurn={turn === bottomColor && !isGameOver}
              isAIThinking={isBottomAI && isAIThinking}
              timeRemainingMs={clocks[bottomColor]}
              hasTimer={hasTimer}
              capturedPieces={capturedPieces[bottomColor]}
              materialAdvantage={materialAdvantage[bottomColor]}
            />

            {/* Controls Bar */}
            <div className="w-full mt-1">
              <ControlsBar
                canUndo={moveHistory.length > 0 && !isAIThinking}
                onUndo={undoMove}
                onRestart={restartGame}
                onFlipBoard={() => setBoardFlipped((prev) => !prev)}
                onResign={() => resignGame()}
                onToggleHistory={() => setShowMobileHistory((prev) => !prev)}
                showHistory={showMobileHistory}
              />
            </div>

            {/* Mobile History View (collapsible) */}
            {showMobileHistory && (
              <div className="w-full lg:hidden mt-2 animate-in fade-in duration-200">
                <MoveHistory
                  moves={moveHistory}
                  historyIndex={historyIndex}
                  onNavigate={navigateHistory}
                />
              </div>
            )}
          </div>

          {/* Right Column: Desktop Sidebar */}
          <div className="hidden lg:flex w-80 flex-col gap-4">
            {/* Status card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg backdrop-blur-md">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Game Status
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    isGameOver
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {isGameOver ? 'Finished' : 'In Progress'}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Turn</span>
                  <span className="font-semibold capitalize flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        turn === 'w' ? 'bg-white' : 'bg-slate-900 border border-slate-600'
                      }`}
                    />
                    {turn === 'w' ? 'White to move' : 'Black to move'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Mode</span>
                  <span className="font-semibold">
                    {settings.gameMode === 'ai' ? `Vs AI (${settings.aiDifficulty})` : 'Pass & Play'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Time Control</span>
                  <span className="font-semibold">{tcConfig.name}</span>
                </div>

                {checkSquare && !isGameOver && (
                  <div className="py-1 text-center font-bold text-rose-400 animate-pulse bg-rose-950/40 rounded border border-rose-900/60">
                    Check!
                  </div>
                )}
              </div>
            </div>

            {/* Move History */}
            <MoveHistory
              moves={moveHistory}
              historyIndex={historyIndex}
              onNavigate={navigateHistory}
            />
          </div>
        </div>
      </main>

      {/* Promotion Modal */}
      {pendingPromotion && (
        <PromotionModal
          color={turn}
          onSelect={handlePromotionSelect}
          onCancel={cancelPromotion}
        />
      )}

      {/* Game Over Modal */}
      {isGameOver && gameResult && showGameOverModal && (
        <GameOverModal
          result={gameResult}
          gameMode={settings.gameMode}
          playerColor={settings.playerColor}
          onRematch={restartGame}
          onNewGame={() => {
            setShowGameOverModal(false);
            setIsSettingsOpen(true);
          }}
          onReviewBoard={() => setShowGameOverModal(false)}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        settings={settings}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdate={updateSettings}
        onApplyAndRestart={(newSettings) => {
          startNewGame(newSettings);
          setIsSettingsOpen(false);
        }}
      />
    </div>
  );
}

export default App;
