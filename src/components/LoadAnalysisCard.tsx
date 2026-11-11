import React from 'react';
import { FleetVehicle, CargoItem, StackingResult } from '../types/logistics';
import { PackingPlan, calculateAxleDistribution } from '../utils/calculator';
import {
  Scale,
  Box,
  Layers,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Printer,
  Compass
} from 'lucide-react';

interface Props {
  fleet: FleetVehicle;
  items: CargoItem[];
  stackingResult: StackingResult;
  packingPlan: PackingPlan;
  onOpenManifest: () => void;
}

export const LoadAnalysisCard: React.FC<Props> = ({
  fleet,
  items,
  stackingResult: _stackingResult,
  packingPlan,
  onOpenManifest
}) => {
  const totalWeightKg = items.reduce((sum, item) => sum + item.weightKg * item.quantity, 0);
  const totalTon = Number((totalWeightKg / 1000).toFixed(2));
  const maxFleetTon = Number((fleet.maxWeightKg / 1000).toFixed(2));
  const weightPct = Number(((totalWeightKg / fleet.maxWeightKg) * 100).toFixed(1));

  const totalVolumeCbm = Number(
    items
      .reduce((sum, item) => sum + ((item.lengthCm * item.widthCm * item.heightCm) / 1_000_000) * item.quantity, 0)
      .toFixed(2)
  );
  const volumePct = Number(((totalVolumeCbm / fleet.nominalCbm) * 100).toFixed(1));

  const totalPieces = items.reduce((sum, item) => sum + item.quantity, 0);
  const axleDist = calculateAxleDistribution(fleet, packingPlan);

  // Status check
  const isOverweight = totalWeightKg > fleet.maxWeightKg;
  const isOvervolume = totalVolumeCbm > fleet.nominalCbm;
  const isPhysicalOverflow = packingPlan.totalBoxesPlaced < totalPieces;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
      {/* ODOL Safety Status Banner */}
      <div
        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
          isOverweight
            ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            : isOvervolume || isPhysicalOverflow
            ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            : weightPct > 85 || volumePct > 85
            ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-200'
            : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {isOverweight ? (
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          ) : isOvervolume || isPhysicalOverflow ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          )}

          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider">
              {isOverweight
                ? 'PERINGATAN ODOL: OVER LOADING'
                : isOvervolume || isPhysicalOverflow
                ? 'PERINGATAN: OVER VOLUME / MELEBIHI BOX'
                : weightPct > 85 || volumePct > 85
                ? 'KAPASITAS OPTIMAL PENUH (>85%)'
                : 'STATUS MUATAN: AMAN & SESUAI REGULASI'}
            </h3>
            <p className="text-[11px] opacity-90 leading-tight mt-0.5">
              {isOverweight
                ? `Total berat ${totalTon} Ton melampaui batas armada ${fleet.name} (${maxFleetTon} Ton).`
                : isOvervolume || isPhysicalOverflow
                ? `Volume kargo ${totalVolumeCbm} CBM melebihi kapasitas box ${fleet.nominalCbm} CBM.`
                : `Muatan ${totalTon} Ton (${weightPct}%) dan ${totalVolumeCbm} CBM (${volumePct}%) stabil.`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenManifest}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-xs whitespace-nowrap"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Manifest</span>
        </button>
      </div>

      {/* Main KPI Grid: Tonase, Volume, and Quantity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* KPI 1: Tonase & Berat */}
        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px]">
              <Scale className="w-3.5 h-3.5 text-emerald-500" />
              Total Tonase
            </span>
            <span
              className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isOverweight
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
              }`}
            >
              {weightPct}%
            </span>
          </div>

          <div>
            <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
              {totalTon} <span className="text-xs font-semibold text-slate-500">Ton</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              {totalWeightKg.toLocaleString('id-ID')} kg / Maks {fleet.maxWeightKg.toLocaleString('id-ID')} kg
            </div>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                isOverweight ? 'bg-rose-500' : weightPct > 85 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, weightPct)}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Volume CBM */}
        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px]">
              <Box className="w-3.5 h-3.5 text-blue-500" />
              Volume Kargo
            </span>
            <span
              className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                isOvervolume
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
              }`}
            >
              {volumePct}%
            </span>
          </div>

          <div>
            <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
              {totalVolumeCbm} <span className="text-xs font-semibold text-slate-500">CBM</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              Kapasitas: {fleet.minCbm}–{fleet.maxCbm} CBM ({fleet.nominalCbm} m³)
            </div>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                isOvervolume ? 'bg-rose-500' : volumePct > 85 ? 'bg-amber-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, volumePct)}%` }}
            />
          </div>
        </div>

        {/* KPI 3: Jumlah Koli Muat */}
        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-purple-500" />
              Muat Fisik
            </span>
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400">
              {packingPlan.totalBoxesPlaced}/{totalPieces}
            </span>
          </div>

          <div>
            <div className="text-lg font-black text-slate-900 dark:text-white font-mono">
              {packingPlan.totalBoxesPlaced} <span className="text-xs font-semibold text-slate-500">Koli</span>
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
              {fleet.lengthCm}×{fleet.widthCm}×{fleet.heightCm} cm
            </div>
          </div>

          <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500"
              style={{ width: `${Math.min(100, (packingPlan.totalBoxesPlaced / totalPieces) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Axle Load Distribution Section */}
      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <Compass className="w-3.5 h-3.5 text-indigo-500" />
            <span>Distribusi Sumbu Roda:</span>
          </div>
          <span
            className={`font-semibold text-[10px] ${
              axleDist.isBalanced
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            {axleDist.isBalanced ? '✓ Seimbang & Stabil' : '⚠ Perlu Penyesuaian'}
          </span>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
          <span>Depan: {axleDist.frontPct}%</span>
          <span>Belakang: {axleDist.rearPct}%</span>
        </div>

        <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div
            className="bg-indigo-500 h-full"
            style={{ width: `${axleDist.frontPct}%` }}
            title={`Depan: ${axleDist.frontPct}%`}
          />
          <div
            className="bg-sky-500 h-full"
            style={{ width: `${axleDist.rearPct}%` }}
            title={`Belakang: ${axleDist.rearPct}%`}
          />
        </div>
      </div>
    </div>
  );
};
