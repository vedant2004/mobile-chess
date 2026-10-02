import { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, type Square } from 'chess.js';
import type {
  AppSettings,
  GameResult,
  MoveRecord,
  PieceColor,
  PieceType,
} from '../types/chess';
import { DEFAULT_SETTINGS, PIECE_VALUES, TIME_CONTROLS } from '../logic/constants';
import { soundManager } from '../logic/audio';
import { computeAIMove, evaluateBoard } from '../logic/ai';
import confetti from 'canvas-confetti';

const SETTINGS_STORAGE_KEY = 'grandmaster_chess_settings_v1';

export function useChessGame() {
  // Load settings from localStorage
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  });

  // Sound manager sync
  useEffect(() => {
    soundManager.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore
    }
  }, [settings]);

  // Primary Chess.js instance
  const chessRef = useRef<Chess>(new Chess());

  // Game state
  const [fen, setFen] = useState<string>(chessRef.current.fen());
  const [turn, setTurn] = useState<PieceColor>('w');
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Square; to: Square } | null>(null);
  const [inCheck, setInCheck] = useState<boolean>(false);
  const [checkSquare, setCheckSquare] = useState<Square | null>(null);
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1); // -1 = current live game
  const [isAIThinking, setIsAIThinking] = useState<boolean>(false);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [drawDeclinedMessage, setDrawDeclinedMessage] = useState<string | null>(null);

  // Clocks
  const getTimeControlConfig = useCallback(() => {
    return TIME_CONTROLS.find((tc) => tc.id === settings.timeControlId) || TIME_CONTROLS[0];
  }, [settings.timeControlId]);

  const [clocks, setClocks] = useState<{ w: number; b: number }>(() => {
    const tc = TIME_CONTROLS.find((t) => t.id === DEFAULT_SETTINGS.timeControlId) || TIME_CONTROLS[0];
    return { w: tc.minutes * 60 * 1000, b: tc.minutes * 60 * 1000 };
  });

  // Update clocks when time control changes
  useEffect(() => {
    const tc = getTimeControlConfig();
    const ms = tc.minutes * 60 * 1000;
    setClocks({ w: ms, b: ms });
  }, [getTimeControlConfig]);

  // Find king square for check highlighting
  const findKingSquare = useCallback((color: PieceColor): Square | null => {
    const board = chessRef.current.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === color) {
          const file = String.fromCharCode(97 + c);
          const rank = 8 - r;
          return `${file}${rank}` as Square;
        }
      }
    }
    return null;
  }, []);

  // Update check and game over status
  const evaluateGameEnd = useCallback(
    (reasonOverride?: 'timeout' | 'resignation' | 'agreement', resignedPlayer?: PieceColor): GameResult | null => {
      const chess = chessRef.current;

      if (reasonOverride === 'timeout') {
        const winner = turn === 'w' ? 'b' : 'w';
        const res: GameResult = {
          winner,
          reason: 'timeout',
          message: `${winner === 'w' ? 'White' : 'Black'} won on time!`,
        };
        setGameResult(res);
        soundManager.playGameEnd(settings.gameMode === 'pvp' || winner === settings.playerColor);
        return res;
      }

      if (reasonOverride === 'resignation' && resignedPlayer) {
        const winner = resignedPlayer === 'w' ? 'b' : 'w';
        const res: GameResult = {
          winner,
          reason: 'resignation',
          message: `${resignedPlayer === 'w' ? 'White' : 'Black'} resigned.`,
        };
        setGameResult(res);
        soundManager.playGameEnd(winner === settings.playerColor);
        return res;
      }

      if (reasonOverride === 'agreement') {
        const res: GameResult = {
          winner: 'draw',
          reason: 'agreement',
          message: 'Game drawn by mutual agreement.',
        };
        setGameResult(res);
        soundManager.playGameEnd(false);
        return res;
      }

      if (chess.isCheckmate()) {
        const winner = chess.turn() === 'w' ? 'b' : 'w';
        const res: GameResult = {
          winner,
          reason: 'checkmate',
          message: `Checkmate! ${winner === 'w' ? 'White' : 'Black'} wins!`,
        };
        setGameResult(res);
        const playerWon = settings.gameMode === 'pvp' || winner === settings.playerColor;
        soundManager.playGameEnd(playerWon);
        if (playerWon) {
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          } catch {
            // Ignore confetti errors
          }
        }
        return res;
      }

      if (chess.isStalemate()) {
        const res: GameResult = {
          winner: 'draw',
          reason: 'stalemate',
          message: 'Game drawn by Stalemate.',
        };
        setGameResult(res);
        soundManager.playGameEnd(false);
        return res;
      }

      if (chess.isThreefoldRepetition()) {
        const res: GameResult = {
          winner: 'draw',
          reason: 'threefold_repetition',
          message: 'Game drawn by Threefold Repetition.',
        };
        setGameResult(res);
        soundManager.playGameEnd(false);
        return res;
      }

      if (chess.isInsufficientMaterial()) {
        const res: GameResult = {
          winner: 'draw',
          reason: 'insufficient_material',
          message: 'Game drawn by Insufficient Material.',
        };
        setGameResult(res);
        soundManager.playGameEnd(false);
        return res;
      }

      if (chess.isDraw()) {
        const res: GameResult = {
          winner: 'draw',
          reason: 'fifty_moves',
          message: 'Game drawn by 50-move rule.',
        };
        setGameResult(res);
        soundManager.playGameEnd(false);
        return res;
      }

      return null;
    },
    [settings.gameMode, settings.playerColor, turn]
  );

  // Sync internal board representation
  const syncState = useCallback(
    (lastMoveDone?: { from: Square; to: Square }) => {
      const chess = chessRef.current;
      setFen(chess.fen());
      const currentTurn = chess.turn();
      setTurn(currentTurn);

      const hasCheck = chess.inCheck();
      setInCheck(hasCheck);
      setCheckSquare(hasCheck ? findKingSquare(currentTurn) : null);

      if (lastMoveDone) {
        setLastMove(lastMoveDone);
      }

      evaluateGameEnd();
    },
    [evaluateGameEnd, findKingSquare]
  );

  // Execute a move object
  const executeMove = useCallback(
    (
      moveInput: { from: Square; to: Square; promotion?: string },
      isUndoRedo: boolean = false
    ): boolean => {
      const chess = chessRef.current;
      const fenBefore = chess.fen();

      try {
        const moveResult = chess.move(moveInput);
        if (!moveResult) return false;

        const fenAfter = chess.fen();

        // Audio feedback
        if (!isUndoRedo) {
          if (chess.inCheck()) {
            soundManager.playCheck();
          } else if (moveResult.captured) {
            soundManager.playCapture();
          } else if (moveResult.flags.includes('k') || moveResult.flags.includes('q')) {
            soundManager.playCastle();
          } else {
            soundManager.playMove();
          }
        }

        // Add increment to the player who just moved
        const tc = getTimeControlConfig();
        if (tc.increment > 0 && !isUndoRedo) {
          const movedColor = moveResult.color;
          setClocks((prev) => ({
            ...prev,
            [movedColor]: prev[movedColor] + tc.increment * 1000,
          }));
        }

        // Add to history
        const newRecord: MoveRecord = {
          san: moveResult.san,
          from: moveResult.from as Square,
          to: moveResult.to as Square,
          piece: moveResult.piece as PieceType,
          color: moveResult.color as PieceColor,
          captured: moveResult.captured as PieceType | undefined,
          promotion: moveResult.promotion as PieceType | undefined,
          fenBefore,
          fenAfter,
        };

        setMoveHistory((prev) => [...prev, newRecord]);
        setHistoryIndex(-1); // Live position
        setSelectedSquare(null);
        setLegalMoves([]);
        setPendingPromotion(null);

        syncState({ from: moveResult.from as Square, to: moveResult.to as Square });
        return true;
      } catch {
        return false;
      }
    },
    [getTimeControlConfig, syncState]
  );

  // Handle square tap/click
  const handleSquareClick = useCallback(
    (square: Square) => {
      if (gameResult) return;
      if (historyIndex !== -1) return; // In history review mode
      if (settings.gameMode === 'ai' && turn !== settings.playerColor) return; // AI's turn
      if (isAIThinking) return;

      const chess = chessRef.current;
      const clickedPiece = chess.get(square);

      // If a square is already selected
      if (selectedSquare) {
        // If clicking the same square, deselect
        if (selectedSquare === square) {
          setSelectedSquare(null);
          setLegalMoves([]);
          return;
        }

        // If clicking another friendly piece, switch selection
        if (clickedPiece && clickedPiece.color === turn) {
          setSelectedSquare(square);
          const moves = chess.moves({ square, verbose: true });
          setLegalMoves(moves.map((m) => m.to as Square));
          return;
        }

        // If clicked square is a legal move
        if (legalMoves.includes(square)) {
          const selectedPiece = chess.get(selectedSquare);
          // Check for pawn promotion
          const isPawn = selectedPiece?.type === 'p';
          const isPromotionRank = square.endsWith('8') || square.endsWith('1');

          if (isPawn && isPromotionRank) {
            setPendingPromotion({ from: selectedSquare, to: square });
            return;
          }

          // Normal move
          executeMove({ from: selectedSquare, to: square });
          return;
        }

        // Clicked an invalid square, deselect
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // No square currently selected: select if piece belongs to active turn
      if (clickedPiece && clickedPiece.color === turn) {
        setSelectedSquare(square);
        const moves = chess.moves({ square, verbose: true });
        setLegalMoves(moves.map((m) => m.to as Square));
      }
    },
    [
      gameResult,
      historyIndex,
      settings.gameMode,
      settings.playerColor,
      turn,
      isAIThinking,
      selectedSquare,
      legalMoves,
      executeMove,
    ]
  );

  // Handle Drag & Drop move
  const handlePieceDrop = useCallback(
    (from: Square, to: Square): boolean => {
      if (gameResult) return false;
      if (historyIndex !== -1) return false;
      if (settings.gameMode === 'ai' && turn !== settings.playerColor) return false;
      if (isAIThinking) return false;

      const chess = chessRef.current;
      const piece = chess.get(from);
      if (!piece || piece.color !== turn) return false;

      // Check if move is legal
      const validMoves = chess.moves({ square: from, verbose: true });
      const isValid = validMoves.some((m) => m.to === to);
      if (!isValid) return false;

      // Check promotion
      if (piece.type === 'p' && (to.endsWith('8') || to.endsWith('1'))) {
        setPendingPromotion({ from, to });
        return true;
      }

      return executeMove({ from, to });
    },
    [
      gameResult,
      historyIndex,
      settings.gameMode,
      settings.playerColor,
      turn,
      isAIThinking,
      executeMove,
    ]
  );

  // Handle Promotion Selection
  const handlePromotionSelect = useCallback(
    (piece: PieceType) => {
      if (!pendingPromotion) return;
      executeMove({
        from: pendingPromotion.from,
        to: pendingPromotion.to,
        promotion: piece,
      });
      setPendingPromotion(null);
    },
    [pendingPromotion, executeMove]
  );

  // Cancel Promotion
  const cancelPromotion = useCallback(() => {
    setPendingPromotion(null);
    setSelectedSquare(null);
    setLegalMoves([]);
  }, []);

  // Undo Move
  const undoMove = useCallback(() => {
    if (isAIThinking) return;
    const chess = chessRef.current;

    if (settings.gameMode === 'ai') {
      // In AI mode, undo 2 plies if AI has already moved
      if (moveHistory.length >= 2) {
        chess.undo();
        chess.undo();
        setMoveHistory((prev) => prev.slice(0, -2));
      } else if (moveHistory.length === 1 && chess.turn() !== settings.playerColor) {
        chess.undo();
        setMoveHistory((prev) => prev.slice(0, -1));
      }
    } else {
      // In 2P mode, undo 1 ply
      if (moveHistory.length >= 1) {
        chess.undo();
        setMoveHistory((prev) => prev.slice(0, -1));
      }
    }

    setGameResult(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setHistoryIndex(-1);

    const history = chess.history({ verbose: true });
    const last = history.length > 0 ? history[history.length - 1] : null;
    syncState(last ? { from: last.from as Square, to: last.to as Square } : undefined);
    soundManager.playMove();
  }, [isAIThinking, settings.gameMode, settings.playerColor, moveHistory.length, syncState]);

  // Restart Current Game
  const restartGame = useCallback(() => {
    chessRef.current = new Chess();
    setSelectedSquare(null);
    setLegalMoves([]);
    setLastMove(null);
    setInCheck(false);
    setCheckSquare(null);
    setMoveHistory([]);
    setHistoryIndex(-1);
    setPendingPromotion(null);
    setGameResult(null);
    setIsAIThinking(false);

    const tc = getTimeControlConfig();
    const ms = tc.minutes * 60 * 1000;
    setClocks({ w: ms, b: ms });

    syncState();
  }, [getTimeControlConfig, syncState]);

  // Start New Game with optional settings update
  const startNewGame = useCallback(
    (newSettings?: Partial<AppSettings>) => {
      if (newSettings) {
        setSettings((prev) => ({ ...prev, ...newSettings }));
      }
      restartGame();
    },
    [restartGame]
  );

  // Resign
  const resignGame = useCallback(
    (playerColor?: PieceColor) => {
      const resigning = playerColor || (settings.gameMode === 'ai' ? settings.playerColor : turn);
      evaluateGameEnd('resignation', resigning);
    },
    [settings.gameMode, settings.playerColor, turn, evaluateGameEnd]
  );

  // Offer Draw
  const offerDraw = useCallback(() => {
    if (gameResult) return;
    if (settings.gameMode === 'pvp') {
      evaluateGameEnd('agreement');
      return;
    }

    const currentScore = evaluateBoard(chessRef.current);
    const aiColor = settings.playerColor === 'w' ? 'b' : 'w';
    const aiAdvantage = aiColor === 'w' ? currentScore : -currentScore;

    if (aiAdvantage > 150) {
      setDrawDeclinedMessage('AI declined the draw offer. It considers its position advantageous.');
      setTimeout(() => setDrawDeclinedMessage(null), 3500);
    } else {
      evaluateGameEnd('agreement');
    }
  }, [gameResult, settings.gameMode, settings.playerColor, evaluateGameEnd]);

  // History Navigation
  const navigateHistory = useCallback(
    (target: 'first' | 'prev' | 'next' | 'last' | number) => {
      const total = moveHistory.length;
      if (total === 0) return;

      let nextIdx = historyIndex === -1 ? total - 1 : historyIndex;

      if (typeof target === 'number') {
        nextIdx = Math.max(0, Math.min(total - 1, target));
      } else if (target === 'first') {
        nextIdx = 0;
      } else if (target === 'prev') {
        nextIdx = Math.max(0, nextIdx - 1);
      } else if (target === 'next') {
        nextIdx = nextIdx + 1;
      } else if (target === 'last') {
        nextIdx = -1; // Return to live
      }

      if (nextIdx >= total) {
        nextIdx = -1;
      }

      setHistoryIndex(nextIdx);

      if (nextIdx === -1) {
        // Return to live
        const chess = chessRef.current;
        setFen(chess.fen());
        setTurn(chess.turn());
        const last = moveHistory[total - 1];
        setLastMove(last ? { from: last.from, to: last.to } : null);
      } else {
        const item = moveHistory[nextIdx];
        setFen(item.fenAfter);
        setTurn(item.color === 'w' ? 'b' : 'w');
        setLastMove({ from: item.from, to: item.to });
      }

      setSelectedSquare(null);
      setLegalMoves([]);
    },
    [historyIndex, moveHistory]
  );

  // Compute captured pieces and material score
  const capturedPieces = useRef<{ w: PieceType[]; b: PieceType[] }>({ w: [], b: [] });
  const materialAdvantage = useRef<{ w: number; b: number }>({ w: 0, b: 0 });

  // Calculate captures from history up to current view
  const currentHistorySlice = historyIndex === -1 ? moveHistory : moveHistory.slice(0, historyIndex + 1);
  const whiteCaptures: PieceType[] = [];
  const blackCaptures: PieceType[] = [];

  for (const move of currentHistorySlice) {
    if (move.captured) {
      if (move.color === 'w') {
        whiteCaptures.push(move.captured);
      } else {
        blackCaptures.push(move.captured);
      }
    }
  }

  // Material evaluation
  let whiteMaterial = 0;
  let blackMaterial = 0;
  whiteCaptures.forEach((p) => (whiteMaterial += PIECE_VALUES[p] || 0));
  blackCaptures.forEach((p) => (blackMaterial += PIECE_VALUES[p] || 0));

  capturedPieces.current = { w: whiteCaptures, b: blackCaptures };
  materialAdvantage.current = {
    w: Math.max(0, (whiteMaterial - blackMaterial) / 100),
    b: Math.max(0, (blackMaterial - whiteMaterial) / 100),
  };

  // Clock countdown timer effect
  useEffect(() => {
    const tc = getTimeControlConfig();
    if (tc.minutes === 0 || gameResult || historyIndex !== -1 || moveHistory.length === 0) {
      return;
    }

    const interval = setInterval(() => {
      setClocks((prev) => {
        const currentMs = prev[turn];
        if (currentMs <= 100) {
          clearInterval(interval);
          evaluateGameEnd('timeout');
          return { ...prev, [turn]: 0 };
        }

        if (currentMs <= 10000 && currentMs % 1000 < 100) {
          soundManager.playLowTime();
        }

        return { ...prev, [turn]: currentMs - 100 };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [turn, gameResult, historyIndex, moveHistory.length, getTimeControlConfig, evaluateGameEnd]);

  // AI move triggering effect
  useEffect(() => {
    if (
      settings.gameMode === 'ai' &&
      turn !== settings.playerColor &&
      !gameResult &&
      historyIndex === -1 &&
      !isAIThinking
    ) {
      setIsAIThinking(true);

      computeAIMove(chessRef.current, settings.aiDifficulty)
        .then((aiMove) => {
          if (aiMove) {
            executeMove({
              from: aiMove.from as Square,
              to: aiMove.to as Square,
              promotion: aiMove.promotion,
            });
          }
        })
        .finally(() => {
          setIsAIThinking(false);
        });
    }
  }, [
    turn,
    settings.gameMode,
    settings.playerColor,
    settings.aiDifficulty,
    gameResult,
    historyIndex,
    isAIThinking,
    executeMove,
  ]);

  // Settings update helper
  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  return {
    chess: chessRef.current,
    fen,
    turn,
    selectedSquare,
    legalMoves,
    lastMove,
    inCheck,
    checkSquare,
    isGameOver: !!gameResult,
    gameResult,
    moveHistory,
    historyIndex,
    isAIThinking,
    pendingPromotion,
    clocks,
    settings,
    capturedPieces: capturedPieces.current,
    materialAdvantage: materialAdvantage.current,
    handleSquareClick,
    handlePieceDrop,
    handlePromotionSelect,
    cancelPromotion,
    undoMove,
    restartGame,
    startNewGame,
    resignGame,
    offerDraw,
    drawDeclinedMessage,
    evalScore: evaluateBoard(chessRef.current),
    navigateHistory,
    updateSettings,
  };
}
