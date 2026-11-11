import React, { useState } from 'react';
import { FleetVehicle, CargoItem } from '../types/logistics';
import { PackingPlan } from '../utils/calculator';
import { saveManifestToFirestore } from '../services/firebaseService';
import { X, Printer, CheckCircle2, AlertTriangle, FileText, Cloud, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fleet: FleetVehicle;
  items: CargoItem[];
  packingPlan: PackingPlan;
}

export const ManifestModal: React.FC<Props> = ({ isOpen, onClose, fleet, items, packingPlan }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [manifestDocNumber] = useState(() => `MNF-${Math.floor(100000 + Math.random() * 900000)}`);

  if (!isOpen) return null;

  const totalWeightKg = items.reduce((sum, item) => sum + item.weightKg * item.quantity, 0);
  const totalTon = (totalWeightKg / 1000).toFixed(2);
  const totalVolumeCbm = items
    .reduce((sum, item) => sum + ((item.lengthCm * item.widthCm * item.heightCm) / 1_000_000) * item.quantity, 0)
    .toFixed(2);

  const totalPieces = items.reduce((sum, item) => sum + item.quantity, 0);
  const weightPct = ((totalWeightKg / fleet.maxWeightKg) * 100).toFixed(1);
  const volumePct = ((Number(totalVolumeCbm) / fleet.nominalCbm) * 100).toFixed(1);

  const isOverweight = totalWeightKg > fleet.maxWeightKg;
  const isOvervolume = Number(totalVolumeCbm) > fleet.nominalCbm;
  const manifestDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToCloud = async () => {
    setIsSaving(true);
    try {
      await saveManifestToFirestore({
        manifestNumber: manifestDocNumber,
        fleet,
        items,
        totalWeightKg,
        totalVolumeCbm: Number(totalVolumeCbm),
        totalPieces,
        status: isOverweight ? 'overload' : 'safe',
        notes: `Pola Penumpukan: ${packingPlan.patternName}`
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 4000);
    } catch (e) {
      console.error('Save to cloud failed:', e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:m-0 print:p-0 print:border-none print:shadow-none print:w-full print:max-w-none">
        {/* Modal Top Bar (hidden during print) */}
        <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Surat Rencana Muat & Manifest Logistik
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveToCloud}
              disabled={isSaving}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition ${
                isSaved
                  ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {isSaved ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Cloud className="w-3.5 h-3.5 text-blue-500" />}
              <span>{isSaved ? 'Tersimpan di Cloud' : isSaving ? 'Menyimpan...' : 'Simpan ke Cloud'}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak / Simpan PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div className="p-8 overflow-y-auto flex-1 font-sans text-slate-900 bg-white">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl font-black uppercase tracking-wide text-slate-900">
                  SURAT PERENCANAAN MUATAN & CARGO MANIFEST
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  Sistem Validasi Kapasitas Muatan, Kubikasi (CBM), & Kepatuhan Beban Tonase ODOL
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono font-bold text-slate-800">
                  DOC: MNF-{Math.floor(100000 + Math.random() * 900000)}
                </div>
                <div className="text-xs text-slate-500">{manifestDate}</div>
              </div>
            </div>
          </div>

          {/* Vehicle Information Box */}
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-4 mb-6 text-xs grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-slate-500 uppercase text-[10px] font-semibold">Jenis Armada Truk</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{fleet.name}</div>
              <div className="text-[11px] text-slate-600 font-medium">{fleet.wheelsConfig}</div>
            </div>

            <div>
              <div className="text-slate-500 uppercase text-[10px] font-semibold">Dimensi Ruang Box</div>
              <div className="font-bold text-slate-900 font-mono text-sm mt-0.5">
                {fleet.lengthCm} × {fleet.widthCm} × {fleet.heightCm} cm
              </div>
              <div className="text-[11px] text-slate-600 font-mono">
                Volume: {fleet.minCbm} – {fleet.maxCbm} CBM
              </div>
            </div>

            <div>
              <div className="text-slate-500 uppercase text-[10px] font-semibold">Kapasitas Maksimal</div>
              <div className="font-bold text-emerald-700 text-sm mt-0.5">
                {(fleet.maxWeightKg / 1000).toFixed(2)} Ton
              </div>
              <div className="text-[11px] text-slate-600 font-mono">
                {fleet.maxWeightKg.toLocaleString('id-ID')} kg
              </div>
            </div>

            <div>
              <div className="text-slate-500 uppercase text-[10px] font-semibold">Pola Penumpukan</div>
              <div className="font-bold text-indigo-700 text-xs mt-0.5 truncate">
                {packingPlan.patternName || 'Susunan Standar'}
              </div>
              <div className="text-[11px] text-slate-600 font-mono">
                Kekuatan: {packingPlan.compressionStrengthPct}% · Stabil: {packingPlan.stabilityPct}%
              </div>
            </div>
          </div>

          {/* Cargo Details Table */}
          <div className="mb-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2">
              Rincian Barang Muatan
            </h4>
            <table className="w-full text-xs text-left border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] font-bold border-b border-slate-300">
                <tr>
                  <th className="py-2 px-3">No</th>
                  <th className="py-2 px-3">Deskripsi Barang</th>
                  <th className="py-2 px-3">Dimensi (P×L×T)</th>
                  <th className="py-2 px-3 text-right">Berat/Koli</th>
                  <th className="py-2 px-3 text-center">Jumlah (Koli)</th>
                  <th className="py-2 px-3 text-right">Total Volume</th>
                  <th className="py-2 px-3 text-right">Total Tonase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {items.map((item, idx) => {
                  const itemCbm = (
                    ((item.lengthCm * item.widthCm * item.heightCm) / 1_000_000) *
                    item.quantity
                  ).toFixed(2);
                  const itemKg = item.weightKg * item.quantity;
                  const itemTon = (itemKg / 1000).toFixed(2);

                  return (
                    <tr key={item.id}>
                      <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-sans font-semibold text-slate-900">{item.name}</td>
                      <td className="py-2 px-3 text-slate-700">
                        {item.lengthCm} × {item.widthCm} × {item.heightCm} cm
                      </td>
                      <td className="py-2 px-3 text-right text-slate-700">{item.weightKg} kg</td>
                      <td className="py-2 px-3 text-center font-bold text-slate-900">{item.quantity}</td>
                      <td className="py-2 px-3 text-right text-blue-700 font-bold">{itemCbm} CBM</td>
                      <td className="py-2 px-3 text-right text-slate-900 font-bold">
                        {itemTon} Ton ({itemKg.toLocaleString('id-ID')} kg)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-400">
                <tr>
                  <td colSpan={4} className="py-2 px-3 uppercase text-right">
                    Total Muatan Keseluruhan:
                  </td>
                  <td className="py-2 px-3 text-center font-mono">{totalPieces} Koli</td>
                  <td className="py-2 px-3 text-right font-mono text-blue-800">{totalVolumeCbm} CBM</td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-800">
                    {totalTon} Ton ({totalWeightKg.toLocaleString('id-ID')} kg)
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Summary KPI & ODOL Compliance Declaration */}
          <div className="grid grid-cols-2 gap-4 mb-8 text-xs">
            <div className="border border-slate-300 rounded-lg p-3 bg-slate-50">
              <div className="font-bold text-slate-800 mb-1">Tingkat Utilisasi Beban Armada:</div>
              <div className="space-y-1 font-mono text-slate-700">
                <div className="flex justify-between">
                  <span>Utilisasi Berat Tonase:</span>
                  <span className="font-bold">{weightPct}% (Batas: 100%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Utilisasi Kubikasi Volume:</span>
                  <span className="font-bold">{volumePct}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Barang Muat Fisik:</span>
                  <span className="font-bold">
                    {packingPlan.totalBoxesPlaced} / {totalPieces} Koli
                  </span>
                </div>
              </div>
            </div>

            <div
              className={`border rounded-lg p-3 ${
                isOverweight
                  ? 'border-rose-400 bg-rose-50 text-rose-900'
                  : 'border-emerald-400 bg-emerald-50 text-emerald-900'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 mb-1">
                {isOverweight ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    STATUS: TIDAK LULUS ODOL (OVER LOAD)
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    STATUS: LULUS REGULASI ODOL (AMAN)
                  </>
                )}
              </div>
              <p className="text-[11px] leading-tight">
                {isOverweight
                  ? `Muatan sebesar ${totalTon} Ton melebihi JBI/kapasitas armada (${(fleet.maxWeightKg / 1000).toFixed(
                      2
                    )} Ton). Wajib dikurangi atau ganti tipe armada lebih besar sebelum berangkat.`
                  : `Muatan memenuhi standar keselamatan Ditjen Perhubungan Darat. Distribusi beban stabil dan tidak melanggar batas tonase.`}
              </p>
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-300 text-xs text-center">
            <div>
              <div className="text-slate-500 mb-14 font-medium">Petugas Checker / Gudang</div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">( ........................................ )</div>
            </div>
            <div>
              <div className="text-slate-500 mb-14 font-medium">Pengemudi / Driver</div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">( ........................................ )</div>
            </div>
            <div>
              <div className="text-slate-500 mb-14 font-medium">Supervisor Logistik</div>
              <div className="border-t border-slate-400 pt-1 font-bold text-slate-800">( ........................................ )</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
