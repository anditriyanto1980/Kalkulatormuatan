import React, { useState } from 'react';
import { FleetVehicle } from '../types/logistics';
import { X, SlidersHorizontal, Plus } from 'lucide-react';
import { saveCustomFleetToFirestore } from '../services/firebaseService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaveCustomFleet: (fleet: FleetVehicle) => void;
}

export const CustomFleetModal: React.FC<Props> = ({ isOpen, onClose, onSaveCustomFleet }) => {
  const [name, setName] = useState('Armada Custom Karoseri Khusus');
  const [wheelsConfig, setWheelsConfig] = useState('6 Roda (2 Sumbu)');
  const [lengthCm, setLengthCm] = useState(500);
  const [widthCm, setWidthCm] = useState(210);
  const [heightCm, setHeightCm] = useState(220);
  const [maxWeightKg, setMaxWeightKg] = useState(5000);
  const [popularUnits, setPopularUnits] = useState('Truk Karoseri Khusus');

  if (!isOpen) return null;

  const estimatedCbm = Number(((lengthCm * widthCm * heightCm) / 1_000_000).toFixed(1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newFleet: FleetVehicle = {
      id: `custom-${Date.now()}`,
      name,
      wheelsConfig,
      axles: wheelsConfig.includes('10') ? 3 : 2,
      lengthCm,
      widthCm,
      heightCm,
      minCbm: Math.floor(estimatedCbm * 0.85),
      maxCbm: Math.ceil(estimatedCbm),
      nominalCbm: estimatedCbm,
      minWeightKg: Math.floor(maxWeightKg * 0.8),
      maxWeightKg,
      popularUnits,
      category: 'medium_truck',
      isCustom: true
    };
    try {
      await saveCustomFleetToFirestore(newFleet);
    } catch (err) {
      console.warn('Could not save to firestore:', err);
    }
    onSaveCustomFleet(newFleet);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-500" />
            Tambah / Custom Dimensi Armada Sendiri
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nama Armada / Karoseri
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: CDD Karoseri Jumbo Box"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Konfigurasi Roda
              </label>
              <select
                value={wheelsConfig}
                onChange={(e) => setWheelsConfig(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="4 Roda">4 Roda</option>
                <option value="4 Roda (2 Sumbu)">4 Roda (2 Sumbu Engkel)</option>
                <option value="6 Roda (2 Sumbu)">6 Roda (2 Sumbu Double)</option>
                <option value="10 Roda (3 Sumbu)">10 Roda (3 Sumbu Tronton)</option>
                <option value="Trailer 4-6 Sumbu">Trailer 4-6 Sumbu</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Model / Unit Truk
              </label>
              <input
                type="text"
                value={popularUnits}
                onChange={(e) => setPopularUnits(e.target.value)}
                className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Canter / Hino 300"
              />
            </div>
          </div>

          {/* Dimensions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Dimensi Ruang Dalam Box (cm)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-slate-400">Panjang (cm)</span>
                <input
                  type="number"
                  min="50"
                  required
                  value={lengthCm}
                  onChange={(e) => setLengthCm(Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs font-bold font-mono text-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Lebar (cm)</span>
                <input
                  type="number"
                  min="50"
                  required
                  value={widthCm}
                  onChange={(e) => setWidthCm(Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs font-bold font-mono text-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400">Tinggi (cm)</span>
                <input
                  type="number"
                  min="50"
                  required
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-2 py-1.5 text-xs font-bold font-mono text-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Weight & Computed CBM */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kapasitas Berat Maksimal (kg)
              </label>
              <input
                type="number"
                min="100"
                step="100"
                required
                value={maxWeightKg}
                onChange={(e) => setMaxWeightKg(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs font-bold font-mono rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                = {(maxWeightKg / 1000).toFixed(2)} Ton
              </span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estimasi Kapasitas Volume
              </label>
              <div className="px-3 py-2 text-xs font-bold font-mono rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400">
                {estimatedCbm} CBM (m³)
              </div>
              <span className="text-[10px] text-slate-400 block mt-0.5">Dihitung otomatis (P×L×T)</span>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              Simpan & Pilih Armada
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
