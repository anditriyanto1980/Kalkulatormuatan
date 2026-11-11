import React, { useState, useMemo, useEffect } from 'react';
import { DEFAULT_FLEET_VEHICLES, INITIAL_CARGO_ITEMS } from './data/fleetData';
import { FleetVehicle, CargoItem, StackingPattern } from './types/logistics';
import {
  calculateSingleItemFit,
  generatePackingPlan,
  evaluateAllFleets
} from './utils/calculator';
import { CargoVisualizer3D } from './components/CargoVisualizer3D';
import { FleetSelector } from './components/FleetSelector';
import { CargoInputForm } from './components/CargoInputForm';
import { LoadAnalysisCard } from './components/LoadAnalysisCard';
import { FleetComparisonModal } from './components/FleetComparisonModal';
import { CustomFleetModal } from './components/CustomFleetModal';
import { ManifestModal } from './components/ManifestModal';
import { OriginalImageModal } from './components/OriginalImageModal';
import { SavedManifestsModal } from './components/SavedManifestsModal';
import { StackingPatternSelector } from './components/StackingPatternSelector';
import { testFirebaseConnection, initAuthListener } from './firebase';
import { getCustomFleetsFromFirestore } from './services/firebaseService';
import {
  Truck,
  Box,
  Scale,
  Sparkles,
  FileSpreadsheet,
  HelpCircle,
  ImageIcon,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Maximize,
  Minimize,
  Cloud,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [fleets, setFleets] = useState<FleetVehicle[]>(DEFAULT_FLEET_VEHICLES);
  const [selectedFleetId, setSelectedFleetId] = useState<string>('cdd-box'); // CDD Double as balanced starting vehicle
  const [cargoItems, setCargoItems] = useState<CargoItem[]>(INITIAL_CARGO_ITEMS);
  const [selectedPattern, setSelectedPattern] = useState<StackingPattern>('column');
  const [isBrowserFullscreen, setIsBrowserFullscreen] = useState(false);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Modals state
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [isManifestOpen, setIsManifestOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isSavedManifestsOpen, setIsSavedManifestsOpen] = useState(false);

  // Initialize Firebase and load cloud data
  useEffect(() => {
    // 1. Connection check as required by Firebase skill
    testFirebaseConnection().then((connected) => {
      setIsFirebaseConnected(connected);
    });

    // 2. Auth listener for session
    const unsubscribeAuth = initAuthListener(() => {});

    // 3. Load custom fleets from Firestore
    getCustomFleetsFromFirestore().then((cloudFleets) => {
      if (cloudFleets.length > 0) {
        setFleets((prev) => {
          const existingIds = new Set(prev.map((f) => f.id));
          const uniqueNew = cloudFleets.filter((cf) => !existingIds.has(cf.id));
          return [...uniqueNew, ...prev];
        });
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Track browser fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsBrowserFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Selected vehicle object
  const selectedFleet = useMemo(() => {
    return fleets.find((f) => f.id === selectedFleetId) || fleets[0];
  }, [fleets, selectedFleetId]);

  // Overall calculations
  const packingPlan = useMemo(() => {
    return generatePackingPlan(cargoItems, selectedFleet, selectedPattern);
  }, [cargoItems, selectedFleet, selectedPattern]);

  const singleItemStacking = useMemo(() => {
    return calculateSingleItemFit(cargoItems[0] || INITIAL_CARGO_ITEMS[0], selectedFleet, selectedPattern);
  }, [cargoItems, selectedFleet, selectedPattern]);

  const fleetSummaries = useMemo(() => {
    return evaluateAllFleets(cargoItems, fleets);
  }, [cargoItems, fleets]);

  const recommendedFleetSummary = useMemo(() => {
    return fleetSummaries.find((s) => s.status === 'recommended') || null;
  }, [fleetSummaries]);

  // Total summary numbers
  const totalCargoWeightKg = useMemo(() => {
    return cargoItems.reduce((acc, it) => acc + it.weightKg * it.quantity, 0);
  }, [cargoItems]);

  const totalCargoVolumeCbm = useMemo(() => {
    return Number(
      cargoItems
        .reduce((acc, it) => acc + ((it.lengthCm * it.widthCm * it.heightCm) / 1_000_000) * it.quantity, 0)
        .toFixed(2)
    );
  }, [cargoItems]);

  const totalPiecesCount = useMemo(() => {
    return cargoItems.reduce((acc, it) => acc + it.quantity, 0);
  }, [cargoItems]);

  const isOverweight = totalCargoWeightKg > selectedFleet.maxWeightKg;
  const isOvervolume = totalCargoVolumeCbm > selectedFleet.nominalCbm;

  const handleSelectFleet = (fleet: FleetVehicle) => {
    setSelectedFleetId(fleet.id);
  };

  const handleAddCustomFleet = (newFleet: FleetVehicle) => {
    setFleets([newFleet, ...fleets]);
    setSelectedFleetId(newFleet.id);
  };

  const handleResetDefault = () => {
    setCargoItems(INITIAL_CARGO_ITEMS);
    setSelectedFleetId('cdd-box');
  };

  const handleApplyRecommended = () => {
    if (recommendedFleetSummary) {
      setSelectedFleetId(recommendedFleetSummary.fleet.id);
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 }
        });
      } catch (_e) {
        // ignore if not supported
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased font-sans flex flex-col">
      {/* Unified Professional Header */}
      <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight leading-none">
                  Kalkulator Muatan Armada Logistik
                </h1>
                <span className="hidden sm:inline-block text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 px-1.5 py-0.5 rounded">
                  CBM & Tonase
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block mt-0.5">
                Kalkulasi otomatis kapasitas kubikasi kargo, batas tonase armada, simulasi 3D dan deteksi ODOL
              </p>
            </div>
          </div>

          {/* Realtime Live Metric Ticker on Center (Proportional Desktop Placement) */}
          <div className="hidden xl:flex items-center gap-3.5 py-1.5 px-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs">
            <div className="flex items-center gap-1.5 font-mono">
              <Scale className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-slate-400 text-[11px]">Tonase:</span>
              <strong className="text-slate-900 dark:text-white">
                {(totalCargoWeightKg / 1000).toFixed(2)} Ton
              </strong>
            </div>

            <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">|</span>

            <div className="flex items-center gap-1.5 font-mono">
              <Box className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-slate-400 text-[11px]">Kubikasi:</span>
              <strong className="text-slate-900 dark:text-white">
                {totalCargoVolumeCbm} CBM
              </strong>
            </div>

            <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">|</span>

            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-slate-400 text-[11px]">Armada:</span>
              <strong className="text-slate-900 dark:text-white truncate max-w-[130px]">
                {selectedFleet.name}
              </strong>
            </div>

            <span className="text-slate-300 dark:text-slate-600" aria-hidden="true">|</span>

            <div>
              {isOverweight ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="w-3.5 h-3.5" /> Overload (ODOL)
                </span>
              ) : isOvervolume ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" /> Over Volume
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Lulus ODOL (Aman)
                </span>
              )}
            </div>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsImageModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition"
              title="Lihat Gambar Tabel Referensi Asli"
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden lg:inline">Tabel Spesifikasi Asli</span>
            </button>

            <button
              type="button"
              onClick={() => setIsComparisonOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Komparasi Semua</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSavedManifestsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 transition"
              title="Lihat Riwayat Manifest yang Tersimpan di Firebase Cloud"
            >
              <Cloud className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Manifest Cloud</span>
            </button>

            <button
              type="button"
              onClick={() => setIsManifestOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm shadow-blue-500/20"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Manifest</span>
            </button>

            <button
              type="button"
              onClick={toggleBrowserFullscreen}
              className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              title={isBrowserFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh (Full Page)'}
            >
              {isBrowserFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleResetDefault}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              title="Reset ke Nilai Awal"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Proportional Workstation Layout */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Recommended Vehicle Alert Bar (If current vehicle is not optimal) */}
        {recommendedFleetSummary && recommendedFleetSummary.fleet.id !== selectedFleet.id && (
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-transparent border border-indigo-200 dark:border-indigo-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-indigo-600 text-white rounded-lg flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-900 dark:text-white">
                  Rekomendasi Armada Paling Hemat & Efisien:{' '}
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                  {recommendedFleetSummary.fleet.name} ({recommendedFleetSummary.fleet.wheelsConfig})
                </span>
                <span className="text-slate-500 dark:text-slate-400 ml-1">
                  — Kargo {totalCargoVolumeCbm} CBM & {(totalCargoWeightKg / 1000).toFixed(2)} Ton muat optimal tanpa beban berlebih.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleApplyRecommended}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-xs whitespace-nowrap self-start sm:self-auto"
            >
              Ganti ke {recommendedFleetSummary.fleet.name} Sekarang
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Balanced 2-Column Split: Left Sidebar (Input & ODOL KPI) + Right Stage (Fleet Selector & 3D Visualizer) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column (Input Form + ODOL Load Analysis): 5 cols on lg, 4 cols on xl */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            {/* Cargo Input Form */}
            <CargoInputForm items={cargoItems} onUpdateItems={setCargoItems} />

            {/* Load Analysis & ODOL Card */}
            <LoadAnalysisCard
              fleet={selectedFleet}
              items={cargoItems}
              stackingResult={singleItemStacking}
              packingPlan={packingPlan}
              onOpenManifest={() => setIsManifestOpen(true)}
            />
          </div>

          {/* Right Column (Fleet Selector Grid + 3D Simulation): 7 cols on lg, 8 cols on xl */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {/* Fleet Selector Grid (8 Indonesian Fleets from User's Reference Table) */}
            <FleetSelector
              fleets={fleets}
              selectedFleet={selectedFleet}
              onSelectFleet={handleSelectFleet}
              fleetSummaries={fleetSummaries}
              onOpenCustomModal={() => setIsCustomOpen(true)}
              onOpenComparisonModal={() => setIsComparisonOpen(true)}
            />

            {/* Stacking Pattern Selector (5 Tipe Susunan Barang) */}
            <StackingPatternSelector
              selectedPattern={selectedPattern}
              onSelectPattern={setSelectedPattern}
            />

            {/* 3D Cargo Packing Simulator */}
            <CargoVisualizer3D
              fleet={selectedFleet}
              items={cargoItems}
              packingPlan={packingPlan}
            />
          </div>
        </div>

        {/* Informative Guidance & Indonesian Logistics Rules (Full Width Footer Block) */}
        <div className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
            <HelpCircle className="w-4 h-4 text-blue-500" />
            Pedoman Standar Muatan Barang & Karoseri Logistik Indonesia (ODOL & JBI)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 dark:text-slate-400">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">1. Rumus Kubikasi CBM</div>
              <p className="text-[11px] leading-relaxed">
                Volume kargo dihitung: <code>(P × L × T) / 1.000.000</code> dalam cm. 1 CBM setara dengan 1 meter kubik ($m^3$) ruang kargo.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">2. Batas Beban Tonase (JBI / JBM)</div>
              <p className="text-[11px] leading-relaxed">
                Muatan di atas kapasitas maksimal armada melanggar aturan ODOL (Over Loading) pada Jembatan Timbang Kemenhub RI dan membahayakan rem.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">3. Penataan Kargo Stabil (Axle Balance)</div>
              <p className="text-[11px] leading-relaxed">
                Barang berat diletakkan merata di lantai bawah dekat sumbu roda agar roda depan tidak terangkat dan kendali setir tetap presisi.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Full-Width Footer */}
      <footer className="w-full mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="w-full text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Kalkulator Muatan Armada Logistik (CBM & Tonase) · Terintegrasi spesifikasi Blind Van, Pick Up, CDE Engkel, CDD Double, CDD Long, Fuso Box, Tronton Box, dan Tronton Wingbox.
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsImageModalOpen(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Lihat Spesifikasi Tabel
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsComparisonOpen(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Matriks Komparasi Semua Armada
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <FleetComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        fleets={fleets}
        selectedFleet={selectedFleet}
        onSelectFleet={handleSelectFleet}
        summaries={fleetSummaries}
        totalCargoWeightKg={totalCargoWeightKg}
        totalCargoVolumeCbm={totalCargoVolumeCbm}
      />

      <CustomFleetModal
        isOpen={isCustomOpen}
        onClose={() => setIsCustomOpen(false)}
        onSaveCustomFleet={handleAddCustomFleet}
      />

      <ManifestModal
        isOpen={isManifestOpen}
        onClose={() => setIsManifestOpen(false)}
        fleet={selectedFleet}
        items={cargoItems}
        packingPlan={packingPlan}
      />

      <OriginalImageModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
      />

      <SavedManifestsModal
        isOpen={isSavedManifestsOpen}
        onClose={() => setIsSavedManifestsOpen(false)}
        onLoadManifest={(loadedItems, fleetId) => {
          setCargoItems(loadedItems);
          if (fleetId) {
            setSelectedFleetId(fleetId);
          }
        }}
      />
    </div>
  );
}
