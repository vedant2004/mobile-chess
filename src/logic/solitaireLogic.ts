import type {
  Card,
  Suit,
  SolitaireState,
  TableauColumns,
  FoundationPiles,
} from '../types/solitaire';

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];

export function getCardColor(suit: Suit): 'red' | 'black' {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
}

export function getSuitSymbol(suit: Suit): string {
  switch (suit) {
    case 'spades':
      return '♠';
    case 'hearts':
      return '♥';
    case 'diamonds':
      return '♦';
    case 'clubs':
      return '♣';
  }
}

export function getRankLabel(rank: number): string {
  switch (rank) {
    case 1:
      return 'A';
    case 11:
      return 'J';
    case 12:
      return 'Q';
    case 13:
      return 'K';
    default:
      return rank.toString();
  }
}

// Generate & Shuffle standard 52-card deck
export function createShuffledDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        isFaceUp: false,
      });
    }
  }

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}

// Deal new Klondike game
export function createNewSolitaireGame(drawCount: 1 | 3 = 1): SolitaireState {
  const deck = createShuffledDeck();

  const tableau: TableauColumns = [[], [], [], [], [], [], []];
  let deckIndex = 0;

  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = { ...deck[deckIndex++] };
      card.isFaceUp = row === col; // Only top card face up
      tableau[col].push(card);
    }
  }

  const stock = deck.slice(deckIndex).map((c) => ({ ...c, isFaceUp: false }));
  const waste: Card[] = [];
  const foundations: FoundationPiles = [[], [], [], []];

  return {
    stock,
    waste,
    foundations,
    tableau,
    drawCount,
    moves: 0,
    score: 0,
    timer: 0,
    isGameWon: false,
  };
}

// Draw cards from Stock to Waste
export function drawFromStock(state: SolitaireState): SolitaireState {
  const stock = [...state.stock];
  const waste = [...state.waste];

  if (stock.length === 0) {
    // Recycle waste into stock (reverse waste and flip face down)
    const recycledStock = waste.reverse().map((c) => ({ ...c, isFaceUp: false }));
    return {
      ...state,
      stock: recycledStock,
      waste: [],
      moves: state.moves + 1,
    };
  }

  // Draw 1 or 3 cards
  const count = Math.min(state.drawCount, stock.length);
  for (let i = 0; i < count; i++) {
    const card = stock.pop()!;
    card.isFaceUp = true;
    waste.push(card);
  }

  return {
    ...state,
    stock,
    waste,
    moves: state.moves + 1,
  };
}

// Can place card on Foundation pile
export function canPlaceOnFoundation(card: Card, foundationPile: Card[]): boolean {
  if (foundationPile.length === 0) {
    return card.rank === 1; // Must be Ace
  }
  const top = foundationPile[foundationPile.length - 1];
  return top.suit === card.suit && card.rank === top.rank + 1;
}

// Can place card on Tableau column
export function canPlaceOnTableau(card: Card, column: Card[]): boolean {
  if (column.length === 0) {
    return card.rank === 13; // King only
  }
  const top = column[column.length - 1];
  if (!top.isFaceUp) return false;

  const cardColor = getCardColor(card.suit);
  const topColor = getCardColor(top.suit);

  return cardColor !== topColor && top.rank === card.rank + 1;
}

// Check if all cards in tableau are face up (Eligible for Auto-Complete)
export function canAutoComplete(state: SolitaireState): boolean {
  if (state.stock.length > 0 || state.waste.length > 0) return false;

  for (const col of state.tableau) {
    for (const card of col) {
      if (!card.isFaceUp) return false;
    }
  }

  return !state.isGameWon;
}

// Perform one step of auto-complete
export function stepAutoComplete(state: SolitaireState): SolitaireState | null {
  const foundations = state.foundations.map((f) => [...f]) as FoundationPiles;
  const tableau = state.tableau.map((col) => [...col]) as TableauColumns;

  for (let colIdx = 0; colIdx < 7; colIdx++) {
    const col = tableau[colIdx];
    if (col.length === 0) continue;

    const topCard = col[col.length - 1];
    for (let fIdx = 0; fIdx < 4; fIdx++) {
      if (canPlaceOnFoundation(topCard, foundations[fIdx])) {
        col.pop();
        foundations[fIdx].push(topCard);

        const won = checkWin({ ...state, foundations });
        return {
          ...state,
          foundations,
          tableau,
          moves: state.moves + 1,
          score: state.score + 10,
          isGameWon: won,
        };
      }
    }
  }

  return null;
}

// Check Win Condition: all foundations have 13 cards
export function checkWin(state: SolitaireState): boolean {
  return state.foundations.every((pile) => pile.length === 13);
}

// Smart Tap Move: tries moving a card to foundation first, then to tableau
export function trySmartMove(state: SolitaireState, card: Card, fromColIdx?: number): SolitaireState | null {
  const foundations = state.foundations.map((f) => [...f]) as FoundationPiles;
  const tableau = state.tableau.map((col) => [...col]) as TableauColumns;
  let waste = [...state.waste];

  // 1. Try Foundation (single card only)
  let isSingleCard = true;
  if (fromColIdx !== undefined) {
    const col = tableau[fromColIdx];
    const cardIdx = col.findIndex((c) => c.id === card.id);
    if (cardIdx !== col.length - 1) {
      isSingleCard = false; // Middle of a stack cannot go to foundation
    }
  }

  if (isSingleCard) {
    for (let fIdx = 0; fIdx < 4; fIdx++) {
      if (canPlaceOnFoundation(card, foundations[fIdx])) {
        // Remove from source
        if (fromColIdx !== undefined) {
          tableau[fromColIdx].pop();
          if (tableau[fromColIdx].length > 0) {
            tableau[fromColIdx][tableau[fromColIdx].length - 1].isFaceUp = true;
          }
        } else {
          // From waste
          waste = waste.filter((c) => c.id !== card.id);
        }

        foundations[fIdx].push(card);
        const won = checkWin({ ...state, foundations });

        return {
          ...state,
          foundations,
          tableau,
          waste,
          moves: state.moves + 1,
          score: state.score + 10,
          isGameWon: won,
        };
      }
    }
  }

  // 2. Try Tableau
  for (let toCol = 0; toCol < 7; toCol++) {
    if (fromColIdx === toCol) continue;

    if (canPlaceOnTableau(card, tableau[toCol])) {
      if (fromColIdx !== undefined) {
        // Move stack from tableau
        const col = tableau[fromColIdx];
        const cardIdx = col.findIndex((c) => c.id === card.id);
        const movingStack = col.splice(cardIdx);

        if (col.length > 0) {
          col[col.length - 1].isFaceUp = true;
        }

        tableau[toCol].push(...movingStack);
      } else {
        // Move from waste
        waste = waste.filter((c) => c.id !== card.id);
        tableau[toCol].push(card);
      }

      return {
        ...state,
        foundations,
        tableau,
        waste,
        moves: state.moves + 1,
        score: state.score + 5,
      };
    }
  }

  return null;
}
