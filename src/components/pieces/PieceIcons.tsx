import React from 'react';
import type { PieceType, PieceColor } from '../../types/chess';

interface PieceProps {
  type: PieceType;
  color: PieceColor;
  className?: string;
  size?: number | string;
}

export const ChessPiece: React.FC<PieceProps> = ({ type, color, className = '', size = '100%' }) => {
  const isWhite = color === 'w';

  // SVG Paths for Staunton pieces
  // White pieces have clean white fill and subtle dark outline
  // Black pieces have sleek charcoal/black fill with subtle light outline
  const fill = isWhite ? '#ffffff' : '#1e232a';
  const stroke = isWhite ? '#2c3440' : '#d1d5db';
  const strokeWidth = 1.5;

  switch (type) {
    case 'p': // Pawn
      return (
        <svg
          viewBox="0 0 45 45"
          width={size}
          height={size}
          className={`chess-piece select-none pointer-events-none ${className}`}
        >
          <g
            style={{
              fill,
              stroke,
              strokeWidth,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }}
          >
            <path d="M 22.5 9 A 4 4 0 1 1 22.5 17 A 4 4 0 1 1 22.5 9 Z" />
            <path d="M 22.5 17 C 27 17 26 21 26 23 C 26 25 28 27 28 27 L 17 27 C 17 27 19 25 19 23 C 19 21 18 17 22.5 17 Z" />
            <path d="M 12 37 C 12 32 15 28 17 28 L 28 28 C 30 28 33 32 33 37 Z" />
            <path d="M 10 39 L 35 39 L 35 41 L 10 41 Z" />
          </g>
        </svg>
      );

    case 'n': // Knight
      return (
        <svg
          viewBox="0 0 45 45"
          width={size}
          height={size}
          className={`chess-piece select-none pointer-events-none ${className}`}
        >
          <g
            style={{
              fill,
              stroke,
              strokeWidth,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }}
          >
            <path d="M 22 10 C 32.5 11 38.5 18 38 39 L 15 39 C 15 30 25 32.5 23 18" />
            <path d="M 24 18 C 24.38 20.91 18.45 22.6 16 24 C 13 25 12 21 15 17 C 18 13 16 9 13 6 C 18 6 22 7.5 24 10 C 26 12 25 14 27 14 C 29 14 31 12 31 10 C 31 7 28 5 25 4 C 33 3 37 8 38 12" />
            <path
              d="M 9.5 25.5 A 0.5 0.5 0 1 1 8.5 25.5 A 0.5 0.5 0 1 1 9.5 25.5 Z"
              style={{ fill: stroke, stroke: 'none' }}
            />
            <path
              d="M 15 15.5 A 0.5 1.5 0 1 1 14 15.5 A 0.5 1.5 0 1 1 15 15.5 Z"
              style={{ fill: stroke, stroke: 'none' }}
            />
            <path d="M 10 39 L 35 39 L 35 41 L 10 41 Z" />
          </g>
        </svg>
      );

    case 'b': // Bishop
      return (
        <svg
          viewBox="0 0 45 45"
          width={size}
          height={size}
          className={`chess-piece select-none pointer-events-none ${className}`}
        >
          <g
            style={{
              fill,
              stroke,
              strokeWidth,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }}
          >
            <path d="M 9 39 L 36 39 L 36 41 L 9 41 Z" />
            <path d="M 12 37 C 12 32 15 28 17 28 L 28 28 C 30 28 33 32 33 37 Z" />
            <path d="M 17 28 C 14 23 16 14 22.5 11 C 29 14 31 23 28 28 Z" />
            <path d="M 22.5 8 A 2.5 2.5 0 1 1 22.5 13 A 2.5 2.5 0 1 1 22.5 8 Z" />
            <path d="M 20 18 L 25 18" />
            <path d="M 22.5 15.5 L 22.5 20.5" />
            <path d="M 17 21 C 20 23 25 23 28 21" />
          </g>
        </svg>
      );

    case 'r': // Rook
      return (
        <svg
          viewBox="0 0 45 45"
          width={size}
          height={size}
          className={`chess-piece select-none pointer-events-none ${className}`}
        >
          <g
            style={{
              fill,
              stroke,
              strokeWidth,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }}
          >
            <path d="M 9 39 L 36 39 L 36 41 L 9 41 Z" />
            <path d="M 12 37 L 33 37 L 31 29 L 14 29 Z" />
            <path d="M 14 29 L 31 29 L 30 17 L 15 17 Z" />
            <path d="M 12 17 L 33 17 L 34 10 L 30 10 L 30 13 L 26 13 L 26 10 L 19 10 L 19 13 L 15 13 L 15 10 L 11 10 Z" />
            <path d="M 14 29 L 31 29" />
            <path d="M 12 37 L 33 37" />
          </g>
        </svg>
      );

    case 'q': // Queen
      return (
        <svg
          viewBox="0 0 45 45"
          width={size}
          height={size}
          className={`chess-piece select-none pointer-events-none ${className}`}
        >
          <g
            style={{
              fill,
              stroke,
              strokeWidth,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }}
          >
            <path d="M 9 39 L 36 39 L 36 41 L 9 41 Z" />
            <path d="M 12 37 C 12 33 15 28 17 28 L 28 28 C 30 28 33 33 33 37 Z" />
            <path d="M 14 28 C 14 28 12 21 8 18 C 12 21 16 23 18 20 C 18 20 18 15 16 11 C 19 16 21 21 22.5 21 C 24 21 26 16 29 11 C 27 15 27 20 27 20 C 29 23 33 21 37 18 C 33 21 31 28 31 28 Z" />
            <circle cx="8" cy="16" r="2" />
            <circle cx="15.5" cy="10" r="2" />
            <circle cx="22.5" cy="8" r="2" />
            <circle cx="29.5" cy="10" r="2" />
            <circle cx="37" cy="16" r="2" />
          </g>
        </svg>
      );

    case 'k': // King
      return (
        <svg
          viewBox="0 0 45 45"
          width={size}
          height={size}
          className={`chess-piece select-none pointer-events-none ${className}`}
        >
          <g
            style={{
              fill,
              stroke,
              strokeWidth,
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
            }}
          >
            <path d="M 22.5 7 L 22.5 13" />
            <path d="M 19.5 9.5 L 25.5 9.5" />
            <path d="M 9 39 L 36 39 L 36 41 L 9 41 Z" />
            <path d="M 12 37 C 12 33 15 28 17 28 L 28 28 C 30 28 33 33 33 37 Z" />
            <path d="M 14 28 C 10 24 11 16 17 14 C 20 19 25 19 28 14 C 34 16 35 24 31 28 Z" />
            <circle cx="22.5" cy="15.5" r="2" />
            <path d="M 16 24 C 20 26 25 26 29 24" />
          </g>
        </svg>
      );

    default:
      return null;
  }
};
