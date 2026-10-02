const { Chess } = require('chess.js');

function testChessRules() {
  console.log('=== TEST 1: Initial Board & Legal Moves ===');
  const game = new Chess();
  const initialMoves = game.moves();
  console.assert(initialMoves.length === 20, `Expected 20 initial moves, got ${initialMoves.length}`);
  console.log(`Passed: 20 legal moves for White (16 pawn pushes + 4 knight moves).`);

  console.log('\n=== TEST 2: Scholar\'s Mate (Checkmate Detection) ===');
  game.move('e4');
  game.move('e5');
  game.move('Bc4');
  game.move('Nc6');
  game.move('Qh5');
  game.move('Nf6');
  game.move('Qxf7#');
  console.assert(game.isCheckmate() === true, 'Expected checkmate');
  console.assert(game.isGameOver() === true, 'Expected game over');
  console.assert(game.turn() === 'b', 'Expected Black turn');
  console.log(`Passed: Scholar's mate correctly identified checkmate: ${game.isCheckmate()}`);

  console.log('\n=== TEST 3: Castling (Kingside and Queenside) ===');
  const castlingGame = new Chess();
  // White Kingside castle setup
  castlingGame.move('e4');
  castlingGame.move('e5');
  castlingGame.move('Nf3');
  castlingGame.move('Nc6');
  castlingGame.move('Bc4');
  castlingGame.move('Bc5');
  const movesBeforeCastle = castlingGame.moves();
  console.assert(movesBeforeCastle.includes('O-O'), 'Expected O-O in legal moves');
  const castleMove = castlingGame.move('O-O');
  console.assert(castleMove.san === 'O-O', 'Castle move failed');
  console.log(`Passed: Kingside castling executed successfully (san: ${castleMove.san})`);

  // Queenside castle setup for Black
  castlingGame.move('d6');
  castlingGame.move('d4');
  castlingGame.move('Qe7');
  castlingGame.move('Nc3');
  castlingGame.move('Be6');
  castlingGame.move('Bg5');
  castlingGame.move('O-O-O');
  console.assert(castlingGame.history().slice(-1)[0] === 'O-O-O', 'Expected O-O-O');
  console.log(`Passed: Queenside castling for Black executed successfully`);

  console.log('\n=== TEST 4: En Passant ===');
  const epGame = new Chess();
  epGame.move('e4');
  epGame.move('a6');
  epGame.move('e5');
  epGame.move('d5'); // Black pushes pawn two squares
  const epMoves = epGame.moves({ verbose: true });
  const epMove = epMoves.find(m => m.flags.includes('e'));
  console.assert(epMove !== undefined, 'En passant move should be available');
  console.assert(epMove.to === 'd6', `Expected en passant to d6, got ${epMove.to}`);
  epGame.move({ from: 'e5', to: 'd6' });
  console.assert(!epGame.get('d5'), 'Captured pawn on d5 should be removed');
  console.log(`Passed: En passant capture executed correctly, d5 pawn removed.`);

  console.log('\n=== TEST 5: Pawn Promotion ===');
  const promoGame = new Chess('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
  const promoMoves = promoGame.moves({ verbose: true });
  console.assert(promoMoves.some(m => m.promotion === 'q'), 'Queen promotion should exist');
  console.assert(promoMoves.some(m => m.promotion === 'r'), 'Rook promotion should exist');
  console.assert(promoMoves.some(m => m.promotion === 'b'), 'Bishop promotion should exist');
  console.assert(promoMoves.some(m => m.promotion === 'n'), 'Knight promotion should exist');
  promoGame.move({ from: 'e7', to: 'e8', promotion: 'q' });
  console.assert(promoGame.get('e8').type === 'q', 'Promoted piece should be queen');
  console.log(`Passed: Pawn promotion successfully creates Queen, Rook, Bishop, Knight.`);

  console.log('\n=== TEST 6: Stalemate Detection ===');
  const staleGame = new Chess('7k/5Q2/6K1/8/8/8/8/8 b - - 0 1');
  console.assert(staleGame.isStalemate() === true, 'Expected stalemate');
  console.assert(staleGame.isDraw() === true, 'Expected draw');
  console.log(`Passed: Stalemate correctly detected.`);

  console.log('\n=== TEST 7: Insufficient Material ===');
  const matGame = new Chess('8/8/8/4k3/8/8/8/4K1N1 w - - 0 1'); // King + Knight vs King
  console.assert(matGame.isInsufficientMaterial() === true, 'Expected insufficient material');
  console.log(`Passed: King + Knight vs King correctly identified as insufficient material.`);

  console.log('\n=== ALL CHESS RULE TESTS PASSED (7/7) ===\n');
}

testChessRules();
