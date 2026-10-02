import React from 'react';

interface EvaluationBarProps {
  scoreCp: number; // Centipawns (positive = White, negative = Black)
  isFlipped: boolean;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({ scoreCp, isFlipped }) => {
  // Convert centipawns to winning percentage (sigmoid function)
  // 0 -> 50%, +400 -> ~75%, +1000 -> ~95%
  const winPercent = 1 / (1 + Math.exp(-scoreCp / 400));
  const whitePercent = Math.max(5, Math.min(95, winPercent * 100));
  const blackPercent = 100 - whitePercent;

  const displayScore =
    Math.abs(scoreCp) >= 90000
      ? scoreCp > 0
        ? '+M'
        : '-M'
      : (scoreCp / 100).toFixed(1);

  const formattedScore = scoreCp > 0 ? `+${displayScore}` : displayScore;

  return (
    <div
      className="hidden md:flex flex-col items-center w-6 h-[460px] md:h-[540px] rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shadow-md relative select-none"
      title={`Evaluation: ${formattedScore} (${scoreCp > 0 ? 'White advantage' : scoreCp < 0 ? 'Black advantage' : 'Equal position'})`}
    >
      {/* Black's portion (top if not flipped) */}
      <div
        className="w-full bg-slate-900 transition-all duration-300 flex items-start justify-center pt-2"
        style={{ height: `${isFlipped ? whitePercent : blackPercent}%` }}
      >
        {!isFlipped && scoreCp < -50 && (
          <span className="text-[10px] font-mono font-bold text-slate-300">
            {formattedScore}
          </span>
        )}
      </div>

      {/* White's portion (bottom if not flipped) */}
      <div
        className="w-full bg-slate-100 transition-all duration-300 flex items-end justify-center pb-2"
        style={{ height: `${isFlipped ? blackPercent : whitePercent}%` }}
      >
        {!isFlipped && scoreCp >= 0 && (
          <span className="text-[10px] font-mono font-bold text-slate-900">
            {formattedScore}
          </span>
        )}
      </div>
    </div>
  );
};
