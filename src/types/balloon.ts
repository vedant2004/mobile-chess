export type BalloonType = 'normal' | 'golden' | 'bomb' | 'rainbow' | 'tiny';
export type BalloonDifficulty = 'easy' | 'normal' | 'hard' | 'insane';
export type BalloonMode = 'classic' | 'time_attack' | 'endless';

export interface Balloon {
  id: string;
  x: number; // percentage (5 to 95)
  y: number; // percentage (110 at spawn, rising to -20)
  speed: number; // percentage moved per second
  wobbleSpeed: number;
  wobbleOffset: number;
  wobbleAmp: number;
  size: number; // radius in pixels
  color: string;
  type: BalloonType;
  points: number;
  popped: boolean;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
}

export interface BalloonPopStats {
  highScore: number;
  classicBestScore: number;
  timeAttackBestScore: number;
  endlessBestScore: number;
  totalPopped: number;
  maxCombo: number;
}
