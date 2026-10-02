# Chess Master — Mobile-First Chess Web App

A modern, responsive, mobile-first chess web game built with **React**, **TypeScript**, and **Vite**.

![Chess Master Banner](https://images.unsplash.com/photo-1529699211952-734e80c4d42b?auto=format&fit=crop&w=1200&q=80)

## Features

- **Mobile-First Experience**: Optimized touch targets, thumb-friendly controls, and seamless tap-to-move and drag-and-drop gameplay.
- **Complete Chess Rules Engine**: Powered by `chess.js`, supporting castling, en passant, pawn promotion, check, checkmate, stalemate, threefold repetition, and 50-move rule.
- **Smart AI Opponent**:
  - **Easy**: Casual mode with natural blunders and relaxed play.
  - **Medium**: Tactical play utilizing piece-square tables and 2-ply lookahead.
  - **Hard**: Advanced Minimax search with Alpha-Beta pruning, dynamic move ordering, and endgame king positioning.
- **Local Two-Player Mode**: Pass & Play with board-flipping options.
- **Digital Chess Clocks**: Configurable time controls (Bullet 1m, Blitz 3m, Blitz 3+2, Blitz 5m, Rapid 10m, Rapid 15+10, or Casual No Timer).
- **Move History & Review**: Scrollable SAN notation list with interactive navigation (⏮ ◀ ▶ ⏭) to inspect previous positions on the board.
- **Captured Pieces & Material Advantage**: Live material count and visual captured pieces tray.
- **Audio Synthesizer**: Web Audio API sound effects for moves, captures, checks, and game results with no external asset dependencies.
- **Customizable Themes**: Multiple board themes (Emerald Green, Tournament Wood, Midnight Cyber, Warm Walnut) and full Light/Dark mode support.
- **Persistence**: All settings (theme, difficulty, audio, orientation) saved to `localStorage`.

## Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Bundler**: Vite
- **Chess Logic**: Chess.js
- **Icons**: Lucide React
- **Celebration Effects**: Canvas Confetti

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

```bash
git clone https://github.com/vedant2004/mobile-chess.git
cd mobile-chess
npm install
```

### Development Server

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

## License

MIT
