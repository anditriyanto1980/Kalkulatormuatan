import React, { useState } from 'react';
import { FleetVehicle, FleetFitSummary } from '../types/logistics';
import { Truck, CheckCircle2, AlertTriangle, XCircle, Sparkles, SlidersHorizontal } from 'lucide-react';

interface Props {
  fleets: FleetVehicle[];
  selectedFleet: FleetVehicle;
  onSelectFleet: (fleet: FleetVehicle) => void;
  fleetSummaries: FleetFitSummary[];
  onOpenCustomModal: () => void;
  onOpenComparisonModal: () => void;
}

export const FleetSelector: React.FC<Props> = ({
  fleets,
  selectedFleet,
  onSelectFleet,
  fleetSummaries,
  onOpenCustomModal,
  onOpenComparisonModal
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const summaryMap = new Map<string, FleetFitSummary>();
  fleetSummaries.forEach((s) => summaryMap.set(s.fleet.id, s));

  const filteredFleets = fleets.filter((f) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'van_pickup') return f.category === 'van' || f.category === 'pickup';
    if (filterCategory === 'light') return f.category === 'light_truck';
    if (filterCategory === 'medium') return f.category === 'medium_truck';
    if (filterCategory === 'heavy') return f.category === 'heavy_truck';
    if (filterCategory === 'container') return f.category === 'container';
    return true;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
            <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Pilihan Jenis Armada Angkutan Logistik
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Sesuai standar karoseri logistik di Indonesia
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenComparisonModal}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 transition"
          >
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>Komparasi</span>
          </button>
          <button
            type="button"
            onClick={onOpenCustomModal}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
          >
            <SlidersHorizontal className="w-3 h-3 text-slate-500" />
            <span>Custom Truk</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs scrollbar-none">
        <button
          type="button"
          onClick={() => setFilterCategory('all')}
          className={`px-2.5 py-1 rounded-lg whitespace-nowrap text-xs font-medium transition ${
            filterCategory === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Semua ({fleets.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterCategory('van_pickup')}
          className={`px-2.5 py-1 rounded-lg whitespace-nowrap text-xs font-medium transition ${
            filterCategory === 'van_pickup'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Van & Pick Up
        </button>
        <button
          type="button"
          onClick={() => setFilterCategory('light')}
          className={`px-2.5 py-1 rounded-lg whitespace-nowrap text-xs font-medium transition ${
            filterCategory === 'light'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          CDE Engkel (4 Roda)
        </button>
        <button
          type="button"
          onClick={() => setFilterCategory('medium')}
          className={`px-2.5 py-1 rounded-lg whitespace-nowrap text-xs font-medium transition ${
            filterCategory === 'medium'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          CDD Double (6 Roda)
        </button>
        <button
          type="button"
          onClick={() => setFilterCategory('heavy')}
          className={`px-2.5 py-1 rounded-lg whitespace-nowrap text-xs font-medium transition ${
            filterCategory === 'heavy'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Fuso & Tronton (10 Roda)
        </button>
      </div>

      {/* Fleet Cards Grid (Proportional 4-col layout) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {filteredFleets.map((fleet) => {
          const isSelected = fleet.id === selectedFleet.id;
          const summary = summaryMap.get(fleet.id);

          return (
            <div
              key={fleet.id}
              onClick={() => onSelectFleet(fleet)}
              className={`group text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-900'
              }`}
            >
              <div>
                {/* Title & Badge */}
                <div className="flex items-start justify-between gap-1 mb-1.5">
                  <div className="min-w-0">
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {fleet.name}
                    </h3>
                    <div className="text-[10px] text-slate-400 font-medium truncate">
                      {fleet.wheelsConfig}
                    </div>
                  </div>

                  {summary?.status === 'recommended' && (
                    <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded shadow-xs flex-shrink-0">
                      Terbaik
                    </span>
                  )}
                  {summary && summary.status !== 'recommended' && (
                    <>
                      {summary.canFitAll && (
                        <span className="text-[9px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950 px-1 py-0.5 rounded flex-shrink-0">
                          Muat
                        </span>
                      )}
                      {summary.isOverweight && (
                        <span className="text-[9px] font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-1 py-0.5 rounded flex-shrink-0">
                          Overload
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Specs */}
                <div className="space-y-1 text-[11px] my-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Dimensi:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-[10px]">
                      {fleet.lengthCm}×{fleet.widthCm}×{fleet.heightCm}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Volume:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400 font-mono text-[10px]">
                      {fleet.minCbm}–{fleet.maxCbm} CBM
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span>Maks Beban:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">
                      {fleet.maxWeightKg >= 1000
                        ? `${(fleet.maxWeightKg / 1000).toLocaleString('id-ID')} Ton`
                        : `${fleet.maxWeightKg} kg`}
                    </span>
                  </div>
                </div>

                {/* Units */}
                <div className="text-[10px] text-slate-400 truncate leading-tight pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  {fleet.popularUnits.split(',')[0]}
                </div>
              </div>

              {/* Status footer */}
              <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                {isSelected ? (
                  <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Dipilih
                  </span>
                ) : (
                  <span className="text-slate-400 group-hover:text-blue-600">Pilih</span>
                )}
                {summary && (
                  <span className="font-mono text-slate-400">
                    {summary.weightPct}% Ton
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
