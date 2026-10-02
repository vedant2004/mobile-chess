import React from 'react';
import type { Card } from '../../types/solitaire';
import { getCardColor, getSuitSymbol, getRankLabel } from '../../logic/solitaireLogic';

interface CardProps {
  card: Card;
  isSelected?: boolean;
  isDragging?: boolean;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
}

export const CardComponent: React.FC<CardProps> = React.memo(({
  card,
  isSelected = false,
  isDragging = false,
  style,
  className = '',
  onClick,
  onPointerDown,
}) => {
  const isRed = getCardColor(card.suit) === 'red';
  const symbol = getSuitSymbol(card.suit);
  const rank = getRankLabel(card.rank);

  if (!card.isFaceUp) {
    return (
      <div
        style={style}
        onClick={onClick}
        className={`w-11 sm:w-14 md:w-16 h-16 sm:h-20 md:h-24 rounded-lg md:rounded-xl shadow-md border border-indigo-900/60 bg-gradient-to-br from-indigo-700 via-blue-800 to-indigo-950 flex items-center justify-center select-none cursor-pointer overflow-hidden relative transition-all duration-150 ${className}`}
      >
        {/* Card Back Pattern */}
        <div className="absolute inset-1 rounded-md border border-indigo-400/30 flex items-center justify-center bg-indigo-900/40">
          <div className="w-5 h-5 rounded-full border border-indigo-300/40 flex items-center justify-center text-indigo-300/60 text-[10px] font-bold">
            ♠
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={style}
      onClick={onClick}
      onPointerDown={onPointerDown}
      className={`w-11 sm:w-14 md:w-16 h-16 sm:h-20 md:h-24 rounded-lg md:rounded-xl bg-white shadow-md border transition-all duration-150 select-none cursor-pointer flex flex-col justify-between p-1 sm:p-1.5 touch-none relative ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-400 -translate-y-1 z-30 shadow-lg'
          : 'border-slate-300 hover:border-slate-400'
      } ${isDragging ? 'opacity-40' : 'opacity-100'} ${className}`}
    >
      {/* Top Left Rank & Suit */}
      <div className={`flex flex-col items-center leading-none ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>
        <span className="font-extrabold text-[11px] sm:text-xs md:text-sm font-sans">{rank}</span>
        <span className="text-[10px] sm:text-xs leading-none">{symbol}</span>
      </div>

      {/* Center Large Suit Symbol */}
      <div
        className={`self-center text-base sm:text-xl md:text-2xl font-bold select-none leading-none -my-1 ${
          isRed ? 'text-rose-600' : 'text-slate-900'
        }`}
      >
        {symbol}
      </div>

      {/* Bottom Right Inverted */}
      <div
        className={`flex flex-col items-center leading-none rotate-180 self-end ${
          isRed ? 'text-rose-600' : 'text-slate-900'
        }`}
      >
        <span className="font-extrabold text-[11px] sm:text-xs md:text-sm font-sans">{rank}</span>
        <span className="text-[10px] sm:text-xs leading-none">{symbol}</span>
      </div>
    </div>
  );
});
