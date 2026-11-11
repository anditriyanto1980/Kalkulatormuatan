import React, { useState } from 'react';
import { StackingPattern, StackingPatternInfo } from '../types/logistics';
import { STACKING_PATTERNS } from '../data/fleetData';
import { Layers, CheckCircle2, Shield, Zap, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  selectedPattern: StackingPattern;
  onSelectPattern: (pattern: StackingPattern) => void;
}

export const StackingPatternSelector: React.FC<Props> = ({ selectedPattern, onSelectPattern }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Tipe Pola Penumpukan / Susunan Barang
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Pilih metode susun untuk mengatur kalkulasi kekuatan tumpuk & kestabilan kargo di truk
            </p>
          </div>
        </div>
      </div>

      {/* Pattern Selector Cards (Horizontal Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {STACKING_PATTERNS.map((p) => {
          const isSelected = p.id === selectedPattern;
          const isExpanded = expandedId === p.id;

          return (
            <div
              key={p.id}
              onClick={() => onSelectPattern(p.id)}
              className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900'
              }`}
            >
              <div>
                {/* Title & Select status */}
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <span className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                    {p.name.split('(')[0].trim()}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  )}
                </div>

                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-tight mb-2">
                  {p.subtitle}
                </p>

                {/* Score Indicators: Strength & Stability */}
                <div className="space-y-1 text-[10px] font-mono mb-2">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Zap className="w-2.5 h-2.5 text-amber-500" />
                      Kekuatan:
                    </span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {p.compressionStrengthPct}%
                    </strong>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full"
                      style={{ width: `${p.compressionStrengthPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Shield className="w-2.5 h-2.5 text-emerald-500" />
                      Kestabilan:
                    </span>
                    <strong className="text-slate-800 dark:text-slate-200">
                      {p.stabilityPct}%
                    </strong>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${p.stabilityPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Read Info Toggle */}
              <button
                type="button"
                onClick={(e) => toggleExpand(p.id, e)}
                className="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 mt-1"
              >
                <span>{isExpanded ? 'Tutup Detail' : 'Kelebihan'}</span>
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Expanded detail card for currently expanded or active pattern */}
      {(() => {
        const activePatternInfo =
          STACKING_PATTERNS.find((p) => p.id === (expandedId || selectedPattern)) ||
          STACKING_PATTERNS[0];

        return (
          <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/60 text-xs space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-500" />
                Karakteristik {activePatternInfo.name}:
              </span>
              <span className="text-[10px] font-mono text-indigo-700 dark:text-indigo-300 font-semibold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                Cocok: {activePatternInfo.bestFor}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-600 dark:text-slate-400 pt-1">
              <div>
                <strong className="text-slate-800 dark:text-slate-200 block">Cara Susun:</strong>
                <span>{activePatternInfo.method}</span>
              </div>
              <div>
                <strong className="text-emerald-700 dark:text-emerald-400 block">Kelebihan:</strong>
                <span>{activePatternInfo.pros}</span>
              </div>
              <div>
                <strong className="text-amber-700 dark:text-amber-400 block">Kekurangan / Catatan:</strong>
                <span>{activePatternInfo.cons}</span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
