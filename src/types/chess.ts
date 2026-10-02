import type { Square, PieceSymbol, Color } from 'chess.js';

export type { Square };
export type PieceType = PieceSymbol;
export type PieceColor = Color;

export type GameMode = 'ai' | 'pvp';
export type AIDifficulty =
  | 'beginner'
  | 'easy'
  | 'medium'
  | 'hard'
  | 'expert'
  | 'master'
  | 'grandmaster'
  | 'legend';

export type BoardTheme = 'classic' | 'emerald' | 'wood' | 'midnight';

export interface TimeControl {
  id: string;
  name: string;
  minutes: number;
  increment: number;
}

export interface PlayerStats {
  color: PieceColor;
  name: string;
  timeRemaining: number;
  capturedPieces: PieceType[];
  materialScore: number;
}

export type GameEndReason =
  | 'checkmate'
  | 'stalemate'
  | 'threefold_repetition'
  | 'insufficient_material'
  | 'fifty_moves'
  | 'timeout'
  | 'resignation'
  | 'agreement';

export interface GameResult {
  winner: PieceColor | 'draw';
  reason: GameEndReason;
  message: string;
}

export interface MoveRecord {
  san: string;
  from: Square;
  to: Square;
  piece: PieceType;
  color: PieceColor;
  captured?: PieceType;
  promotion?: PieceType;
  fenBefore: string;
  fenAfter: string;
}

export interface DifficultyConfig {
  id: AIDifficulty;
  name: string;
  tagline: string;
  elo: number;
  depth: number;
  stockfishSkill: number;
  thinkingTimeMs: number;
  description: string;
  badgeClass: string;
}

export interface AppSettings {
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  gameMode: GameMode;
  aiDifficulty: AIDifficulty;
  playerColor: PieceColor;
  timeControlId: string;
  autoFlip: boolean;
  boardTheme: BoardTheme;
  showCoordinates: boolean;
  showLegalMoves: boolean;
}
