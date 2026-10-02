const { Chess } = require('chess.js');

const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

const PST = {
  p: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  n: [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
  ],
  b: [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20],
  ],
  r: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0],
  ],
  q: [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20],
  ],
  k_middle: [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20],
  ],
  k_end: [
    [-50, -40, -30, -20, -20, -30, -40, -50],
    [-30, -20, -10, 0, 0, -10, -20, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 30, 40, 40, 30, -10, -30],
    [-30, -10, 20, 30, 30, 20, -10, -30],
    [-30, -30, 0, 0, 0, 0, -30, -30],
    [-50, -30, -30, -30, -30, -30, -30, -50],
  ],
};

function evaluatePosition(game) {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -100000 : 100000;
  }
  if (game.isDraw()) return 0;

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
      const pieceTotal = baseVal + posVal;
      totalScore += isWhite ? pieceTotal : -pieceTotal;
    }
  }
  return totalScore;
}

function minimax(game, depth, alpha, beta, isMaximizing) {
  if (depth === 0 || game.isGameOver()) {
    return evaluatePosition(game);
  }
  const moves = game.moves({ verbose: true });
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evalScore = minimax(game, depth - 1, alpha, beta, false);
      game.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
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
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

function testAI() {
  console.log('=== TEST AI: Tactical Mate in 1 Finding ===');
  // White has mate in 1: Qh7#
  const mateGame = new Chess('r1bqkb1r/pppp1ppp/2n5/4p3/2B1n3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 5');
  // Qh7# or Qxf7#
  const moves = mateGame.moves({ verbose: true });
  let bestMove = null;
  let bestVal = -Infinity;
  for (const move of moves) {
    mateGame.move(move);
    const score = minimax(mateGame, 1, -Infinity, Infinity, false);
    mateGame.undo();
    if (score > bestVal) {
      bestVal = score;
      bestMove = move;
    }
  }

  console.assert(bestMove && (bestMove.san === 'Qxf7#' || bestMove.san === 'Qxf7'), `AI found move: ${bestMove ? bestMove.san : 'none'}`);
  console.log(`Passed: AI immediately finds mating tactical move: ${bestMove.san} (score: ${bestVal})`);

  console.log('\n=== TEST AI: Capturing Hanging Queen ===');
  const hangQueenGame = new Chess('rnb1kbnr/pppp1ppp/8/4p3/4q3/3P4/PPP2PPP/RNBQKBNR w KQkq - 0 4');
  // White pawn on d3 can capture Black Queen on e4: dxe4
  const moves2 = hangQueenGame.moves({ verbose: true });
  let bestMove2 = null;
  let bestVal2 = -Infinity;
  for (const move of moves2) {
    hangQueenGame.move(move);
    const score = minimax(hangQueenGame, 2, -Infinity, Infinity, false);
    hangQueenGame.undo();
    if (score > bestVal2) {
      bestVal2 = score;
      bestMove2 = move;
    }
  }
  console.assert(bestMove2 && bestMove2.san === 'dxe4', `Expected dxe4, got ${bestMove2 ? bestMove2.san : 'none'}`);
  console.log(`Passed: AI correctly captures hanging queen: ${bestMove2.san}`);

  console.log('\n=== ALL AI TESTS PASSED ===\n');
}

testAI();
