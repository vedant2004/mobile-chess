import type {
  TimeControl,
  AppSettings,
  BoardTheme,
  DifficultyConfig,
} from '../types/chess';
import type { BalloonDifficulty } from '../types/balloon';

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

export const CHESS_DIFFICULTIES: DifficultyConfig[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    tagline: 'Learning the game',
    elo: 800,
    depth: 1,
    stockfishSkill: 0,
    thinkingTimeMs: 300,
    description: 'Makes casual moves and occasional blunders. Great for new players.',
    badgeClass: 'bg-emerald-950 text-emerald-300 border-emerald-700',
  },
  {
    id: 'easy',
    name: 'Easy',
    tagline: 'Casual opponent',
    elo: 1100,
    depth: 2,
    stockfishSkill: 3,
    thinkingTimeMs: 500,
    description: 'Noticeable tactical errors with basic piece defense.',
    badgeClass: 'bg-teal-950 text-teal-300 border-teal-700',
  },
  {
    id: 'medium',
    name: 'Medium',
    tagline: 'A serious challenge',
    elo: 1400,
    depth: 3,
    stockfishSkill: 6,
    thinkingTimeMs: 800,
    description: 'Competent tactical play. Capitalizes on obvious mistakes.',
    badgeClass: 'bg-cyan-950 text-cyan-300 border-cyan-700',
  },
  {
    id: 'hard',
    name: 'Hard',
    tagline: 'Strong tactical play',
    elo: 1700,
    depth: 4,
    stockfishSkill: 10,
    thinkingTimeMs: 1200,
    description: 'Searches captures and forcing lines. Tough positional awareness.',
    badgeClass: 'bg-blue-950 text-blue-300 border-blue-700',
  },
  {
    id: 'expert',
    name: 'Expert',
    tagline: 'Very difficult',
    elo: 2000,
    depth: 5,
    stockfishSkill: 14,
    thinkingTimeMs: 1800,
    description: 'Multi-ply tactical calculation and solid endgame play.',
    badgeClass: 'bg-indigo-950 text-indigo-300 border-indigo-700',
  },
  {
    id: 'master',
    name: 'Master',
    tagline: 'Elite-level challenge',
    elo: 2300,
    depth: 6,
    stockfishSkill: 17,
    thinkingTimeMs: 2500,
    description: 'Deep search depth, pawn structure evaluation, and relentless pressure.',
    badgeClass: 'bg-purple-950 text-purple-300 border-purple-700',
  },
  {
    id: 'grandmaster',
    name: 'Grandmaster',
    tagline: 'Extremely strong engine',
    elo: 2600,
    depth: 8,
    stockfishSkill: 19,
    thinkingTimeMs: 3500,
    description: 'Near-flawless tactical search with deep opening knowledge and endgame tablebases.',
    badgeClass: 'bg-rose-950 text-rose-300 border-rose-700',
  },
  {
    id: 'legend',
    name: 'LEGEND',
    tagline: 'Maximum available strength',
    elo: 2850,
    depth: 12,
    stockfishSkill: 20,
    thinkingTimeMs: 5000,
    description: 'Maximum practical browser engine depth. Zero deliberate blunders. Plays for the win at all costs.',
    badgeClass: 'bg-amber-950 text-amber-300 border-amber-500 shadow-amber-500/20 shadow-md',
  },
];

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

// Balloon Pop Difficulty Settings
export const BALLOON_DIFFICULTIES: Record<
  BalloonDifficulty,
  { name: string; lives: number; speedMin: number; speedMax: number; spawnIntervalMs: number; bombChance: number }
> = {
  easy: {
    name: 'Easy',
    lives: 5,
    speedMin: 18,
    speedMax: 28,
    spawnIntervalMs: 850,
    bombChance: 0.05,
  },
  normal: {
    name: 'Normal',
    lives: 3,
    speedMin: 24,
    speedMax: 38,
    spawnIntervalMs: 650,
    bombChance: 0.1,
  },
  hard: {
    name: 'Hard',
    lives: 3,
    speedMin: 32,
    speedMax: 50,
    spawnIntervalMs: 480,
    bombChance: 0.15,
  },
  insane: {
    name: 'Insane',
    lives: 2,
    speedMin: 42,
    speedMax: 68,
    spawnIntervalMs: 340,
    bombChance: 0.22,
  },
};

export const BALLOON_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
];

// Piece-Square Tables (White's perspective)
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
