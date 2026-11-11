import React, { useState } from 'react';
import { CargoItem } from '../types/logistics';
import { CARGO_PRESETS, CargoPreset } from '../data/fleetData';
import { Package, Plus, Trash2, RotateCw, Sparkles, Box, Check } from 'lucide-react';

interface Props {
  items: CargoItem[];
  onUpdateItems: (items: CargoItem[]) => void;
}

const COLOR_PALETTE = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

export const CargoInputForm: React.FC<Props> = ({ items, onUpdateItems }) => {
  const [showPresets, setShowPresets] = useState(false);

  const handleAddItem = () => {
    const nextColor = COLOR_PALETTE[items.length % COLOR_PALETTE.length];
    const newItem: CargoItem = {
      id: `item-${Date.now()}`,
      name: `Karton Barang ${items.length + 1}`,
      lengthCm: 40,
      widthCm: 30,
      heightCm: 25,
      weightKg: 10,
      quantity: 50,
      color: nextColor,
      allowRotation: true,
      thisSideUp: false
    };
    onUpdateItems([...items, newItem]);
  };

  const handleApplyPreset = (preset: CargoPreset) => {
    const nextColor = preset.color || COLOR_PALETTE[items.length % COLOR_PALETTE.length];
    const newItem: CargoItem = {
      id: `item-${Date.now()}`,
      name: preset.name,
      lengthCm: preset.lengthCm,
      widthCm: preset.widthCm,
      heightCm: preset.heightCm,
      weightKg: preset.weightKg,
      quantity: 50,
      color: nextColor,
      allowRotation: preset.allowRotation,
      thisSideUp: preset.thisSideUp
    };
    onUpdateItems([...items, newItem]);
    setShowPresets(false);
  };

  const handleUpdateItem = (id: string, patch: Partial<CargoItem>) => {
    onUpdateItems(
      items.map((item) => {
        if (item.id === id) {
          return { ...item, ...patch };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      onUpdateItems([
        {
          id: `item-${Date.now()}`,
          name: 'Barang Muatan 1',
          lengthCm: 40,
          widthCm: 30,
          heightCm: 25,
          weightKg: 10,
          quantity: 100,
          color: '#3B82F6',
          allowRotation: true,
          thisSideUp: false
        }
      ]);
      return;
    }
    onUpdateItems(items.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
      {/* Header & Quick Action */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Input Dimensi Barang (Kargo)
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {items.length} Jenis Barang Terdaftar
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
              showPresets
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800'
            }`}
          >
            <Sparkles className="w-3 h-3 text-current" />
            <span>Preset</span>
          </button>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition shadow-xs"
          >
            <Plus className="w-3 h-3" />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* Preset Drawer / Dropdown */}
      {showPresets && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2 animate-in fade-in">
          <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Pilih Jenis Barang Standar Logistik:</span>
            <button
              type="button"
              onClick={() => setShowPresets(false)}
              className="text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Tutup
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {CARGO_PRESETS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-left p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition group flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {p.name}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  {p.lengthCm}×{p.widthCm}×{p.heightCm} cm · {p.weightKg} kg
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cargo Items List (Compact & Proportional) */}
      <div className="space-y-2.5 max-h-[380px] xl:max-h-[460px] overflow-y-auto pr-1">
        {items.map((item, index) => {
          const unitCbm = (item.lengthCm * item.widthCm * item.heightCm) / 1_000_000;
          const totalItemCbm = (unitCbm * item.quantity).toFixed(2);
          const totalItemWeightKg = (item.weightKg * item.quantity).toLocaleString('id-ID');
          const totalItemTon = ((item.weightKg * item.quantity) / 1000).toFixed(2);

          return (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 hover:border-slate-300 dark:hover:border-slate-700 transition space-y-2"
            >
              {/* Top Row: Color, Name, Rotation Toggle, Delete */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    className="w-3.5 h-3.5 rounded shadow-xs flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                    className="w-full text-xs font-semibold bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:outline-none text-slate-900 dark:text-white truncate py-0.5"
                    placeholder="Nama Barang"
                  />
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => handleUpdateItem(item.id, { allowRotation: !item.allowRotation })}
                    title={item.allowRotation ? 'Boleh dirotasi horizontal' : 'Orientasi terkunci'}
                    className={`p-1.5 rounded-lg border text-xs transition ${
                      item.allowRotation
                        ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                    title="Hapus barang"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Dimensions Input Row (P, L, T in cm) */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className="bg-white dark:bg-slate-900 rounded-lg p-1.5 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Panjang</div>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    <input
                      type="number"
                      min="1"
                      value={item.lengthCm || ''}
                      onChange={(e) =>
                        handleUpdateItem(item.id, { lengthCm: Math.max(1, Number(e.target.value) || 0) })
                      }
                      className="w-12 text-center text-xs font-bold font-mono text-slate-900 dark:text-white bg-transparent focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">cm</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-lg p-1.5 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Lebar</div>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    <input
                      type="number"
                      min="1"
                      value={item.widthCm || ''}
                      onChange={(e) =>
                        handleUpdateItem(item.id, { widthCm: Math.max(1, Number(e.target.value) || 0) })
                      }
                      className="w-12 text-center text-xs font-bold font-mono text-slate-900 dark:text-white bg-transparent focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">cm</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-lg p-1.5 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Tinggi</div>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    <input
                      type="number"
                      min="1"
                      value={item.heightCm || ''}
                      onChange={(e) =>
                        handleUpdateItem(item.id, { heightCm: Math.max(1, Number(e.target.value) || 0) })
                      }
                      className="w-12 text-center text-xs font-bold font-mono text-slate-900 dark:text-white bg-transparent focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">cm</span>
                  </div>
                </div>
              </div>

              {/* Weight, Quantity, and Calculated Subtotals */}
              <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                <div className="bg-white dark:bg-slate-900 rounded-lg p-1.5 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Berat/Koli</div>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    <input
                      type="number"
                      min="0.1"
                      step="0.5"
                      value={item.weightKg || ''}
                      onChange={(e) =>
                        handleUpdateItem(item.id, { weightKg: Math.max(0.1, Number(e.target.value) || 0) })
                      }
                      className="w-12 text-center text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-transparent focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">kg</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-lg p-1.5 border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Jumlah</div>
                  <div className="flex items-center justify-center gap-0.5 mt-0.5">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity || ''}
                      onChange={(e) =>
                        handleUpdateItem(item.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })
                      }
                      className="w-12 text-center text-xs font-bold font-mono text-blue-600 dark:text-blue-400 bg-transparent focus:outline-none"
                    />
                    <span className="text-[10px] text-slate-400">koli</span>
                  </div>
                </div>

                <div className="bg-blue-50/70 dark:bg-blue-950/40 rounded-lg p-1.5 border border-blue-200/60 dark:border-blue-900/60 text-center flex flex-col justify-center">
                  <div className="text-xs font-bold text-blue-700 dark:text-blue-300 font-mono leading-tight">
                    {totalItemCbm} CBM
                  </div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                    {totalItemTon} Ton
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
