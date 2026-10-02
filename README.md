# Game Hub — Mobile Arcade & Board Game Collection

A polished, mobile-first gaming hub featuring three complete, production-ready games built with **React**, **TypeScript**, and **Vite**:

1. **Chess Master** (PvAI with 8 difficulty tiers & Local 2-Player Pass & Play)
2. **Klondike Solitaire** (Classic 52-card patience with smart tap-to-move and auto-complete)
3. **Balloon Pop** (High-energy reflex arcade with combo multipliers and particle effects)

![Game Hub Banner](https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80)

---

## 🎮 The Games

### 1. ♞ Chess Master
- **8 Distinct AI Difficulty Levels**:
  - **Beginner (~800 Elo)**: "Learning the game" — Casual play with natural blunders.
  - **Easy (~1100 Elo)**: "Casual opponent" — Basic piece defense and tactical openings.
  - **Medium (~1400 Elo)**: "A serious challenge" — Competent positional play with PST tables.
  - **Hard (~1700 Elo)**: "Strong tactical play" — MVV-LVA move ordering and capture searches.
  - **Expert (~2000 Elo)**: "Very difficult" — Deep multi-ply search and endgame handling.
  - **Master (~2300 Elo)**: "Elite-level challenge" — High search depth with pawn structure evaluation.
  - **Grandmaster (~2600 Elo)**: "Extremely strong engine" — Opening book, deep tree search, and live evaluation bar.
  - **LEGEND (~2850+ Elo)**: "Maximum available strength" — Highest practical engine strength with Stockfish WASM and deep Alpha-Beta search.
- **Full Legal Chess Rules**: Castling (O-O and O-O-O), En passant, Pawn promotion dialog, Check, Checkmate, Stalemate, Threefold repetition, and 50-move rule.
- **Live Evaluation Bar**: Visual gauge reflecting current centipawn balance of power.
- **Controls & Clocks**: Bullet 1m, Blitz 3m/5m, Rapid 10m/15m, Draw offers, Resignations, Board flip, and SAN move history review.

### 2. ♠ Klondike Solitaire
- **Complete Rules**: 7 tableau columns, 4 foundation piles (Ace to King by suit), stock pile, and waste pile.
- **Draw 1 & Draw 3**: Configurable draw modes matching tournament and casual styles.
- **Movement**: Red/black alternating descending tableau placement; King-only empty columns.
- **Smart Tap & Drag**: Tap any face-up card to automatically send it to foundations or open tableau columns.
- **Auto-Complete**: Automatically finishes the game once all tableau cards are uncovered.
- **Win Celebrations**: Victory fanfare and celebratory card cascade animations.

### 3. 🎈 Balloon Pop
- **Arcade Gameplay**: Rising balloons with varied sizes, speeds, and sine-wave sway.
- **Combos & Frenzy**: Pop balloons in rapid succession for up to 10x combo multipliers.
- **Special Balloons**:
  - *Normal*: Standard points scaled by combo.
  - *Golden*: High-value bonus target (+500 pts).
  - *Bomb*: Dangerous skull hazard (-300 pts or lost life).
  - *Rainbow*: Unlocks temporary 2x Multiplier Frenzy mode.
  - *Tiny*: High-speed, high-precision challenge.
- **3 Game Modes**: Classic (lives-based), Time Attack (60-second frenzy), and Endless (Zen mode).
- **4 Difficulties**: Easy, Normal, Hard, and Insane.
- **60 FPS Canvas Effects**: Particle burst explosions and floating score popups.

---

## 🛠️ Tech Stack & Engineering

- **Frontend**: React 19, TypeScript
- **Tooling**: Vite 8
- **Chess Engine**: `chess.js`, Stockfish WASM/Web Worker + Deep Minimax Alpha-Beta search
- **Audio Synthesizer**: Unified Web Audio API synthesizer for all 3 games with master volume control
- **Storage**: `localStorage` persistence for high scores, solitaire stats, and chess preferences
- **Visuals & Icons**: Lucide React, HTML5 Canvas Particle Engine, Canvas Confetti

---

## 🚀 Running Locally

```bash
# Clone the repository
git clone https://github.com/vedant2004/mobile-chess.git
cd mobile-chess

# Install dependencies
npm install

# Run development server
npm run dev

# Run full test suite
node tests/test_full_suite.cjs

# Production build
npm run build
```

---

## 📄 License

MIT
