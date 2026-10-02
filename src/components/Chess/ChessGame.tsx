import React, { useState, useEffect } from 'react';
import { useChessGame } from '../../hooks/useChessGame';
import { Chessboard } from '../Chessboard/Chessboard';
import { PlayerInfo } from '../PlayerInfo/PlayerInfo';
import { ControlsBar } from '../Controls/ControlsBar';
import { MoveHistory } from '../MoveHistory/MoveHistory';
import { PromotionModal } from '../PromotionModal/PromotionModal';
import { GameOverModal } from '../GameOverModal/GameOverModal';
import { SettingsModal } from '../SettingsModal/SettingsModal';
import { DifficultyModal } from './DifficultyModal';
import { EvaluationBar } from './EvaluationBar';
import { TIME_CONTROLS, CHESS_DIFFICULTIES } from '../../logic/constants';
import { Home, Settings, Volume2, VolumeX, Plus, SlidersHorizontal } from 'lucide-react';

interface ChessGameProps {
  onBackToHub: () => void;
}

export const ChessGame: React.FC<ChessGameProps> = ({ onBackToHub }) => {
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
    evalScore,
    drawDeclinedMessage,
    captureSquares,
    invalidSquare,
    handleSquareClick,
    handlePromotionSelect,
    cancelPromotion,
    undoMove,
    restartGame,
    startNewGame,
    resignGame,
    offerDraw,
    navigateHistory,
    updateSettings,
  } = useChessGame();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDifficultyModalOpen, setIsDifficultyModalOpen] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(true);
  const [boardFlipped, setBoardFlipped] = useState(false);
  const [showMobileHistory, setShowMobileHistory] = useState(false);

  // Sync board flip with player color in AI mode
  useEffect(() => {
    if (settings.gameMode === 'ai') {
      setBoardFlipped(settings.playerColor === 'b');
    }
  }, [settings.gameMode, settings.playerColor]);

  // When game finishes, show game over modal
  useEffect(() => {
    if (isGameOver && gameResult) {
      setShowGameOverModal(true);
    }
  }, [isGameOver, gameResult]);

  const tcConfig = TIME_CONTROLS.find((tc) => tc.id === settings.timeControlId) || TIME_CONTROLS[0];
  const diffConfig = CHESS_DIFFICULTIES.find((d) => d.id === settings.aiDifficulty) || CHESS_DIFFICULTIES[2];
  const hasTimer = tcConfig.minutes > 0;

  // Determine top and bottom players based on board flip
  const topColor = boardFlipped ? 'w' : 'b';
  const bottomColor = boardFlipped ? 'b' : 'w';

  const isTopAI = settings.gameMode === 'ai' && settings.playerColor !== topColor;
  const isBottomAI = settings.gameMode === 'ai' && settings.playerColor !== bottomColor;

  const topName = isTopAI
    ? `${diffConfig.name} AI (~${diffConfig.elo})`
    : settings.gameMode === 'pvp'
    ? topColor === 'w'
      ? 'White (Player 1)'
      : 'Black (Player 2)'
    : 'You';

  const bottomName = isBottomAI
    ? `${diffConfig.name} AI (~${diffConfig.elo})`
    : settings.gameMode === 'pvp'
    ? bottomColor === 'w'
      ? 'White (Player 1)'
      : 'Black (Player 2)'
    : 'You';

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-950 text-slate-100 select-none pb-4">
      {/* Top Header Bar */}
      <header className="w-full max-w-5xl mx-auto px-3 py-2.5 flex items-center justify-between border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2">
          {/* Back to Hub Button */}
          <button
            type="button"
            onClick={onBackToHub}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            title="Return to Game Hub"
          >
            <Home size={18} />
            <span className="hidden sm:inline text-xs font-bold">Hub</span>
          </button>

          <div>
            <h1 className="text-base md:text-lg font-black tracking-tight flex items-center gap-1.5 leading-none">
              <span className="text-emerald-400">♞</span> Chess Master
            </h1>
            <div className="flex items-center gap-1 mt-0.5">
              <button
                type="button"
                onClick={() => setIsDifficultyModalOpen(true)}
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border flex items-center gap-1 cursor-pointer transition-transform hover:scale-105 ${diffConfig.badgeClass}`}
                title="Change Difficulty"
              >
                <span>{diffConfig.name}</span>
                <span className="opacity-80 font-mono text-[9px]">(~{diffConfig.elo})</span>
                <SlidersHorizontal size={10} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={settings.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {settings.soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings size={18} />
          </button>

          <button
            type="button"
            onClick={() => setIsDifficultyModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-950/40 transition-all active:scale-95 cursor-pointer"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">New Match</span>
          </button>
        </div>
      </header>

      {/* Draw Declined Toast */}
      {drawDeclinedMessage && (
        <div className="w-full max-w-md mx-auto mt-2 px-4 py-2 rounded-xl bg-amber-950/90 border border-amber-600/80 text-amber-200 text-xs font-semibold text-center animate-in fade-in duration-150 z-40">
          {drawDeclinedMessage}
        </div>
      )}

      {/* Main Arena */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-2 md:px-6 py-2 md:py-4 flex flex-col items-center justify-center">
        <div className="w-full flex flex-col lg:flex-row items-center lg:items-start justify-center gap-3 lg:gap-6">
          {/* Live Evaluation Bar (desktop side-by-side) */}
          <EvaluationBar scoreCp={evalScore} isFlipped={boardFlipped} />

          {/* Left Column: Game Board & Players */}
          <div className="w-full max-w-[460px] md:max-w-[540px] flex flex-col items-center gap-2">
            {/* Top Player Info */}
            <PlayerInfo
              color={topColor}
              name={topName}
              isAI={isTopAI}
              aiDifficulty={diffConfig.name}
              isCurrentTurn={turn === topColor && !isGameOver}
              isAIThinking={isTopAI && isAIThinking}
              timeRemainingMs={clocks[topColor]}
              hasTimer={hasTimer}
              capturedPieces={capturedPieces[topColor]}
              materialAdvantage={materialAdvantage[topColor]}
            />

            {/* Instruction banner until first move is made */}
            {moveHistory.length === 0 && !isGameOver && (
              <div
                id="chess-instruction-banner"
                className="w-full max-w-[460px] md:max-w-[540px] px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 shadow-sm animate-pulse select-none text-center"
              >
                <span className="text-base">💡</span>
                <span>Tap a piece, then tap where you want to move</span>
              </div>
            )}

            {/* Chessboard */}
            <div className="w-full flex justify-center py-1">
              <Chessboard
                fen={fen}
                isFlipped={boardFlipped}
                selectedSquare={selectedSquare}
                legalMoves={legalMoves}
                captureSquares={captureSquares}
                invalidSquare={invalidSquare}
                lastMove={lastMove}
                checkSquare={checkSquare}
                boardTheme={settings.boardTheme}
                showCoordinates={settings.showCoordinates}
                turn={turn}
                onSquareClick={handleSquareClick}
              />
            </div>

            {/* Bottom Player Info */}
            <PlayerInfo
              color={bottomColor}
              name={bottomName}
              isAI={isBottomAI}
              aiDifficulty={diffConfig.name}
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
                onOfferDraw={offerDraw}
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
                  Match Info
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
                  <span className="text-slate-400">Difficulty</span>
                  <span className="font-bold text-emerald-400">
                    {diffConfig.name} (~{diffConfig.elo})
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
            setIsDifficultyModalOpen(true);
          }}
          onReviewBoard={() => setShowGameOverModal(false)}
        />
      )}

      {/* Pre-Match Difficulty & Setup Modal */}
      <DifficultyModal
        isOpen={isDifficultyModalOpen}
        currentDifficulty={settings.aiDifficulty}
        currentColor={settings.playerColor}
        currentTimeControlId={settings.timeControlId}
        onClose={() => setIsDifficultyModalOpen(false)}
        onStartGame={(newDiff, newColor, newTc) => {
          startNewGame({
            aiDifficulty: newDiff,
            playerColor: newColor,
            timeControlId: newTc,
          });
        }}
      />

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
};
