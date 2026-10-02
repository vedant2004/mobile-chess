import React, { useState, useRef, useCallback } from 'react';
import type { Square as SquareType, PieceType, PieceColor, BoardTheme } from '../../types/chess';
import { Square } from './Square';
import { ChessPiece } from '../pieces/PieceIcons';
import { BOARD_THEMES } from '../../logic/constants';

interface ChessboardProps {
  fen: string;
  isFlipped: boolean;
  selectedSquare: SquareType | null;
  legalMoves: SquareType[];
  lastMove: { from: SquareType; to: SquareType } | null;
  checkSquare: SquareType | null;
  boardTheme: BoardTheme;
  showCoordinates: boolean;
  turn: PieceColor;
  onSquareClick: (square: SquareType) => void;
  onDrop: (from: SquareType, to: SquareType) => void;
}

interface DragState {
  piece: { type: PieceType; color: PieceColor };
  fromSquare: SquareType;
  x: number;
  y: number;
  startX: number;
  startY: number;
  isDragging: boolean;
}

export const Chessboard: React.FC<ChessboardProps> = ({
  fen,
  isFlipped,
  selectedSquare,
  legalMoves,
  lastMove,
  checkSquare,
  boardTheme,
  showCoordinates,
  turn,
  onSquareClick,
  onDrop,
}) => {
  const boardRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

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

  // Pointer Down handler
  const handlePointerDown = useCallback(
    (e: React.PointerEvent, square: SquareType) => {
      // Find piece on this square
      const targetSquare = squares.find((s) => s.square === square);
      if (!targetSquare || !targetSquare.piece) return;

      // Only allow dragging current player's pieces
      if (targetSquare.piece.color !== turn) return;

      setDragState({
        piece: targetSquare.piece,
        fromSquare: square,
        x: e.clientX,
        y: e.clientY,
        startX: e.clientX,
        startY: e.clientY,
        isDragging: false,
      });
    },
    [squares, turn]
  );

  // Global Pointer Move
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState) return;

      const dist = Math.hypot(e.clientX - dragState.startX, e.clientY - dragState.startY);
      setDragState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          x: e.clientX,
          y: e.clientY,
          isDragging: prev.isDragging || dist > 8,
        };
      });
    },
    [dragState]
  );

  // Global Pointer Up
  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragState) return;

      if (dragState.isDragging) {
        // Find square under release point
        // Hide dragged piece temporarily to get element underneath
        const elem = document.elementFromPoint(e.clientX, e.clientY);
        const squareElem = elem?.closest('[data-square]');
        const targetSquare = squareElem?.getAttribute('data-square') as SquareType | undefined;

        if (targetSquare && targetSquare !== dragState.fromSquare) {
          onDrop(dragState.fromSquare, targetSquare);
        } else {
          // Dropped on the same square or outside: select square
          onSquareClick(dragState.fromSquare);
        }
      } else {
        // It was a tap/click
        onSquareClick(dragState.fromSquare);
      }

      setDragState(null);
    },
    [dragState, onDrop, onSquareClick]
  );

  const themeColors = BOARD_THEMES[boardTheme] || BOARD_THEMES.emerald;

  return (
    <div
      ref={boardRef}
      id="chessboard-container"
      className="relative w-full max-w-[460px] md:max-w-[540px] aspect-square rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-700/60 dark:border-slate-800 touch-none select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => setDragState(null)}
    >
      {/* 8x8 Grid */}
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {squares.map((sq) => {
          const isSelected = selectedSquare === sq.square;
          const isLegalMove = legalMoves.includes(sq.square);
          const hasEnemyPiece = !!sq.piece && sq.piece.color !== turn;
          const isLast = !!lastMove && (lastMove.from === sq.square || lastMove.to === sq.square);
          const isInCheck = checkSquare === sq.square;

          // If this square's piece is currently being dragged, visually dim it
          const isBeingDragged = dragState?.isDragging && dragState?.fromSquare === sq.square;

          return (
            <div key={sq.square} className={isBeingDragged ? 'opacity-30' : 'opacity-100'}>
              <Square
                square={sq.square}
                piece={sq.piece}
                isLight={sq.isLight}
                isSelected={isSelected}
                isLegalMove={isLegalMove}
                hasEnemyPiece={hasEnemyPiece}
                isLastMove={isLast}
                isInCheck={isInCheck}
                showCoordinates={showCoordinates}
                fileLabel={sq.fileLabel}
                rankLabel={sq.rankLabel}
                themeColors={themeColors}
                onClick={onSquareClick}
                onPointerDown={handlePointerDown}
              />
            </div>
          );
        })}
      </div>

      {/* Floating Dragged Piece (follows finger/mouse) */}
      {dragState?.isDragging && (
        <div
          className="fixed pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 transition-none drop-shadow-2xl"
          style={{
            left: `${dragState.x}px`,
            top: `${dragState.y}px`,
            width: '64px',
            height: '64px',
          }}
        >
          <ChessPiece type={dragState.piece.type} color={dragState.piece.color} />
        </div>
      )}
    </div>
  );
};
