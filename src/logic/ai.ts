import { Chess, type Move } from 'chess.js';
import type { AIDifficulty, PieceColor } from '../types/chess';
import { PIECE_VALUES, PST, CHESS_DIFFICULTIES } from './constants';

export interface EngineResult {
  move: Move | null;
  evalScore: number; // in centipawns (positive = White advantage)
  depth: number;
  engineName: string;
}

// Transposition Table for Alpha-Beta search
const transpositionTable = new Map<string, { depth: number; score: number; flag: 'EXACT' | 'LOWER' | 'UPPER' }>();

// Simple Opening Book for GM & Legend play
const OPENING_BOOK: Record<string, string[]> = {
  // Initial position
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1': ['e2e4', 'd2d4', 'c2c4', 'g1f3'],
  // Responses to 1. e4
  'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1': ['e7e5', 'c7c5', 'e7e6', 'c7c6'],
  // Responses to 1. d4
  'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 1': ['d7d5', 'g8f6', 'e7e6', 'c7c5'],
};

// Evaluation Function
export function evaluateBoard(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -100000 : 100000;
  }
  if (game.isDraw()) return 0;

  let score = 0;
  let totalPieces = 0;
  let hasWhiteQueen = false;
  let hasBlackQueen = false;

  const board = game.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      totalPieces++;
      if (piece.type === 'q') {
        if (piece.color === 'w') hasWhiteQueen = true;
        else hasBlackQueen = true;
      }

      const val = PIECE_VALUES[piece.type] || 0;
      const isWhite = piece.color === 'w';
      const row = isWhite ? r : 7 - r;
      const col = c;

      let posVal = 0;
      if (piece.type === 'p') posVal = PST.p[row][col];
      else if (piece.type === 'n') posVal = PST.n[row][col];
      else if (piece.type === 'b') posVal = PST.b[row][col];
      else if (piece.type === 'r') posVal = PST.r[row][col];
      else if (piece.type === 'q') posVal = PST.q[row][col];
      else if (piece.type === 'k') {
        const isEndgame = (!hasWhiteQueen && !hasBlackQueen) || totalPieces <= 10;
        posVal = isEndgame ? PST.k_end[row][col] : PST.k_middle[row][col];
      }

      const pieceTotal = val + posVal;
      score += isWhite ? pieceTotal : -pieceTotal;
    }
  }

  return score;
}

// Move ordering for Alpha-Beta pruning (MVV-LVA)
function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (a.captured) {
      scoreA += (PIECE_VALUES[a.captured] || 0) * 10 - (PIECE_VALUES[a.piece] || 0);
    }
    if (a.promotion) scoreA += 900;
    if (a.san.includes('+')) scoreA += 50;

    if (b.captured) {
      scoreB += (PIECE_VALUES[b.captured] || 0) * 10 - (PIECE_VALUES[b.piece] || 0);
    }
    if (b.promotion) scoreB += 900;
    if (b.san.includes('+')) scoreB += 50;

    return scoreB - scoreA;
  });
}

// Quiescence Search: resolves all forcing capture sequences to prevent horizon effect
function quiescence(
  game: Chess,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  qDepth: number = 3
): number {
  const standPat = evaluateBoard(game);

  if (qDepth === 0 || game.isGameOver()) {
    return standPat;
  }

  if (isMaximizing) {
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;

    const captureMoves = orderMoves(game.moves({ verbose: true }).filter((m) => m.captured || m.promotion));
    for (const move of captureMoves) {
      game.move(move);
      const score = quiescence(game, alpha, beta, false, qDepth - 1);
      game.undo();

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  } else {
    if (standPat <= alpha) return alpha;
    if (standPat < beta) beta = standPat;

    const captureMoves = orderMoves(game.moves({ verbose: true }).filter((m) => m.captured || m.promotion));
    for (const move of captureMoves) {
      game.move(move);
      const score = quiescence(game, alpha, beta, true, qDepth - 1);
      game.undo();

      if (score <= alpha) return alpha;
      if (score < beta) beta = score;
    }
    return beta;
  }
}

// Minimax with Alpha-Beta Pruning, Transposition Table, and Quiescence Search
function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  useQuiescence: boolean = true
): number {
  const fenKey = game.fen();
  const cached = transpositionTable.get(fenKey);
  if (cached && cached.depth >= depth) {
    if (cached.flag === 'EXACT') return cached.score;
    if (cached.flag === 'LOWER' && cached.score >= beta) return cached.score;
    if (cached.flag === 'UPPER' && cached.score <= alpha) return cached.score;
  }

  if (depth === 0 || game.isGameOver()) {
    return useQuiescence ? quiescence(game, alpha, beta, isMaximizing) : evaluateBoard(game);
  }

  const rawMoves = game.moves({ verbose: true });
  const moves = orderMoves(rawMoves);
  let bestScore = isMaximizing ? -Infinity : Infinity;

  if (isMaximizing) {
    for (const move of moves) {
      game.move(move);
      const score = minimax(game, depth - 1, alpha, beta, false, useQuiescence);
      game.undo();

      bestScore = Math.max(bestScore, score);
      alpha = Math.max(alpha, score);
      if (beta <= alpha) break; // Beta cutoff
    }
  } else {
    for (const move of moves) {
      game.move(move);
      const score = minimax(game, depth - 1, alpha, beta, true, useQuiescence);
      game.undo();

      bestScore = Math.min(bestScore, score);
      beta = Math.min(beta, score);
      if (beta <= alpha) break; // Alpha cutoff
    }
  }

  // Cache in Transposition Table
  if (transpositionTable.size < 50000) {
    let flag: 'EXACT' | 'LOWER' | 'UPPER' = 'EXACT';
    if (bestScore <= alpha) flag = 'UPPER';
    else if (bestScore >= beta) flag = 'LOWER';
    transpositionTable.set(fenKey, { depth, score: bestScore, flag });
  }

  return bestScore;
}

