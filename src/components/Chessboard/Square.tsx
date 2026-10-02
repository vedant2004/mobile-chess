import React from 'react';
import type { Square as SquareType, PieceType, PieceColor } from '../../types/chess';
import { ChessPiece } from '../pieces/PieceIcons';

interface SquareProps {
  square: SquareType;
  piece: { type: PieceType; color: PieceColor } | null;
  isLight: boolean;
  isSelected: boolean;
  isLegalMove: boolean;
  isCapture: boolean;
  isInvalid?: boolean;
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
}

export const Square: React.FC<SquareProps> = React.memo(({
  square,
  piece,
  isLight,
  isSelected,
  isLegalMove,
  isCapture,
  isInvalid = false,
  isLastMove,
  isInCheck,
  showCoordinates,
  fileLabel,
  rankLabel,
  themeColors,
  onClick,
}) => {
  const bg = isLight ? themeColors.lightSquare : themeColors.darkSquare;

  return (
    <button
      type="button"
      id={`square-${square}`}
      data-square={square}
      aria-label={`${square} ${piece ? `${piece.color === 'w' ? 'White' : 'Black'} ${piece.type}` : 'empty'}`}
      className={`relative flex items-center justify-center select-none cursor-pointer transition-colors duration-150 p-0 m-0 border-0 outline-none focus:outline-none appearance-none square-box w-full h-full ${
        isInCheck ? 'king-in-check' : ''
      } ${isInvalid ? 'animate-wobble ring-4 ring-rose-500/80 bg-rose-500/25 z-30' : ''}`}
      style={{
        backgroundColor: bg,
        touchAction: 'manipulation',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none',
      }}
      onClick={() => onClick(square)}
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
        <div className="absolute inset-0 pointer-events-none bg-amber-400/35 ring-4 ring-amber-400 ring-inset shadow-[inset_0_0_18px_rgba(251,191,36,0.45)] z-10 animate-pulse" />
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

      {/* Legal Move Dot (Empty Square) */}
      {isLegalMove && !isCapture && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-emerald-500/80 dark:bg-emerald-400/85 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] ring-2 ring-emerald-300/40" />
        </div>
      )}

      {/* Legal Move Capture Ring (Enemy Piece or En Passant) */}
      {isLegalMove && isCapture && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="w-[88%] h-[88%] rounded-full border-4 md:border-[5px] border-rose-500/90 bg-rose-500/20 shadow-[0_0_14px_rgba(244,63,94,0.55)] animate-pulse flex items-center justify-center">
            {!piece && (
              <div className="w-3 h-3 bg-rose-500 rounded-full shadow-sm" />
            )}
          </div>
        </div>
      )}

      {/* Chess Piece */}
      {piece && (
        <div
          className={`w-[85%] h-[85%] flex items-center justify-center z-10 pointer-events-none select-none transition-all duration-150 ${
            isSelected
              ? 'scale-110 -translate-y-1 drop-shadow-[0_8px_14px_rgba(0,0,0,0.65)]'
              : 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]'
          }`}
        >
          <ChessPiece type={piece.type} color={piece.color} />
        </div>
      )}
    </button>
  );
});
Square.displayName = 'Square';
