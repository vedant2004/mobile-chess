import React from 'react';
import type { Square as SquareType, PieceType, PieceColor } from '../../types/chess';
import { ChessPiece } from '../pieces/PieceIcons';

interface SquareProps {
  square: SquareType;
  piece: { type: PieceType; color: PieceColor } | null;
  isLight: boolean;
  isSelected: boolean;
  isLegalMove: boolean;
  hasEnemyPiece: boolean;
  isLastMove: boolean;
  isInCheck: boolean;
  showCoordinates: boolean;
  fileLabel?: string;
  rankLabel?: string;
  themeColors: {
    lightSquare: string;
    darkSquare: string;
    highlight: string;
    lastMove: string;
  };
  onClick: (square: SquareType) => void;
  onPointerDown: (e: React.PointerEvent, square: SquareType) => void;
}

export const Square: React.FC<SquareProps> = React.memo(({
  square,
  piece,
  isLight,
  isSelected,
  isLegalMove,
  hasEnemyPiece,
  isLastMove,
  isInCheck,
  showCoordinates,
  fileLabel,
  rankLabel,
  themeColors,
  onClick,
  onPointerDown,
}) => {
  const bg = isLight ? themeColors.lightSquare : themeColors.darkSquare;

  return (
    <div
      id={`square-${square}`}
      data-square={square}
      className={`relative flex items-center justify-center select-none cursor-pointer transition-colors duration-150 square-box ${
        isInCheck ? 'king-in-check' : ''
      }`}
      style={{
        backgroundColor: bg,
        touchAction: 'none',
      }}
      onClick={() => onClick(square)}
      onPointerDown={(e) => onPointerDown(e, square)}
    >
      {/* Last move highlight */}
      {isLastMove && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: themeColors.lastMove }}
        />
      )}

      {/* Selected square highlight */}
      {isSelected && (
        <div className="absolute inset-0 pointer-events-none bg-amber-400/40 ring-4 ring-amber-400/80 ring-inset z-10" />
      )}

      {/* King in check highlight */}
      {isInCheck && (
        <div className="absolute inset-0 pointer-events-none bg-red-600/60 animate-pulse ring-4 ring-red-500 ring-inset z-10" />
      )}

      {/* Coordinate labels */}
      {showCoordinates && rankLabel && (
        <span
          className={`absolute top-0.5 left-1 text-[10px] md:text-xs font-bold pointer-events-none ${
            isLight ? 'text-[#769656]' : 'text-[#eeeed2]'
          }`}
          style={{
            color: isLight ? themeColors.darkSquare : themeColors.lightSquare,
            opacity: 0.85,
          }}
        >
          {rankLabel}
        </span>
      )}
      {showCoordinates && fileLabel && (
        <span
          className={`absolute bottom-0.5 right-1 text-[10px] md:text-xs font-bold pointer-events-none ${
            isLight ? 'text-[#769656]' : 'text-[#eeeed2]'
          }`}
          style={{
            color: isLight ? themeColors.darkSquare : themeColors.lightSquare,
            opacity: 0.85,
          }}
        >
          {fileLabel}
        </span>
      )}

      {/* Legal Move Hint */}
      {isLegalMove && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          {hasEnemyPiece ? (
            // Capture target ring
            <div className="w-full h-full border-4 md:border-[5px] border-emerald-500/80 rounded-full scale-[0.88] animate-ping-once" />
          ) : (
            // Move dot
            <div className="w-3.5 h-3.5 md:w-5 md:h-5 bg-emerald-700/60 dark:bg-emerald-400/60 rounded-full shadow-sm" />
          )}
        </div>
      )}

      {/* Piece */}
      {piece && (
        <div className="w-[84%] h-[84%] flex items-center justify-center z-10 transition-transform active:scale-95">
          <ChessPiece type={piece.type} color={piece.color} />
        </div>
      )}
    </div>
  );
});