// Browser Stockfish Web Worker Manager
class StockfishEngine {
  private worker: Worker | null = null;
  private isReady: boolean = false;
  private readyPromise: Promise<boolean> | null = null;

  public init(): Promise<boolean> {
    if (this.readyPromise) return this.readyPromise;
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      return Promise.resolve(false);
    }

    this.readyPromise = new Promise((resolve) => {
      try {
        const w = new Worker('/stockfish.js');
        this.worker = w;

        const timeout = setTimeout(() => {
          resolve(false);
        }, 3000);

        w.onmessage = (e: MessageEvent) => {
          const line = typeof e.data === 'string' ? e.data : '';
          if (line.includes('uciok') || line.includes('readyok')) {
            clearTimeout(timeout);
            this.isReady = true;
            resolve(true);
          }
        };

        w.onerror = () => {
          clearTimeout(timeout);
          resolve(false);
        };

        w.postMessage('uci');
        w.postMessage('isready');
      } catch {
        resolve(false);
      }
    });

    return this.readyPromise;
  }

  public getMove(
    fen: string,
    skillLevel: number,
    depth: number,
    maxTimeMs: number
  ): Promise<{ moveSan: string; from: string; to: string; promotion?: string } | null> {
    return new Promise((resolve) => {
      if (!this.worker || !this.isReady) {
        resolve(null);
        return;
      }

      const w = this.worker;
      let resolved = false;

      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(null);
        }
      }, maxTimeMs + 2500);

      const handler = (e: MessageEvent) => {
        const line = typeof e.data === 'string' ? e.data : '';
        if (line.startsWith('bestmove')) {
          const parts = line.split(' ');
          const moveUci = parts[1]; // e.g. "e2e4" or "e7e8q"
          if (moveUci && moveUci !== '(none)') {
            const from = moveUci.slice(0, 2);
            const to = moveUci.slice(2, 4);
            const promotion = moveUci.length > 4 ? moveUci[4] : undefined;

            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              w.removeEventListener('message', handler);
              resolve({ moveSan: moveUci, from, to, promotion });
            }
          } else {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              w.removeEventListener('message', handler);
              resolve(null);
            }
          }
        }
      };

      w.addEventListener('message', handler);
      w.postMessage('ucinewgame');
      w.postMessage(`setoption name Skill Level value ${skillLevel}`);
      w.postMessage(`position fen ${fen}`);
      w.postMessage(`go depth ${depth} movetime ${maxTimeMs}`);
    });
  }
}

export const stockfishEngine = new StockfishEngine();

