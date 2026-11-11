import React from 'react';
import { FleetVehicle, FleetFitSummary } from '../types/logistics';
import { X, CheckCircle2, AlertTriangle, Sparkles, Check, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fleets: FleetVehicle[];
  selectedFleet: FleetVehicle;
  onSelectFleet: (fleet: FleetVehicle) => void;
  summaries: FleetFitSummary[];
  totalCargoWeightKg: number;
  totalCargoVolumeCbm: number;
}

export const FleetComparisonModal: React.FC<Props> = ({
  isOpen,
  onClose,
  fleets: _fleets,
  selectedFleet,
  onSelectFleet,
  summaries,
  totalCargoWeightKg,
  totalCargoVolumeCbm
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Matriks Komparasi Kesesuaian Semua Jenis Armada
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Muatan Kargo Saat Ini: {(totalCargoWeightKg / 1000).toFixed(2)} Ton ({totalCargoWeightKg.toLocaleString('id-ID')} kg) · {totalCargoVolumeCbm.toFixed(2)} CBM
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto flex-1 p-6">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[11px] bg-slate-50/50 dark:bg-slate-950/30">
                <th className="py-3 px-3 font-semibold">Jenis Armada</th>
                <th className="py-3 px-3 font-semibold">Roda / Sumbu</th>
                <th className="py-3 px-3 font-semibold">Dimensi Box (P×L×T)</th>
                <th className="py-3 px-3 font-semibold">Kapasitas Box</th>
                <th className="py-3 px-3 font-semibold">Kapasitas Beban</th>
                <th className="py-3 px-3 font-semibold">Beban Terisi</th>
                <th className="py-3 px-3 font-semibold">Status Muat</th>
                <th className="py-3 px-3 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {summaries.map((s) => {
                const fleet = s.fleet;
                const isCurrent = fleet.id === selectedFleet.id;
                const isRec = s.status === 'recommended';

                return (
                  <tr
                    key={fleet.id}
                    className={`transition ${
                      isCurrent
                        ? 'bg-blue-50/60 dark:bg-blue-950/30 font-medium'
                        : isRec
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {fleet.name}
                        {isRec && (
                          <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded font-sans font-semibold">
                            Paling Hemat
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-sans truncate max-w-[180px]">
                        {fleet.popularUnits}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-sans">
                      {fleet.wheelsConfig}
                    </td>

                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                      {fleet.lengthCm}×{fleet.widthCm}×{fleet.heightCm} cm
                    </td>

                    <td className="py-3 px-3 text-blue-600 dark:text-blue-400">
                      {fleet.minCbm}–{fleet.maxCbm} CBM
                    </td>

                    <td className="py-3 px-3 text-emerald-600 dark:text-emerald-400">
                      {fleet.maxWeightKg >= 1000
                        ? `${fleet.maxWeightKg / 1000} Ton`
                        : `${fleet.maxWeightKg} kg`}
                    </td>

                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className={s.isOverweight ? 'text-rose-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                          {s.weightPct}% Ton
                        </span>
                        <span className={s.isOvervolume ? 'text-rose-600 font-bold text-[10px]' : 'text-slate-400 text-[10px]'}>
                          {s.volumePct}% CBM
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-sans">
                      {s.canFitAll ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isRec ? 'Rekomendasi' : 'Muat Aman'}
                        </span>
                      ) : s.isDimensionExceeded ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Dimensi Kurang
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Overload
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-sans">
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/50">
                          <Check className="w-3 h-3" /> Dipilih
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectFleet(fleet);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-xs"
                        >
                          Pilih
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between text-xs text-slate-500">
          <span>* Dimensi dan berat mengacu pada standar karoseri logistik di Indonesia.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
