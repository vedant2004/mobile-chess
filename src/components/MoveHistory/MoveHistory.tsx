import React, { useEffect, useRef } from 'react';
import type { MoveRecord } from '../../types/chess';
import { ChevronFirst, ChevronLeft, ChevronRight, ChevronLast } from 'lucide-react';

interface MoveHistoryProps {
  moves: MoveRecord[];
  historyIndex: number;
  onNavigate: (target: 'first' | 'prev' | 'next' | 'last' | number) => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  moves,
  historyIndex,
  onNavigate,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Group into pairs: [ { moveNum: 1, white: MoveRecord, black?: MoveRecord } ]
  const turns: { moveNum: number; white: MoveRecord; whiteIdx: number; black?: MoveRecord; blackIdx?: number }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    const moveNum = Math.floor(i / 2) + 1;
    const white = moves[i];
    const black = moves[i + 1];
    turns.push({
      moveNum,
      white,
      whiteIdx: i,
      black,
      blackIdx: black ? i + 1 : undefined,
    });
  }

  // Auto-scroll when new move is added and in live mode
  useEffect(() => {
    if (historyIndex === -1 && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [moves.length, historyIndex]);

  const activeIndex = historyIndex === -1 ? moves.length - 1 : historyIndex;

  return (
    <div className="w-full flex flex-col bg-slate-900/70 border border-slate-800 rounded-xl overflow-hidden shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-slate-800 bg-slate-950/40">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Move History
        </span>
        <span className="text-xs text-slate-500 font-mono">
          {moves.length} {moves.length === 1 ? 'ply' : 'plies'}
        </span>
      </div>

      {/* Move List */}
      <div
        ref={scrollContainerRef}
        className="h-28 md:h-48 overflow-y-auto px-2 py-1.5 space-y-0.5 text-xs font-mono select-none scrollbar-thin scrollbar-thumb-slate-700"
      >
        {turns.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">
            Moves will appear here
          </div>
        ) : (
          turns.map((turn) => {
            const isWhiteActive = activeIndex === turn.whiteIdx;
            const isBlackActive = turn.blackIdx !== undefined && activeIndex === turn.blackIdx;

            return (
              <div
                key={turn.moveNum}
                className="grid grid-cols-[2rem_1fr_1fr] items-center py-1 px-1.5 rounded hover:bg-slate-800/40 transition-colors"
              >
                {/* Turn number */}
                <span className="text-slate-500 font-bold">{turn.moveNum}.</span>

                {/* White Move */}
                <button
                  type="button"
                  onClick={() => onNavigate(turn.whiteIdx)}
                  className={`text-left px-2 py-0.5 rounded cursor-pointer transition-all ${
                    isWhiteActive
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {turn.white.san}
                </button>

                {/* Black Move */}
                {turn.black ? (
                  <button
                    type="button"
                    onClick={() => onNavigate(turn.blackIdx!)}
                    className={`text-left px-2 py-0.5 rounded cursor-pointer transition-all ${
                      isBlackActive
                        ? 'bg-emerald-600 text-white font-bold shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {turn.black.san}
                  </button>
                ) : (
                  <span />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/60 border-t border-slate-800">
        <button
          type="button"
          disabled={moves.length === 0 || activeIndex === 0}
          onClick={() => onNavigate('first')}
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="First Move"
        >
          <ChevronFirst size={16} />
        </button>

        <button
          type="button"
          disabled={moves.length === 0 || activeIndex === 0}
          onClick={() => onNavigate('prev')}
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Previous Move"
        >
          <ChevronLeft size={16} />
        </button>

        <button
          type="button"
          disabled={moves.length === 0 || historyIndex === -1}
          onClick={() => onNavigate('next')}
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Next Move"
        >
          <ChevronRight size={16} />
        </button>

        <button
          type="button"
          disabled={moves.length === 0 || historyIndex === -1}
          onClick={() => onNavigate('last')}
          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          title="Current Live Move"
        >
          <ChevronLast size={16} />
        </button>
      </div>
    </div>
  );
};
