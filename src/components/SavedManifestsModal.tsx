import React, { useEffect, useState } from 'react';
import { SavedManifestRecord, getManifestsFromFirestore, deleteManifestFromFirestore } from '../services/firebaseService';
import { FleetVehicle, CargoItem } from '../types/logistics';
import { X, Cloud, Trash2, ArrowRight, Calendar, Scale, Box, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoadManifest: (items: CargoItem[], fleetId: string) => void;
}

export const SavedManifestsModal: React.FC<Props> = ({ isOpen, onClose, onLoadManifest }) => {
  const [manifests, setManifests] = useState<SavedManifestRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchManifests = async () => {
    setLoading(true);
    try {
      const records = await getManifestsFromFirestore();
      setManifests(records);
    } catch (e) {
      console.warn('Error fetching manifests:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchManifests();
    }
  }, [isOpen]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Hapus manifest ini dari cloud?')) return;
    setDeletingId(id);
    try {
      await deleteManifestFromFirestore(id);
      setManifests((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Riwayat Rencana Muat Cloud (Firebase Firestore)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data manifest tersimpan secara real-time di database cloud Firestore
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchManifests}
              disabled={loading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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

        {/* List Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
              Memuat data dari Firebase Firestore...
            </div>
          ) : manifests.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs space-y-2">
              <Cloud className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="font-medium text-slate-600 dark:text-slate-300">Belum ada manifest yang disimpan di Cloud.</p>
              <p className="text-[11px] text-slate-400">
                Klik tombol "Simpan ke Cloud" di jendela Manifest untuk menyimpan rencana muat saat ini.
              </p>
            </div>
          ) : (
            manifests.map((m) => {
              const dateStr =
                m.createdAt instanceof Date
                  ? m.createdAt.toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : 'Baru saja';

              const isOverload = m.status === 'overload';

              return (
                <div
                  key={m.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-blue-400 dark:hover:border-blue-600 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                        {m.manifestNumber}
                      </span>
                      <span className="text-slate-400" aria-hidden="true">·</span>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {m.fleetName}
                      </span>
                      {m.wheelsConfig && (
                        <span className="text-[10px] text-slate-400 font-medium">({m.wheelsConfig})</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Scale className="w-3 h-3 text-emerald-500" />
                        {(m.totalWeightKg / 1000).toFixed(2)} Ton ({m.totalWeightKg.toLocaleString('id-ID')} kg)
                      </span>
                      <span className="flex items-center gap-1">
                        <Box className="w-3 h-3 text-blue-500" />
                        {m.totalVolumeCbm.toFixed(2)} CBM
                      </span>
                      <span>
                        {m.totalPieces} Koli ({m.items?.length || 1} jenis barang)
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{dateStr}</span>
                      <span aria-hidden="true">·</span>
                      <span className={isOverload ? 'text-rose-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                        {isOverload ? '⚠ Overload' : '✓ Sesuai ODOL'}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleDelete(m.id)}
                      disabled={deletingId === m.id}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                      title="Hapus dari Firebase"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (m.items && m.items.length > 0) {
                          onLoadManifest(m.items, m.fleetId);
                          onClose();
                        }
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-xs"
                    >
                      <span>Buka di Kalkulator</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