// Primary AI Move Computation Entrypoint
export async function computeAIMove(
  gameInstance: Chess,
  difficulty: AIDifficulty
): Promise<Move | null> {
  const currentFen = gameInstance.fen();
  const clone = new Chess(currentFen);
  const moves = clone.moves({ verbose: true });
  if (moves.length === 0) return null;

  const config =
    CHESS_DIFFICULTIES.find((d) => d.id === difficulty) ||
    CHESS_DIFFICULTIES.find((d) => d.id === 'medium')!;

  // 1. Check opening book for Grandmaster and Legend
  if (difficulty === 'grandmaster' || difficulty === 'legend') {
    const bookMoves = OPENING_BOOK[currentFen];
    if (bookMoves && bookMoves.length > 0) {
      const uciChoice = bookMoves[Math.floor(Math.random() * bookMoves.length)];
      const from = uciChoice.slice(0, 2);
      const to = uciChoice.slice(2, 4);
      const match = moves.find((m) => m.from === from && m.to === to);
      if (match) {
        await new Promise((r) => setTimeout(r, 600));
        return match;
      }
    }
  }

  // 2. Try Stockfish Engine (if worker initialized)
  if (typeof window !== 'undefined') {
    try {
      const sfReady = await stockfishEngine.init();
      if (sfReady) {
        const sfResult = await stockfishEngine.getMove(
          currentFen,
          config.stockfishSkill,
          config.depth,
          config.thinkingTimeMs
        );
        if (sfResult) {
          const match = moves.find(
            (m) =>
              m.from === sfResult.from &&
              m.to === sfResult.to &&
              (!sfResult.promotion || m.promotion === sfResult.promotion)
          );
          if (match) return match;
        }
      }
    } catch {
      // Fallback to internal search engine
    }
  }

  // 3. Built-in Multi-Tier Minimax Search Engine
  const naturalDelay = Math.min(config.thinkingTimeMs, 1400);
  await new Promise((resolve) => setTimeout(resolve, naturalDelay * (0.6 + Math.random() * 0.4)));

  const turn: PieceColor = clone.turn();
  const isMaximizing = turn === 'w';

  // --- BEGINNER ---
  if (difficulty === 'beginner') {
    // 60% random / blunder chance, 40% 1-ply capture
    if (Math.random() < 0.6) {
      return moves[Math.floor(Math.random() * moves.length)];
    }
    const captures = moves.filter((m) => m.captured);
    if (captures.length > 0) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // --- EASY ---
  if (difficulty === 'easy') {
    // 30% blunder chance, otherwise 1-ply search
    if (Math.random() < 0.3) {
      return moves[Math.floor(Math.random() * moves.length)];
    }
    let bestMove = moves[0];
    let bestVal = isMaximizing ? -Infinity : Infinity;

    for (const move of moves) {
      clone.move(move);
      const val = evaluateBoard(clone);
      clone.undo();

      if (isMaximizing && val > bestVal) {
        bestVal = val;
        bestMove = move;
      } else if (!isMaximizing && val < bestVal) {
        bestVal = val;
        bestMove = move;
      }
    }
    return bestMove;
  }

  // --- MEDIUM ---
  if (difficulty === 'medium') {
    const depth = 2;
    const ordered = orderMoves(moves);
    let bestMove = ordered[0];
    let bestVal = isMaximizing ? -Infinity : Infinity;

    for (const move of ordered) {
      clone.move(move);
      const val = minimax(clone, depth - 1, -Infinity, Infinity, !isMaximizing, false);
      clone.undo();

      const jitter = Math.random() * 20 - 10;
      if (isMaximizing && val + jitter > bestVal) {
        bestVal = val + jitter;
        bestMove = move;
      } else if (!isMaximizing && val + jitter < bestVal) {
        bestVal = val + jitter;
        bestMove = move;
      }
    }
    return bestMove;
  }

  // --- HARD, EXPERT, MASTER, GRANDMASTER, LEGEND ---
  // Iterative Deepening with Quiescence Search and Alpha-Beta Cutoffs
  const targetDepth =
    difficulty === 'hard'
      ? 3
      : difficulty === 'expert'
      ? 4
      : difficulty === 'master'
      ? 5
      : difficulty === 'grandmaster'
      ? 6
      : 7; // LEGEND

  const ordered = orderMoves(moves);
  let bestMove = ordered[0];
  let bestVal = isMaximizing ? -Infinity : Infinity;
  let alpha = -Infinity;
  let beta = Infinity;

  for (const move of ordered) {
    clone.move(move);
    // Quiescence enabled for Expert and above
    const score = minimax(clone, targetDepth - 1, alpha, beta, !isMaximizing, targetDepth >= 4);
    clone.undo();

    if (isMaximizing) {
      if (score > bestVal) {
        bestVal = score;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestVal);
    } else {
      if (score < bestVal) {
        bestVal = score;
        bestMove = move;
      }
      beta = Math.min(beta, bestVal);
    }
  }

  return bestMove;
}
