import type { TimeControl, AppSettings, BoardTheme } from '../types/chess';

export const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

export const TIME_CONTROLS: TimeControl[] = [
  { id: 'none', name: 'No Timer', minutes: 0, increment: 0 },
  { id: 'bullet_1', name: 'Bullet 1 min', minutes: 1, increment: 0 },
  { id: 'blitz_3', name: 'Blitz 3 min', minutes: 3, increment: 0 },
  { id: 'blitz_3_2', name: 'Blitz 3+2', minutes: 3, increment: 2 },
  { id: 'blitz_5', name: 'Blitz 5 min', minutes: 5, increment: 0 },
  { id: 'rapid_10', name: 'Rapid 10 min', minutes: 10, increment: 0 },
  { id: 'rapid_15_10', name: 'Rapid 15+10', minutes: 15, increment: 10 },
];

export const BOARD_THEMES: Record<
  BoardTheme,
  { name: string; lightSquare: string; darkSquare: string; highlight: string; lastMove: string }
> = {
  emerald: {
    name: 'Emerald Green',
    lightSquare: '#eeeed2',
    darkSquare: '#769656',
    highlight: 'rgba(235, 97, 80, 0.75)',
    lastMove: 'rgba(247, 247, 105, 0.55)',
  },
  classic: {
    name: 'Tournament Wood',
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
    highlight: 'rgba(235, 97, 80, 0.75)',
    lastMove: 'rgba(205, 210, 106, 0.6)',
  },
  midnight: {
    name: 'Midnight Cyber',
    lightSquare: '#3a4454',
    darkSquare: '#202938',
    highlight: 'rgba(244, 63, 94, 0.75)',
    lastMove: 'rgba(99, 102, 241, 0.5)',
  },
  wood: {
    name: 'Warm Walnut',
    lightSquare: '#e2d6b5',
    darkSquare: '#9e6a38',
    highlight: 'rgba(235, 97, 80, 0.75)',
    lastMove: 'rgba(255, 230, 100, 0.55)',
  },
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  soundEnabled: true,
  gameMode: 'ai',
  aiDifficulty: 'medium',
  playerColor: 'w',
  timeControlId: 'rapid_10',
  autoFlip: false,
  boardTheme: 'emerald',
  showCoordinates: true,
  showLegalMoves: true,
};

// Piece-Square Tables (from White's perspective; rank 8 down to 1)
// For Black, the row index is mirrored: 7 - r
export const PST = {
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
