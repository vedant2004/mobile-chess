export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type CardColor = 'red' | 'black';

export interface Card {
  id: string; // e.g. "hearts-12"
  suit: Suit;
  rank: number; // 1 (Ace) to 13 (King)
  isFaceUp: boolean;
}

export type FoundationPiles = [Card[], Card[], Card[], Card[]];
export type TableauColumns = [Card[], Card[], Card[], Card[], Card[], Card[], Card[]];

export interface SolitaireState {
  stock: Card[];
  waste: Card[];
  foundations: FoundationPiles;
  tableau: TableauColumns;
  drawCount: 1 | 3;
  moves: number;
  score: number;
  timer: number;
  isGameWon: boolean;
}

export interface SolitaireStats {
  gamesPlayed: number;
  gamesWon: number;
  bestTime: number; // in seconds (0 = none)
  bestMoves: number; // (0 = none)
}
