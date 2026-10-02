import { Chess, type Move } from 'chess.js';
import type { AIDifficulty, PieceColor } from '../types/chess';
import { PIECE_VALUES, PST } from './constants';

function evaluatePosition(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -100000 : 100000;
  }
  if (game.isDraw()) {
    return 0;
  }

  let totalScore = 0;
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

      const baseVal = PIECE_VALUES[piece.type] || 0;
      let posVal = 0;

      const pType = piece.type;
      const isWhite = piece.color === 'w';
      const row = isWhite ? r : 7 - r;
      const col = c;

      if (pType === 'p') {
        posVal = PST.p[row][col];
      } else if (pType === 'n') {
        posVal = PST.n[row][col];
      } else if (pType === 'b') {
        posVal = PST.b[row][col];
      } else if (pType === 'r') {
        posVal = PST.r[row][col];
      } else if (pType === 'q') {
        posVal = PST.q[row][col];
      } else if (pType === 'k') {
        // Use endgame table if queens are traded or few pieces remain
        const isEndgame = (!hasWhiteQueen && !hasBlackQueen) || totalPieces <= 10;
        posVal = isEndgame ? PST.k_end[row][col] : PST.k_middle[row][col];
      }

      const pieceTotal = baseVal + posVal;
      totalScore += isWhite ? pieceTotal : -pieceTotal;
    }
  }

  return totalScore;
}

function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (a.captured) {
      scoreA += (PIECE_VALUES[a.captured] || 0) * 10 - (PIECE_VALUES[a.piece] || 0);
    }
    if (a.promotion) {
      scoreA += 900;
    }

    if (b.captured) {
      scoreB += (PIECE_VALUES[b.captured] || 0) * 10 - (PIECE_VALUES[b.piece] || 0);
    }
    if (b.promotion) {
      scoreB += 900;
    }

    return scoreB - scoreA;
  });
}

function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || game.isGameOver()) {
    return evaluatePosition(game);
  }

  const rawMoves = game.moves({ verbose: true });
  const moves = orderMoves(rawMoves);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evalScore = minimax(game, depth - 1, alpha, beta, false);
      game.undo();

      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      game.move(move);
      const evalScore = minimax(game, depth - 1, alpha, beta, true);
      game.undo();

      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return minEval;
  }
}

export async function computeAIMove(
  gameInstance: Chess,
  difficulty: AIDifficulty
): Promise<Move | null> {
  const clone = new Chess(gameInstance.fen());
  const moves = clone.moves({ verbose: true });

  if (moves.length === 0) return null;

  // Natural human-like pause before playing
  await new Promise((resolve) => setTimeout(resolve, 350 + Math.random() * 250));

  const turn: PieceColor = clone.turn();
  const isMaximizing = turn === 'w';

  // --- EASY DIFFICULTY ---
  if (difficulty === 'easy') {
    // 50% blunder/random, 50% basic 1-ply capture/check move
    if (Math.random() < 0.5) {
      const captures = moves.filter((m) => m.captured);
      if (captures.length > 0 && Math.random() < 0.6) {
        return captures[Math.floor(Math.random() * captures.length)];
      }
      return moves[Math.floor(Math.random() * moves.length)];
    }

    // 1-ply evaluation
    let bestVal = isMaximizing ? -Infinity : Infinity;
    let candidates: Move[] = [];

    for (const move of moves) {
      clone.move(move);
      const val = evaluatePosition(clone);
      clone.undo();

      if (isMaximizing) {
        if (val > bestVal) {
          bestVal = val;
          candidates = [move];
        } else if (val === bestVal) {
          candidates.push(move);
        }
      } else {
        if (val < bestVal) {
          bestVal = val;
          candidates = [move];
        } else if (val === bestVal) {
          candidates.push(move);
        }
      }
    }
    return candidates[Math.floor(Math.random() * candidates.length)] || moves[0];
  }

  // --- MEDIUM DIFFICULTY ---
  if (difficulty === 'medium') {
    const depth = 2;
    const ordered = orderMoves(moves);
    let bestMove = ordered[0];
    let bestVal = isMaximizing ? -Infinity : Infinity;

    for (const move of ordered) {
      clone.move(move);
      const val = minimax(clone, depth - 1, -Infinity, Infinity, !isMaximizing);
      clone.undo();

      // Small jitter (+-15 centipawns) so Medium doesn't play identical lines
      const jitteredVal = val + (Math.random() * 30 - 15);

      if (isMaximizing) {
        if (jitteredVal > bestVal) {
          bestVal = jitteredVal;
          bestMove = move;
        }
      } else {
        if (jitteredVal < bestVal) {
          bestVal = jitteredVal;
          bestMove = move;
        }
      }
    }
    return bestMove;
  }

  // --- HARD DIFFICULTY ---
  // Depth 3 (or 4 if few pieces remain), full alpha-beta pruning
  const board = clone.board();
  let remainingPieces = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]) remainingPieces++;
    }
  }
  const depth = remainingPieces <= 10 ? 4 : 3;

  const ordered = orderMoves(moves);
  let bestMove = ordered[0];
  let bestVal = isMaximizing ? -Infinity : Infinity;
  let alpha = -Infinity;
  let beta = Infinity;

  for (const move of ordered) {
    clone.move(move);
    const score = minimax(clone, depth - 1, alpha, beta, !isMaximizing);
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
