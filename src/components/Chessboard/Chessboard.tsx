import React from 'react';
import type { Square as SquareType, PieceType, PieceColor, BoardTheme } from '../../types/chess';
import { Square } from './Square';
import { BOARD_THEMES } from '../../logic/constants';

interface ChessboardProps {
  fen: string;
  isFlipped: boolean;
  selectedSquare: SquareType | null;
  legalMoves: SquareType[];
  captureSquares?: SquareType[];
  invalidSquare?: SquareType | null;
  lastMove: { from: SquareType; to: SquareType } | null;
  checkSquare: SquareType | null;
  boardTheme: BoardTheme;
  showCoordinates: boolean;
  turn: PieceColor;
  onSquareClick: (square: SquareType) => void;
}

export const Chessboard: React.FC<ChessboardProps> = ({
  fen,
  isFlipped,
  selectedSquare,
  legalMoves,
  captureSquares = [],
  invalidSquare = null,
  lastMove,
  checkSquare,
  boardTheme,
  showCoordinates,
  turn,
  onSquareClick,
}) => {
  // Parse FEN into an 8x8 matrix
  const piecePlacement = fen.split(' ')[0];
  const boardMatrix: ({ type: PieceType; color: PieceColor } | null)[][] = [];

  const rows = piecePlacement.split('/');
  for (let r = 0; r < 8; r++) {
    const rowPieces: ({ type: PieceType; color: PieceColor } | null)[] = [];
    const fenRow = rows[r];
    for (let i = 0; i < fenRow.length; i++) {
      const char = fenRow[i];
      if (char >= '1' && char <= '8') {
        const emptyCount = parseInt(char, 10);
        for (let e = 0; e < emptyCount; e++) {
          rowPieces.push(null);
        }
      } else {
        const color: PieceColor = char === char.toUpperCase() ? 'w' : 'b';
        const type = char.toLowerCase() as PieceType;
        rowPieces.push({ type, color });
      }
    }
    boardMatrix.push(rowPieces);
  }

  // Generate 64 squares in rank and file order depending on isFlipped
  const squares: {
    square: SquareType;
    piece: { type: PieceType; color: PieceColor } | null;
    isLight: boolean;
    rankLabel?: string;
    fileLabel?: string;
  }[] = [];

  const ranks = isFlipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const files = isFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'] : ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  for (let rIdx = 0; rIdx < 8; rIdx++) {
    const rank = ranks[rIdx];
    const matrixRow = 8 - rank; // 0 for rank 8, 7 for rank 1

    for (let fIdx = 0; fIdx < 8; fIdx++) {
      const file = files[fIdx];
      const matrixCol = file.charCodeAt(0) - 97;
      const squareName = `${file}${rank}` as SquareType;
      const piece = boardMatrix[matrixRow][matrixCol];
      const isLight = (matrixRow + matrixCol) % 2 === 0;

      const fileLabel = rIdx === 7 ? file : undefined;
      const rankLabel = fIdx === 0 ? rank.toString() : undefined;

      squares.push({
        square: squareName,
        piece,
        isLight,
        fileLabel,
        rankLabel,
      });
    }
  }

  const themeColors = BOARD_THEMES[boardTheme] || BOARD_THEMES.emerald;

  return (
    <div
      id="chessboard-container"
      className="relative w-full max-w-[460px] md:max-w-[540px] aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700/60 dark:border-slate-800 touch-none select-none overscroll-contain"
    >
      {/* 8x8 Grid */}
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {squares.map((sq) => {
          const isSelected = selectedSquare === sq.square;
          const isLegalMove = legalMoves.includes(sq.square);
          const isCapture =
            captureSquares.includes(sq.square) ||
            (isLegalMove && !!sq.piece && sq.piece.color !== turn);
          const isInvalid = invalidSquare === sq.square;
          const isLast = !!lastMove && (lastMove.from === sq.square || lastMove.to === sq.square);
          const isInCheck = checkSquare === sq.square;

          return (
            <div key={sq.square} className="w-full h-full">
              <Square
                square={sq.square}
                piece={sq.piece}
                isLight={sq.isLight}
                isSelected={isSelected}
                isLegalMove={isLegalMove}
                isCapture={isCapture}
                isInvalid={isInvalid}
                isLastMove={isLast}
                isInCheck={isInCheck}
                showCoordinates={showCoordinates}
                fileLabel={sq.fileLabel}
                rankLabel={sq.rankLabel}
                themeColors={themeColors}
                onClick={onSquareClick}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
