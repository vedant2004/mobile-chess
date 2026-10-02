import React from 'react';
import type { PieceColor, PieceType } from '../../types/chess';
import { ChessPiece } from '../pieces/PieceIcons';

interface PromotionModalProps {
  color: PieceColor;
  onSelect: (piece: PieceType) => void;
  onCancel: () => void;
}

export const PromotionModal: React.FC<PromotionModalProps> = ({
  color,
  onSelect,
  onCancel,
}) => {
  const pieces: { type: PieceType; name: string }[] = [
    { type: 'q', name: 'Queen' },
    { type: 'r', name: 'Rook' },
    { type: 'b', name: 'Bishop' },
    { type: 'n', name: 'Knight' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-xs bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <h3 className="text-center font-bold text-lg text-slate-100 mb-1">
          Pawn Promotion
        </h3>
        <p className="text-center text-xs text-slate-400 mb-5">
          Select a piece to promote your pawn
        </p>

        <div className="grid grid-cols-4 gap-2.5 mb-4">
          {pieces.map((p) => (
            <button
              key={p.type}
              onClick={() => onSelect(p.type)}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-emerald-600/30 border border-slate-700 hover:border-emerald-500 transition-all hover:scale-105 active:scale-95 group cursor-pointer"
            >
              <div className="w-12 h-12 flex items-center justify-center drop-shadow">
                <ChessPiece type={p.type} color={color} />
              </div>
              <span className="text-[11px] font-medium text-slate-300 group-hover:text-emerald-300 mt-1">
                {p.name}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
